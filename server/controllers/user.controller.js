const bcrypt = require("bcryptjs");
const User = require("../models/userlogin.model");
const UserDetails = require("../models/userdetails.model");
const BranchList = require("../models/branchlist.model");
const UserRole = require("../models/user_role.model");
const Ticket = require("../models/ticket.model");
const TicketDetails = require("../models/ticketdetails.model");
const { Op, Sequelize } = require("sequelize");
const { generateAccessToken, generateRefreshToken } = require("../utils/auth");
const Category = require("../models/category.model");

const loginUser = async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  const user = await User.findOne({
    include: [
      {
        model: UserDetails,
        as: "UserDetails",
      },
    ],
    where: {
      [Op.or]: [
        {username: usernameOrEmail},
        {"$UserDetails.user_email$": usernameOrEmail}
      ],
    },
  });

  if (user) {
    const userdetails = await UserDetails.findOne({
      where: { user_details_id: user.user_details_id },
    });
    const fullname = userdetails.fname + " " + userdetails.lname;
    const hashedPassword = await bcrypt.compare(password, user.password);
    const details = {
      userId: user.login_id,
      username: user.username,
      role: user.user_role_id,
      fullName: fullname,
      requesting_password: user.requesting_password,
    };

    if (hashedPassword) {
      const accessToken = generateAccessToken(details);
      const refreshToken = generateRefreshToken(details);
      res.cookie("access_token", accessToken, { httpOnly: true });
      res.cookie("refresh_token", refreshToken, { httpOnly: true });
      return res.status(200).json({
        message: "Login Successful",
        access_token: accessToken,
        role: details.role,
        fullname: fullname,
        requesting_password: details.requesting_password,
      });
    } else {
      return res.status(401).json({ message: "Invalid Credentials!" });
    }
  } else {
    return res.status(401).json({ message: "Invalid Credentials!" });
  }
};

const registerUser = async (req, res) => {
  const {
    firstname,
    lastname,
    contact,
    email,
    username,
    password,
    branch_code,
  } = req.body;
  let { user_role } = req.body;
  const phone = contact || '';

  try {
    if (
      !firstname ||
      !email ||
      !username ||
      !password ||
      !branch_code
    ) {
      return res.status(404).json({ message: "Field is required." });
    }

    const existingUser = await User.findOne({ where: { username } });
    const existingEmail = await UserDetails.findOne({
      where: { user_email: email },
    });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exist!" });
    } else if (existingUser) {
      return res.status(409).json({ message: "Username already exist!" });
    } else {
      if (!user_role) {
        user_role = 5;
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const userDetails = await UserDetails.create({
        fname: firstname,
        lname: lastname,
        user_contact: phone,
        user_email: email,
        profile_pic: null,
      });

      await User.create({
        username,
        password: hashedPassword,
        user_details_id: userDetails.user_details_id,
        user_role_id: user_role,
        blist_id: branch_code,
      });

      return res.status(201).json({ message: "User created." });
    }
  } catch (error) {
    console.error("Error during user registration:", error);
    return res
      .status(500)
      .json({ message: "An error occurred during user registration" });
  }
};

const updateUser = async (req, res) => {
  const userID = req.params.userID;
  const {
    firstname,
    lastname,
    contact,
    email,
    username,
    branch_code,
    user_role,
    new_pass,
    conf_pass
  } = req.body;

  try {
    const user = await User.findByPk(userID);
    const userDetails = await UserDetails.findOne({
      where: { user_details_id: user.user_details_id },
    });

    if (
      !firstname ||
      !email ||
      !username
    ) {
      return res.status(404).json({ message: "Input field required" });
    } else {
      if (email !== userDetails.user_email) {
        const existingEmail = await UserDetails.findOne({
          where: { user_email: email },
        });

        if (existingEmail) {
          return res.status(409).json({ message: "Email already exist!" });
        }
      }

      if (username !== user.username) {
        const existingUsername = await User.findOne({ where: { username } });

        if (existingUsername) {
          return res.status(409).json({ message: "Username already exist!" });
        }
      }

      await UserDetails.update(
        {
          fname: firstname,
          lname: lastname,
          user_contact: contact,
          user_email: email,
        },
        {
          where: { user_details_id: user.user_details_id },
        }
      );

      await User.update(
        {
          username,
          user_role_id: user_role,
          blist_id: branch_code,
        },
        {
          where: { login_id: userID },
        }
      );

      if(new_pass || conf_pass) {
        if ( new_pass  !== conf_pass) {
          return res.status(400).json({ message: 'Passwords do not match' });
        }
    
        const hashedPassword = await bcrypt.hash(new_pass , 10);
    
        await User.update(
          { password: hashedPassword },
          { where: { login_id: user.login_id } }
        );
    
        return res.status(200).json({ message: 'Password updated successfully' });
      }

      return res.status(200).json({ message: "User updated successfully" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating user" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["password", "user_details_id", "blist_id", "user_role_id"],
      },
      include: [
        {
          model: UserDetails,
          as: "UserDetails",
          attributes: ["fname", "lname", "user_contact", "user_email"],
        },
        {
          model: UserRole,
          as: "UserRole",
          attributes: ["role_name"],
        },
        {
          model: BranchList,
          as: "Branch",
          attributes: ["b_code", "b_name"],
        },
      ],
    });

    return res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const tableUsers = async (req, res) => {
  const userID = req.userID;
  const { search } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  try {
    const users = await User.findAndCountAll({
      include: [
        {
          model: UserDetails,
          as: "UserDetails",
        },
        {
          model: UserRole,
          as: "UserRole",
          attributes: ["role_name"],
        },
        {
          model: BranchList,
          as: "Branch",
        },
      ],
      where: {
        [Op.and]: [
          {
            login_id: {
              [Op.ne]: userID,
            },
            username: {
              [Op.ne]: "admin",
            },
          },
          {
            [Op.or]: [
              { username: { [Op.like]: `%${search}%` } },
              { "$UserDetails.fname$": { [Op.like]: `%${search}%` } },
              { "$UserDetails.lname$": { [Op.like]: `%${search}%` } },
              { "$UserDetails.user_email$": { [Op.like]: `%${search}%` } },
              { "$Branch.b_code$": { [Op.like]: `%${search}%` } },
              { "$Branch.b_name$": { [Op.like]: `%${search}%` } },
            ],
          }
        ],
      },
      limit: limit,
      offset: offset,
    });

    const usersWithBranches = await Promise.all(users.rows.map(async (user) => {
      const branches = await BranchList.findAll({
        where: {
          blist_id: {
            [Op.in]: user.blist_id.split(',').map(id => id.trim())
          },
        },
      });
      return {
        ...user.toJSON(),
        branches: branches.map(branch => branch.b_code),
      };
    }));    

    users.rows = usersWithBranches;

    return res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const deleteUser = async (req, res) => {
  const userID = req.params.userID;

  try {
    const user = await User.findByPk(userID);
    const userTicket = await Ticket.findOne({
      where: { login_id: userID }
    });
    const assignedTicket = await Ticket.findOne({
      where: { assigned_person: userID }
    });
    const automation = await Ticket.findOne({
      where: { edited_by: userID }
    });
    const approveHead = await Ticket.findOne({
      where: { approveHead: userID }
    });
    const approveAcctgStaff = await Ticket.findOne({
      where: { approveAcctgStaff: userID }
    });
    const approveAcctgSup = await Ticket.findOne({
      where: { approveAcctgSup: userID }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userTicket || assignedTicket || automation || approveHead || approveAcctgStaff || approveAcctgSup) {
      return res.status(409).json({ message: "Cannot be deleted!" });
    }

    await User.destroy({
      where: {
        login_id: userID,
      },
    });

    await UserDetails.destroy({
      where: {
        user_details_id: user.user_details_id,
      },
    });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting the user" });
  }
};

const viewUser = async (req, res) => {
  const userID = req.params.userID;

  try {
    const user = await User.findByPk(userID, {
      attributes: {
        exclude: ["user_details_id", "password", "user_role_id"],
      },
      include: [
        {
          model: UserDetails,
          as: "UserDetails",
        },
        {
          model: UserRole,
          as: "UserRole",
        },
        {
          model: BranchList,
          as: "Branch",
        },
      ],
    });

    return res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching user" });
  }
};

const getUserLogin = async (req, res) => {
  const userID = req.userID;
  try {
    const user = await User.findByPk(userID, {
      attributes: {
        exclude: [
          "username",
          "password",
          "user_details_id",
          "user_role_id",
        ],
      },
      include: [
        {
          model: UserDetails,
          as: "UserDetails",
        },
        {
          model: UserRole,
          as: "UserRole",
        }
      ],
    });

    if (user && user.blist_id) {
      // Split the branch_ids string into an array
      const branchIds = user.blist_id.split(',').map(id => parseInt(id, 10));

      // Fetch branch details based on the branchIds array
      const branches = await BranchList.findAll({
        where: {
          blist_id: branchIds
        }
      });

      // Attach branches to user object
      user.dataValues.Branches = branches;
    }

    return res.json(user);
  } catch (error) {
    console.error("Error getting user info:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while getting the user info" });
  }
};

const getAutomationUsers = async (req, res) => {
  try {
    const automation = await User.findAll({
      attributes: ["login_id"],
      include: [
        {
          model: UserDetails,
          as: "UserDetails",
        },
        {
          model: UserRole,
          as: "UserRole",
          where: {
            role_name: "Automation",
          },
        },
        {
          model: BranchList,
          as: "Branch",
        },
      ],
    });

    return res.json(automation);
  } catch (error) {
    console.error("Error getting all automation:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while getting automation users" });
  }
};

const getAutomationWithData = async (req, res) => {
  try {
    const automation = await User.findAll({
      where: {
        [Op.not]: {
          login_id: 41,
        },
      },
      attributes: ["login_id"],
      include: [
        {
          model: UserDetails,
          as: "UserDetails",
        },
        {
          model: UserRole,
          as: "UserRole",
          where: {
            role_name: "Automation",
          },
        },
        {
          model: BranchList,
          as: "Branch",
        },
      ],
    });

    const currentDate = new Date();
    const date = new Date();
    date.setDate(1);
    const lastMonthFirstDate = new Date();
    lastMonthFirstDate.setDate(1);
    lastMonthFirstDate.setMonth(currentDate.getMonth() - 1);
    const lastMonthLastDate = new Date();
    lastMonthLastDate.setDate(date.getDate() - 1);

    const formattedCurrentDate = currentDate.toISOString().split("T")[0];
    const formattedFirstDayOfMonth = date.toISOString().split("T")[0];
    const formattedLastMonthFirstDate = lastMonthFirstDate
      .toISOString()
      .split("T")[0];
    const formattedLastMonthLastDate = lastMonthLastDate
      .toISOString()
      .split("T")[0];

    // Calculate tickets this month and last month for each user
    const usersWithTickets = await Promise.all(
      automation.map(async (user) => {
        const ticketsThisMonth = await Ticket.count({
          where: {
            status: "EDITED",
            edited_by: user.login_id
          },
          include: [
            {
              model: TicketDetails,
              as: "TicketDetails",
              where: {
                date_completed: {
                  [Op.between]: [
                    formattedFirstDayOfMonth,
                    formattedCurrentDate,
                  ],
                },
              },
            },
          ],
        });

        const ticketsLastMonth = await Ticket.count({
          where: {
            status: "EDITED",
            edited_by: user.login_id
          },
          include: [
            {
              model: TicketDetails,
              as: "TicketDetails",
              where: {
                date_completed: {
                  [Op.between]: [
                    formattedLastMonthFirstDate,
                    formattedLastMonthLastDate,
                  ],
                },
              },
            },
          ],
        });

        const mostUsedCategory = await Ticket.findOne({
          attributes: [
            [
              Sequelize.col("TicketDetails.Category.category_shortcut"),
              "category",
            ],
          ],
          where: {
            status: "EDITED",
            edited_by: user.login_id
          },
          include: [
            {
              model: TicketDetails,
              as: "TicketDetails",
              attributes: [],
              where: {
                date_completed: {
                  [Op.between]: [
                    formattedFirstDayOfMonth,
                    formattedCurrentDate,
                  ],
                },
              },
              include: [
                {
                  model: Category,
                  as: "Category",
                  attributes: [],
                },
              ],
            },
          ],
          group: ["category"],
          order: [
            [
              Sequelize.fn(
                "COUNT",
                Sequelize.col("TicketDetails.ticket_category_id")
              ),
              "DESC",
            ],
          ],
          limit: 1
        });

        let percentageChange = null;
        let result = "";

        if (ticketsLastMonth !== 0) {
          percentageChange =
            ((ticketsThisMonth - ticketsLastMonth) / ticketsLastMonth) * 100;
        } else {
          percentageChange = 0;
        }

        if (ticketsThisMonth > ticketsLastMonth) {
          result = "High";
        } else {
          result = "Low";
        }

        const roundedPercentage = parseFloat(percentageChange.toFixed(2));

        if (mostUsedCategory === null) {
          return {
          ticketsThisMonth,
          ticketsLastMonth,
          roundedPercentage,
          mostUsedCategory: "",
          result,
        };
        }

        return {
          ticketsThisMonth,
          ticketsLastMonth,
          roundedPercentage,
          mostUsedCategory,
          result,
        };
      })
    );

    return res.json({
      automation: automation,
      data: usersWithTickets,
    });
  } catch (error) {
    console.error("Error getting all automation:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while getting automation users" });
  }
};

const userCount = async (req, res) => {
  try {
    const users = await User.count("login_id");
    return res.json({ totalUsers: users });
  } catch (error) {
    console.error("Error counting all users:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while counting all users" });
  }
};

const getAccountingUsers = async (req, res) => {
  try {
    const accounting = await User.findAll({
      attributes: ["login_id"],
      include: [
        {
          model: UserDetails,
          as: "UserDetails",
        },
        {
          model: UserRole,
          as: "UserRole",
          where: {
            role_name: ["Accounting Head", "Accounting Staff"]
          },
        },
        {
          model: BranchList,
          as: "Branch",
        },
      ],
    });

    return res.json(accounting);
  } catch (error) {
    console.error("Error getting all automation:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while getting automation users" });
  }
};

const getCASUsers = async (req, res) => {
  try {
    const accounting = await User.findAll({
      attributes: ["login_id"],
      include: [
        {
          model: UserDetails,
          as: "UserDetails"
        },
        {
          model: UserRole,
          as: "UserRole",
          where: {
            role_name: "CAS"
          },
        },
        {
          model: BranchList,
          as: "Branch"
        }
      ],
    });

    return res.json(accounting);
  } catch (error) {
    console.error("Error getting all CAS:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while getting CAS users" });
  }
};

const getAreaManagerUsers = async (req, res) => {
  try {
    const areaManager = await User.findAll({
      attributes: ["login_id"],
      include: [
        {
          model: UserDetails,
          as: "UserDetails",
        },
        {
          model: UserRole,
          as: "UserRole",
          where: {
            role_name: "Area Manager"
          },
        },
        {
          model: BranchList,
          as: "Branch",
        },
      ],
    });

    return res.json(areaManager);
  } catch (error) {
    console.error("Error getting all automation:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while getting automation users" });
  }
};

module.exports = {
  loginUser,
  registerUser,
  updateUser,
  getAllUsers,
  deleteUser,
  getUserLogin,
  getAutomationUsers,
  viewUser,
  userCount,
  tableUsers,
  getAutomationWithData,
  getAccountingUsers,
  getAreaManagerUsers,
  getCASUsers
};
