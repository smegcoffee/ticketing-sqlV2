const Ticket = require("../models/ticket.model");
const TicketDetails = require("../models/ticketdetails.model");
const Category = require("../models/category.model");
const User = require("../models/userlogin.model");
const UserDetails = require("../models/userdetails.model");
const UserRole = require("../models/user_role.model");
const BranchList = require("../models/branchlist.model");
const AssignedTo = require("../models/assigendto.model");
const AssignedCategory = require("../models/assignedcategory.model");
const Supplier = require("../models/supplier.model");
const AssignedCAS = require("../models/assignedCAS.model");
const AssignedAreaManager = require("../models/assignedareamanager.model");
const { Op, Sequelize, where } = require("sequelize");
const sequelize = require("../config/db.config");
const fs = require("fs");
const path = require("path");

const createTicket = async (req, res) => {
  const { category, date, reference_number, supplier, branch_id } = req.body;
  const combinedPurpose = Array.isArray(req.body.purpose)
    ? req.body.purpose
    : [req.body.purpose];

  const combinedFrom = Array.isArray(req.body.from)
    ? req.body.from
    : [req.body.from];
  const combinedTo = Array.isArray(req.body.to) ? req.body.to : [req.body.to];
  const login_id = req.userID;
  const support_file = req.files;
  const supportFileNames = support_file.map((file) => file.filename);
  console.log("SUPPORT FILES: ", supportFileNames);

  // Define a maximum number of attempts for generating a unique code
  let maxAttempts = 10;
  let ticketCode = generateUniqueTicketCode();
  let attempts = 0;
  while ((await isTicketCodeExists(ticketCode)) && attempts < maxAttempts) {
    // If the generated code already exists, generate a new one until it's unique
    ticketCode = generateUniqueTicketCode();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    // Handle the case where a unique code couldn't be generated after the maximum attempts.
    return res
      .status(500)
      .json({ message: "Unable to generate a unique ticket code" });
  }

  try {
    const user = await User.findByPk(login_id);
    const branch = await BranchList.findOne({
      where: { blist_id: branch_id },
    });
    const category_group = await AssignedCategory.findOne({
      where: { login_id: login_id },
    });
    const ticket_category = await Category.findOne({
      where: { category_name: category },
    });

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    const formattedTime = currentDate.toLocaleTimeString();

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calculate the date range for the last month
    // const lastMonthStartDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthEndDate = new Date(currentYear, currentMonth, 0 + 1);

    // Convert the provided date string to a Date object
    const inputDate = new Date(date);

    // Check if the input date falls within the last month's range
    const isLastMonth = inputDate <= lastMonthEndDate;
    console.log("LAST MONTH: ", isLastMonth);
    const assignedBranch = await AssignedTo.findOne({
      where: { blist_id: branch.blist_id },
    });
    let assign = null;

    if (!assignedBranch) {
      const assignedPerson = await User.findOne({
        include: [
          {
            model: UserDetails,
            as: "UserDetails",
          },
        ],
        where: {
          [Op.and]: [
            { user_role_id: 1 },
            { "$UserDetails.fname$": "Janice" },
            { "$UserDetails.lname$": "Legaspi" },
          ],
        },
      });

      assign = assignedPerson.login_id;
    } else {
      assign = assignedBranch.login_id;
    }

    let status = "PENDING";
    let notifStaff = 0;
    let notifHead = 0;
    let notifAccounting = 0;
    let notifAutomation = 0;
    let notifAdmin = 0;
    let notifAUTM = 0;
    let isApproved = 0;
    let displayTicket = 0;
    let isCounted = 0;
    let Answer = null;
    let appTBranchHead = null;
    let appTAccStaff = null;
    let appTAccHead = null;
    let appTAutomationHead = null;
    let appTEdited = null;
    
    if (user.user_role_id === 5) {
      notifHead = 1;
      displayTicket = 7;
    } else if (user.user_role_id === 7 && category_group.group_code === 3) {
      notifAccounting = 3;
      displayTicket = 3;
    } else if (user.user_role_id === 7 && category_group.group_code === 9) {
      notifAccounting = 20;
      displayTicket = 20;
    } else if (user.user_role_id === 7 && category_group.group_code === 10) {
      notifAccounting = 30;
      displayTicket = 30;
    } else if (isLastMonth && ticket_category.group_code === 1) {
      notifAccounting = 1;
      displayTicket = 1;
    } else if (isLastMonth && ticket_category.group_code === 2) {
      notifAccounting = 12;
      displayTicket = 12;
    } else if (ticket_category.group_code === 3) {
      notifAccounting = 13;
      displayTicket = 13;
    } else if (isLastMonth && ticket_category.group_code === 4) {
      notifAccounting = 14;
      displayTicket = 14;
    } else if (ticket_category.group_code === 5) {
      notifAccounting = 5;
      displayTicket = 5;
    } else if (ticket_category.group_code === 6) {
      notifAccounting = 6;
      displayTicket = 6;
    } else if (ticket_category.group_code === 8) {
      notifAccounting = 10;
      displayTicket = 10;
    } else if (ticket_category.group_code === 9) {
      notifAccounting = 21;
      displayTicket = 21;
    } else if (ticket_category.group_code === 10) {
      notifAccounting = 31;
      displayTicket = 31;
    } else {
      notifAUTM = 1;
      displayTicket = 100;
    }

    await sequelize.transaction(async (t) => {
      const ticketDetails = await TicketDetails.create({
        ticket_category_id: ticket_category.ticket_category_id,
        ticket_transaction_date: date,
        td_ref_number: reference_number,
        td_purpose: combinedPurpose,
        td_from: combinedFrom,
        td_to: combinedTo,
        td_note: "",
        td_support: supportFileNames,
        date_created: formattedDate,
        time: formattedTime,
        date_completed: "",
        supplier: supplier ? supplier : null,
      });

      const createdTicket = await Ticket.create({
        login_id,
        ticket_details_id: ticketDetails.ticket_details_id,
        branch_id: branch.blist_id,
        branch_name: branch.b_name,
        status,
        isCounted,
        assigned_person: assign,
        ticket_code: ticketCode,
        notifStaff,
        notifHead,
        notifAccounting,
        notifAutomation,
        notifAUTM,
        notifAdmin,
        isApproved,
        displayTicket,
        answer: Answer,
        appTBranchHead,
        appTAccStaff,
        appTAccHead,
        appTAutomationHead,
        appTEdited,
      });

      return createdTicket;
    });

    return res.status(201).json({ message: "Ticket created." });
  } catch (error) {
    console.error("Error adding ticket:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while adding ticket" });
  }
};

// Function to generate a random 6-digit code
function generateUniqueTicketCode() {
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

// Function to check if the generated ticket_code already exists
async function isTicketCodeExists(code) {
  const existingTicket = await Ticket.findOne({
    where: {
      ticket_code: code,
    },
  });
  return !!existingTicket;
}

const getAllTickets = async (req, res) => {
  const { bcode, ticket_category } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const login_id = req.userID;
  const user = await User.findByPk(login_id);
  const groups = await AssignedCategory.findAll({
    where: { login_id: login_id },
  });
  const casBranches = await AssignedCAS.findAll({
    where: { login_id: login_id },
  });
  const managerBranches = await AssignedAreaManager.findAll({
    where: { login_id: login_id },
  });
  const groupCodes = groups.map((group) => group.group_code);
  const offset = (page - 1) * limit;

  try {
    const whereClause = {};

    if (user.user_role_id === 2) {
      whereClause.assigned_person = login_id;
      whereClause.displayTicket = 8;
      whereClause.status = "PENDING";
    } else if (user.user_role_id === 9) {
      whereClause.displayTicket = {
        [Op.or]: [100, 8]  // Sequelize syntax for "displayTicket = 100 OR displayTicket = 8"
      };
      whereClause.status = "PENDING";
    } else if (user.user_role_id === 3 && groupCodes.includes(1)) {
      whereClause.displayTicket = 1;
      whereClause.status = "PENDING";
    } else if (user.user_role_id === 3 && groupCodes.includes(2)) {
      whereClause.displayTicket = 2;
      whereClause.status = "PENDING";
    } else if (user.user_role_id === 3 && groupCodes.includes(3)) {
      whereClause.displayTicket = 3;
      whereClause.status = "PENDING";
    } else if (user.user_role_id === 3 && groupCodes.includes(4)) {
      whereClause.displayTicket = 4;
      whereClause.status = "PENDING";
    } else if (user.user_role_id === 3 && groupCodes.includes(5)) {
      whereClause.displayTicket = 5;
      whereClause.status = "PENDING";
    } else if (user.user_role_id === 3 && groupCodes.includes(6)) {
      whereClause.displayTicket = 6;
      whereClause.status = "PENDING";
    } else if (user.user_role_id === 3 && groupCodes.includes(8)) {
      whereClause.displayTicket = 9;
      whereClause.status = "PENDING";
    } else if (user.user_role_id === 3 && groupCodes.includes(9)) {
      whereClause.displayTicket = 20;
      whereClause.status = "PENDING";
    } else if (user.user_role_id === 3 && groupCodes.includes(10)) {
      whereClause.displayTicket = 30;
      whereClause.status = "PENDING";
    } else if (user.user_role_id === 7 && groupCodes.includes(2)) {
      whereClause.displayTicket = 12;
      whereClause.status = "PENDING";
    } else if (user.user_role_id === 7 && groupCodes.includes(3)) {
      whereClause[Op.or] = [
        {
          [Op.and]: [
            { login_id: login_id },
            { status: ["REJECTED", "PENDING"] },
          ],
        },
        {
          [Op.and]: [{ displayTicket: 13 }, { status: "PENDING" }],
        },
      ];
    } else if (user.user_role_id === 7 && groupCodes.includes(4)) {
      whereClause.displayTicket = 14;
      whereClause.status = "PENDING";
    } else if (user.user_role_id === 7 && groupCodes.includes(8)) {
      whereClause.displayTicket = 10;
      whereClause.status = "PENDING";
    } else if (user.user_role_id === 7 && groupCodes.includes(9)) {
      whereClause[Op.or] = [
        {
          [Op.and]: [
            { login_id: login_id },
            { status: ["REJECTED", "PENDING"] },
          ],
        },
        {
          [Op.and]: [{ displayTicket: 21 }, { status: "PENDING" }],
        },
      ];
    } else if (user.user_role_id === 7 && groupCodes.includes(10)) {
      whereClause[Op.or] = [
        {
          [Op.and]: [
            { login_id: login_id },
            { status: ["REJECTED", "PENDING"] },
          ],
        },
        {
          [Op.and]: [{ displayTicket: 31 }, { status: "PENDING" }],
        },
      ];
    } else if (user.user_role_id === 4) {
      whereClause.status = ["PENDING", "REJECTED"];
      whereClause.branch_id = { [Op.in]: user.blist_id.split(",") };
    } else if (user.user_role_id === 5) {
      whereClause.status = ["REJECTED", "PENDING"];
      whereClause.login_id = login_id;
    } else if (user.user_role_id === 6) {
      whereClause.status = "PENDING";
      whereClause.branch_id = {
        [Op.in]: casBranches.map((branch) => branch.blist_id),
      };
    } else if (user.user_role_id === 8) {
      whereClause.status = "PENDING";
      whereClause.branch_id = {
        [Op.in]: managerBranches.map((branch) => branch.blist_id),
      };
    } else {
      whereClause.status = {
        [Op.notIn]: ["REJECTED", "EDITED"],
      };
    }

    if (bcode) {
      whereClause.branch_id = bcode;
    }

    if (ticket_category) {
      whereClause["$TicketDetails.ticket_category_id$"] = ticket_category;
    }

    const tickets = await Ticket.findAndCountAll({
      where: whereClause,
      attributes: {
        exclude: ["login_id", "ticket_details_id"],
      },
      include: [
        {
          model: User,
          as: "UserTicket",
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
        },
        {
          model: User,
          as: "ApproveAccountingStaff",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
              attributes: ["fname", "lname", "user_contact", "user_email"],
            },
          ],
        },
        {
          model: User,
          as: "ApproveAccountingHead",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
              attributes: ["fname", "lname", "user_contact", "user_email"],
            },
          ],
        },
        {
          model: BranchList,
          as: "Branch",
        },
        {
          model: TicketDetails,
          as: "TicketDetails",
          attributes: {
            exclude: ["ticket_category_id"],
          },
          include: [
            {
              model: Category,
              as: "Category",
              attributes: {
                exclude: ["category_shortcut"],
              },
              attributes: ["category_name"],
            },
            {
              model: Supplier,
              as: "Supplier",
            },
          ],
        },
        {
          model: User,
          as: "AssignedTicket",
          attributes: {
            exclude: [
              "username",
              "password",
              "user_details_id",
              "user_role_id",
              "blist_id",
            ],
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
        },
      ],
      limit: limit,
      offset: offset,
      order: [
        [
          Sequelize.literal(
            "STR_TO_DATE(CONCAT(`TicketDetails`.`date_created`, ' ', `TicketDetails`.`time`), '%Y-%m-%d %h:%i:%s %p')"
          ),
          "DESC",
        ],
      ],
    });

    return res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw error;
  }
};

const deleteTicket = async (req, res) => {
  const ticketID = req.params.ticketID;

  try {
    const ticket = await Ticket.findByPk(ticketID);
    4;
    const ticketDetails = await TicketDetails.findByPk(
      ticket.ticket_details_id
    );

    const filesToDeleteArray = JSON.parse(ticketDetails.td_support);

    const uploadsDir = path.join(__dirname, "../../uploads");

    filesToDeleteArray.forEach((fileName) => {
      const filePath = path.join(uploadsDir, fileName);

      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error(`File ${filePath} does not exist.`);
          return;
        }

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          } else {
            console.log(`Successfully deleted ${filePath}`);
          }
        });
      });
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await sequelize.transaction(async (t) => {
      await TicketDetails.destroy({
        where: { ticket_details_id: ticket.ticket_details_id },
        transaction: t,
      });

      await Ticket.destroy({
        where: { ticket_id: ticketID },
        transaction: t,
      });
    });

    return res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting the ticket" });
  }
};

const viewTicket = async (req, res) => {
  const ticketID = req.params.ticketID;

  try {
    const ticket = await Ticket.findByPk(ticketID, {
      attributes: {
        exclude: ["login_id", "ticket_details_id", "assigned_person"],
      },
      include: [
        {
          model: User,
          as: "UserTicket",
          attributes: {
            exclude: [
              "username",
              "password",
              "user_details_id",
              "user_role_id",
              "blist_id",
            ],
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
        },
        {
          model: BranchList,
          as: "Branch",
        },
        {
          model: User,
          as: "ApproveHead",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
              attributes: ["fname", "lname", "user_contact", "user_email"],
            },
          ],
        },
        {
          model: User,
          as: "ApproveAccountingStaff",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
              attributes: ["fname", "lname", "user_contact", "user_email"],
            },
          ],
        },
        {
          model: User,
          as: "ApproveAccountingHead",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
              attributes: ["fname", "lname", "user_contact", "user_email"],
            },
          ],
        },
        {
          model: User,
          as: "Automation",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
              attributes: ["fname", "lname", "user_contact", "user_email"],
            },
          ],
        },
        {
          model: User,
          as: "AutomationHead",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
            },
          ],
        },
        {
          model: TicketDetails,
          as: "TicketDetails",
          attributes: {
            exclude: ["ticket_category_id"],
          },
          include: [
            {
              model: Category,
              as: "Category",
            },
            {
              model: Supplier,
              as: "Supplier",
            },
          ],
        },
        {
          model: User,
          as: "AssignedTicket",
          attributes: {
            exclude: [
              "username",
              "password",
              "user_details_id",
              "user_role_id",
              "blist_id",
            ],
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
        },
      ],
    });

    return res.json(ticket);
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting the ticket" });
  }
};

const updateTicket = async (req, res) => {
  const ticketID = req.params.ticketID;
  const { status, category, date, reference_number, supplier, branchID } =
    req.body;
  const td_support = req.files; // Files uploaded for the ticket
  const { filesToDelete } = req.query;
  const support_file_names = td_support.map((file) => file.filename);

  // Get files to be deleted from query params

  // Parse filesToDelete from query parameter
  const filesToDeleteArray = filesToDelete ? JSON.parse(filesToDelete) : [];

  const uploadsDir = path.join(__dirname, "../../uploads");

  filesToDeleteArray.forEach((fileName) => {
    const filePath = path.join(uploadsDir, fileName);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`File ${filePath} does not exist.`);
        return;
      }

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log(`Successfully deleted ${filePath}`);
        }
      });
    });
  });

  const combinedPurpose = Array.isArray(req.body.purpose)
    ? req.body.purpose
    : [req.body.purpose];

  const combinedFrom = Array.isArray(req.body.from)
    ? req.body.from
    : [req.body.from];
  const combinedTo = Array.isArray(req.body.to) ? req.body.to : [req.body.to];
  try {
    const ticket = await Ticket.findByPk(ticketID);
    const ticketDetails = await TicketDetails.findByPk(
      ticket.ticket_details_id
    );
    const categoryID = await Category.findOne({
      where: { category_name: category },
    });
    const branch = await BranchList.findByPk(branchID);
    console.log("SUPPORT FILES: ", support_file_names);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastMonthEndDate = new Date(currentYear, currentMonth, 0 + 1);
    const inputDate = new Date(ticketDetails.ticket_transaction_date);
    const isLastMonth = inputDate <= lastMonthEndDate;

    let notifStaff = ticket.notifStaff;
    let notifHead = ticket.notifHead;
    let notifAccounting = ticket.notifAccounting;
    let notifAutomation = ticket.notifAutomation;
    let notifAdmin = ticket.notifAdmin;
    let displayTicket = ticket.displayTicket;

    await Ticket.update(
      {
        status,
        notifStaff,
        notifHead,
        notifAccounting,
        notifAutomation,
        notifAdmin,
        displayTicket,
        branch_id: branchID,
        branch_name: branch.b_name,
      },
      {
        where: { ticket_id: ticketID },
      }
    );

    await TicketDetails.update(
      {
        ticket_category_id: categoryID
          ? categoryID.ticket_category_id
          : ticketDetails.ticket_category_id,
        ticket_transaction_date: date,
        td_ref_number: reference_number,
        td_purpose: combinedPurpose,
        td_from: combinedFrom,
        td_to: combinedTo,
        td_support: support_file_names,
        supplier: supplier ? supplier : null,
      },
      {
        where: { ticket_details_id: ticketDetails.ticket_details_id },
      }
    );

    return res.status(200).json({ message: "Successfully changed" });
  } catch (error) {
    console.error("Error saving ticket:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while saving the ticket" });
  }
};

const assignedAutomation = async (req, res) => {
  const ticketID = req.params.ticketID;
  const { userID } = req.body;

  try {
    const ticket = await Ticket.findByPk(ticketID);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await Ticket.update(
      {
        assigned_person: userID,
      },
      {
        where: { ticket_id: ticketID },
      }
    );

    return res
      .status(200)
      .json({ message: "Successfully assigned to other automation" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting the ticket" });
  }
};

const returnToAutomation = async (req, res) => {
  const ticketID = req.params.ticketID;

  try {
    const ticket = await Ticket.findByPk(ticketID);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await Ticket.update(
      {
        status: "PENDING",
        edited_by: null,
        notifStaff: 0,
        notifHead: 0,
        notifAccounting: 0,
        appTEdited: null,
      },
      {
        where: { ticket_id: ticketID },
      }
    );

    return res
      .status(200)
      .json({ message: "Ticket successfully returned to automation" });
  } catch (error) {
    console.error("Error returning ticket to automation:", error);
    return res.status(500).json({
      message: "An error occurred while returning ticket to automation",
    });
  }
};

const setCount = async (req, res) => {
  const ticketID = req.params.ticketID;

  try {
    const ticket = await Ticket.findByPk(ticketID);
    let count = 0;

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.isCounted === 0) {
      count = 1;
    }

    await Ticket.update(
      {
        isCounted: count,
      },
      {
        where: { ticket_id: ticketID },
      }
    );

    return res.status(200).json({ message: "Ticket successfully updated" });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating ticket" });
  }
};

const getAllCompletedTickets = async (req, res) => {
  const {
    bcode,
    ticket_category,
    branch_category,
    startDate,
    endDate,
    page,
    limit,
  } = req.query;
  const userRole = req.role;
  const userID = req.userID;
  const user = await User.findByPk(userID);
  const casBranches = await AssignedCAS.findAll({
    where: { login_id: userID },
  });
  const managerBranches = await AssignedAreaManager.findAll({
    where: { login_id: userID },
  });

  // Ensure page and limit are integers
  const pageNumber = parseInt(page) || 1;
  const pageLimit = parseInt(limit) || 20;
  try {
    let ticket = 0;
    let groupedTicketsQueryOptions = {
      attributes: [
        [Sequelize.col("ticket_code"), "ticket_code"],
        [Sequelize.col("branch_name"), "branch_name"],
        [Sequelize.col("isCounted"), "counted"],
        [Sequelize.col("Branch.b_code"), "branch_code"],
        [Sequelize.col("Branch.category"), "branch_category"],
        [
          Sequelize.col("TicketDetails.Category.category_name"),
          "category_name",
        ],
        [
          Sequelize.col("TicketDetails.Category.category_shortcut"),
          "category_shortcut",
        ],
        [Sequelize.fn("COUNT", Sequelize.col("ticket_id")), "ticket_count"],
      ],
      include: [
        {
          model: BranchList,
          as: "Branch",
        },
        {
          model: TicketDetails,
          as: "TicketDetails",
          include: [
            {
              model: Category,
              as: "Category",
            },
          ],
        },
      ],
      group: [
        "branch_name",
        "Branch.b_code",
        "Branch.category",
        "TicketDetails.Category.category_name",
        "TicketDetails.Category.category_shortcut",
        "isCounted",
      ],
    };

    if (bcode === "" && ticket_category === "" && branch_category === "") {
      if (userRole === 1) {
        groupedTicketsQueryOptions.where = {
          $status$: "EDITED",
        };
      } else if (userRole === 2) {
        groupedTicketsQueryOptions.where = {
          $status$: "EDITED",
          edited_by: userID,
        };
      } else if (userRole === 3) {
        groupedTicketsQueryOptions.where = {
          $status$: "EDITED",
          approveAcctgSup: userID,
        };
      } else if (userRole === 4) {
        groupedTicketsQueryOptions.where = {
          $status$: "EDITED",
          branch_id: { [Op.in]: user.blist_id.split(",") },
        };
      } else if (userRole === 5) {
        groupedTicketsQueryOptions.where = {
          $status$: "EDITED",
          login_id: userID,
        };
      } else if (userRole === 6) {
        groupedTicketsQueryOptions.where = {
          $status$: "EDITED",
          branch_id: { [Op.in]: casBranches.map((branch) => branch.blist_id) },
        };
      } else if (userRole === 7) {
        groupedTicketsQueryOptions.where = {
          $status$: "EDITED",
          approveAcctgStaff: userID,
          login_id: userID,
        };
      } else {
        groupedTicketsQueryOptions.where = {
          $status$: "EDITED",
          branch_id: {
            [Op.in]: managerBranches.map((branch) => branch.blist_id),
          },
        };
      }
    } else {
      let whereClause = {
        $status$: "EDITED",
      };

      if (userRole === 2) {
        whereClause.edited_by = userID;
      } else if (userRole === 3) {
        whereClause.approveAcctgSup = userID;
      } else if (userRole === 4) {
        whereClause.branch_id = { [Op.in]: user.blist_id.split(",") };
      } else if (userRole === 5) {
        whereClause.login_id = userID;
      } else if (userRole === 6) {
        whereClause.branch_id = {
          [Op.in]: casBranches.map((branch) => branch.blist_id),
        };
      } else if (userRole === 7) {
        whereClause = {
          [Op.or]: [{ approveAcctgStaff: userID }, { login_id: userID }],
        };
      } else if (userRole === 8) {
        whereClause.branch_id = {
          [Op.in]: managerBranches.map((branch) => branch.blist_id),
        };
      }

      if (bcode) {
        whereClause.branch_id = bcode;
      }
      if (ticket_category) {
        whereClause["$TicketDetails.Category.ticket_category_id$"] =
          ticket_category;
      }
      if (branch_category) {
        whereClause["$Branch.category$"] = branch_category;
      }
      if (startDate && endDate) {
        const startdate = new Date(startDate);
        const enddate = new Date(endDate);
        const formattedStartDate = startdate.toISOString().split("T")[0];
        const formattedEndDate = enddate.toISOString().split("T")[0];
        whereClause["$TicketDetails.date_completed$"] = {
          [Sequelize.Op.between]: [formattedStartDate, formattedEndDate],
        };
      }

      groupedTicketsQueryOptions.where = whereClause;
    }
    ticket = (await Ticket.count(groupedTicketsQueryOptions)).length;
    // Add pagination options
    groupedTicketsQueryOptions.offset = (pageNumber - 1) * pageLimit;
    groupedTicketsQueryOptions.limit = pageLimit;

    const groupedTickets = await Ticket.findAll(groupedTicketsQueryOptions);

    return res.json({ data: groupedTickets, count: ticket });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching tickets" });
  }
};

const viewReports = async (req, res) => {
  const { bcode, category, counted, startDate, endDate } = req.query;
  const startdate = new Date(startDate);
  const enddate = new Date(endDate);
  const formattedStartDate = startdate.toISOString().split("T")[0];
  const formattedEndDate = enddate.toISOString().split("T")[0];
  try {
    const ticketReports = await Ticket.findAll({
      include: [
        {
          model: TicketDetails,
          as: "TicketDetails",
          include: [
            {
              model: Category,
              as: "Category",
            },
          ],
        },
        {
          model: BranchList,
          as: "Branch",
        },
        {
          model: User,
          as: "UserTicket",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
            },
          ],
        },
        {
          model: User,
          as: "Automation",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
            },
          ],
        },
        {
          model: User,
          as: "AutomationHead",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
            },
          ]
        },
        {
          model: User,
          as: "ApproveHead",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
            },
          ],
        },
        {
          model: User,
          as: "ApproveAccountingStaff",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
            },
          ],
        },
        {
          model: User,
          as: "ApproveAccountingHead",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
            },
          ],
        },
      ],
      where: {
        "$Branch.b_code$": bcode,
        "$TicketDetails.Category.category_shortcut$": category,
        $status$: "EDITED",
        $isCounted$: counted,
        "$TicketDetails.date_completed$": {
          [Sequelize.Op.between]: [formattedStartDate, formattedEndDate],
        },
      },
    });

    return res.json(ticketReports);
  } catch (error) {
    console.error("Error fetching reports", error);
  }
};

const getReports = async (req, res) => {
  const { bcode, branch_category, category, startDate, endDate } = req.query;
  const userRole = req.role;
  const userID = req.userID;
  const user = await User.findByPk(userID);
  const startdate = new Date(startDate);
  const enddate = new Date(endDate);
  const formattedStartDate = startdate.toISOString().split("T")[0];
  const formattedEndDate = enddate.toISOString().split("T")[0];
  const casBranches = await AssignedCAS.findAll({
    where: { login_id: userID },
  });
  const managerBranches = await AssignedAreaManager.findAll({
    where: { login_id: userID },
  });
  try {
    const whereClause = {
      "$TicketDetails.date_completed$": {
        [Sequelize.Op.between]: [formattedStartDate, formattedEndDate],
      },
      status: "EDITED",
    };

    if (bcode) {
      whereClause["$Branch.blist_id$"] = bcode;
    }

    if (category) {
      whereClause["$TicketDetails.Category.ticket_category_id$"] = category;
    }

    if (branch_category) {
      whereClause["$Branch.category$"] = branch_category;
    }

    if (userRole === 2) {
      whereClause.edited_by = userID;
    } else if (userRole === 3) {
      whereClause.approveAcctgSup = userID;
    } else if (userRole === 4) {
      whereClause.branch_id = { [Op.in]: user.blist_id.split(",") };
    } else if (userRole === 5) {
      whereClause.login_id = userID;
    } else if (userRole === 6) {
      whereClause.branch_id = {
        [Op.in]: casBranches.map((branch) => branch.blist_id),
      };
    } else if (userRole === 7) {
      whereClause.approveAcctgStaff = userID;
    } else if (userRole === 8) {
      whereClause.branch_id = {
        [Op.in]: managerBranches.map((branch) => branch.blist_id),
      };
    }

    const ticketReports = await Ticket.findAndCountAll({
      include: [
        {
          model: TicketDetails,
          as: "TicketDetails",
          include: [
            {
              model: Category,
              as: "Category",
            },
          ],
        },
        {
          model: BranchList,
          as: "Branch",
        },
        {
          model: User,
          as: "UserTicket",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
            },
          ],
        },
        {
          model: User,
          as: "Automation",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
            },
          ],
        },
        {
          model: User,
          as: "ApproveHead",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
            },
          ],
        },
        {
          model: User,
          as: "ApproveAccountingStaff",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
            },
          ],
        },
        {
          model: User,
          as: "ApproveAccountingHead",
          include: [
            {
              model: UserDetails,
              as: "UserDetails",
            },
          ],
        },
      ],
      where: whereClause,
      order: [["Branch", "b_name", "ASC"]],
    });

    return res.json(ticketReports);
  } catch (error) {
    console.error("Error fetching reports", error);
  }
};

const getAllTicketStatus = async (req, res) => {
  try {
    const distinctStatus = await Ticket.findAll({
      attributes: ["status"],
      group: ["status"],
    });

    const status = distinctStatus.map((item) => item.status);

    return res.json(status);
  } catch (error) {
    console.error("Error fetching status:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching status" });
  }
};

const updateApproved = async (req, res) => {
  const ticketId = req.params.ticketID;

  try {
    await Ticket.update(
      {
        displayTicket: 8,
        notifAutomation: 1,
        notifAdmin: 1,
      },
      {
        where: { ticket_id: ticketId },
      }
    );

    return res.status(200).json({ message: "Redirected to Automation" });
  } catch (error) {
    console.error("Error updating ticket approval status:", error);
    return res.status(500).json({
      error: "An error occurred while updating the ticket approval status",
    });
  }
};

const updateTicketStatus = async (req, res) => {
  const ticketId = req.params.ticketID;
  const userID = req.userID;
  const { note, status, isCheckboxChecked } = req.body;
  const user = await User.findByPk(userID);

  try {
    const ticket = await Ticket.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const ticketDetails = await TicketDetails.findByPk(
      ticket.ticket_details_id
    );
    const tixCategory = await Category.findByPk(
      ticketDetails.ticket_category_id
    );

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const lastMonthEndDate = new Date(currentYear, currentMonth, 0 + 1);

    const inputDate = new Date(ticketDetails.ticket_transaction_date);

    const isLastMonth = inputDate <= lastMonthEndDate;
    console.log("LAST MONTH APPROVED: ", isLastMonth);

    const currentDateTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Manila",
    });

    let notifStaff = ticket.notifStaff;
    let notifHead = ticket.notifHead;
    let notifAccounting = ticket.notifAccounting;
    let notifAutomation = ticket.notifAutomation;
    let notifAUTM = ticket.notifAUTM;
    let notifAdmin = ticket.notifAdmin;
    let stat = ticket.status;
    let isApproved = ticket.isApproved;
    let edited_by = ticket.edited_by;
    let isCounted = ticket.isCounted;
    let displayTicket = ticket.displayTicket;
    let date_completed = ticket.date_completed;
    let approveHead = ticket.approveHead;
    let approveAcctgStaff = ticket.approveAcctgStaff;
    let approveAcctgSup = ticket.approveAcctgSup;
    let approveAutm = ticket.approveAutm;
    let appTBranchHead = ticket.appTBranchHead;
    let appTAccStaff = ticket.appTAccStaff;
    let appTAccHead = ticket.appTAccHead;
    let appTAutomationHead = ticket.appTAutomationHead;
    let appTEdited = ticket.appTEdited;

    if (status === "APPROVED") {
      if (user.user_role_id === 4) {
        if (isLastMonth && tixCategory.group_code === 1) {
          notifAccounting = 1;
          displayTicket = 1;
        } else if (isLastMonth && tixCategory.group_code === 2) {
          notifAccounting = 12;
          displayTicket = 12;
        } else if (tixCategory.group_code === 3) {
          notifAccounting = 13;
          displayTicket = 13;
        } else if (isLastMonth && tixCategory.group_code === 4) {
          notifAccounting = 14;
          displayTicket = 14;
        } else if (tixCategory.group_code === 5) {
          notifAccounting = 5;
          displayTicket = 5;
        } else if (tixCategory.group_code === 6) {
          notifAccounting = 6;
          displayTicket = 6;
        } else if (tixCategory.group_code === 8) {
          notifAccounting = 9;
          displayTicket = 10;
        } else if (tixCategory.group_code === 9) {
          notifAccounting = 21;
          displayTicket = 21;
        } else if (tixCategory.group_code === 10) {
          notifAccounting = 31;
          displayTicket = 31;
        } else if (tixCategory.group_code === 10) {
          notifAccounting = 31;
          displayTicket = 31;
        }  else {
          notifAUTM = 1;
          displayTicket = 100;
        }
        approveHead = userID;
        appTBranchHead = currentDateTime;
      } else if (user.user_role_id === 7 && tixCategory.group_code === 2) {
        displayTicket = 2;
        notifAccounting = 2;
        approveAcctgStaff = userID;
        appTAccStaff = currentDateTime;
      } else if (user.user_role_id === 7 && tixCategory.group_code === 3) {
        displayTicket = 3;
        notifAccounting = 3;
        approveAcctgStaff = userID;
        appTAccStaff = currentDateTime;
      } else if (user.user_role_id === 7 && tixCategory.group_code === 4) {
        displayTicket = 4;
        notifAccounting = 4;
        approveAcctgStaff = userID;
        appTAccStaff = currentDateTime;
      } else if (user.user_role_id === 7 && tixCategory.group_code === 8) {
        displayTicket = 9;
        notifAccounting = 9;
        approveAcctgStaff = userID;
        appTAccStaff = currentDateTime;
      } else if (user.user_role_id === 7 && tixCategory.group_code === 9) {
        displayTicket = 20;
        notifAccounting = 20;
        approveAcctgStaff = userID;
        appTAccStaff = currentDateTime;
      } else if (user.user_role_id === 7 && tixCategory.group_code === 10) {
        displayTicket = 30;
        notifAccounting = 30;
        approveAcctgStaff = userID;
        appTAccStaff = currentDateTime;
      } else if ( user.user_role_id === 3 && tixCategory.group_code >= 1 && tixCategory.group_code <= 10) {
        notifAUTM = 1;
        displayTicket = 100;
        // notifHead = 5;
        // notifStaff = 6;
        approveAcctgSup = userID;
        appTAccHead = currentDateTime;
      } else if ( user.user_role_id === 9 ) {
        notifAutomation = 1;
        notifAdmin = 1;
        displayTicket = 8;
        approveAutm = userID;
        appTAutomationHead = currentDateTime;
      }
    } else if ( status === "EDITED" && (user.user_role_id === 1 || user.user_role_id === 2) ) {
      notifStaff = 5;
      notifHead = 4;
      // notifAccounting = 8;
      stat = "EDITED";
      edited_by = userID;
      date_completed = formattedDate;
      appTEdited = currentDateTime;
      if (isCheckboxChecked === true) {
        isCounted = 1;
      } else {
        isCounted = 0;
      }
    } else if (status === "REJECTED") {
      if (user.user_role_id === 1 || user.user_role_id === 2) {
        notifStaff = 4;
        notifHead = 3;
        notifAccounting = 7;
        stat = "REJECTED";
      } else if (user.user_role_id === 3) {
        notifStaff = 3;
        notifHead = 2;
        stat = "REJECTED";
      } else if (user.user_role_id === 4) {
        notifStaff = 2;
        stat = "REJECTED";
      } else if (user.user_role_id === 7) {
        notifStaff = 3;
        notifHead = 2;
        stat = "REJECTED";
      } else if (user.user_role_id === 9) {
        notifStaff = 4;
        notifHead = 3;
        stat = "REJECTED";
      }
    }

    await Ticket.update(
      {
        notifStaff,
        notifHead,
        notifAccounting,
        notifAutomation,
        notifAdmin,
        notifAUTM,
        status: stat,
        isApproved,
        edited_by,
        isCounted,
        displayTicket,
        approveHead,
        approveAcctgStaff,
        approveAcctgSup,
        approveAutm,
        appTBranchHead,
        appTAccStaff,
        appTAccHead,
        appTAutomationHead,
        appTEdited,
      },
      {
        where: {
          ticket_id: ticketId,
        },
      }
    );

    await TicketDetails.update(
      {
        td_note: note,
        date_completed,
      },
      {
        where: {
          ticket_details_id: ticket.ticket_details_id,
        },
      }
    );

    return res
      .status(200)
      .json({ message: "Ticket status updated successfully" });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating the ticket status" });
  }
};

const ticketCount = async (req, res) => {
  const userRole = req.role;
  const userID = req.userID;
  const user = await User.findByPk(userID);
  const casBranches = await AssignedCAS.findAll({
    where: { login_id: userID },
  });
  const managerBranches = await AssignedAreaManager.findAll({
    where: { login_id: userID },
  });
  try {
    // Get the current date
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

    const whereClause = {
      "$TicketDetails.date_completed$": {
        [Sequelize.Op.between]: [
          formattedFirstDayOfMonth,
          formattedCurrentDate,
        ],
      },
      status: "EDITED",
    };

    const whereClauseLastMonth = {
      "$TicketDetails.date_completed$": {
        [Sequelize.Op.between]: [
          formattedLastMonthFirstDate,
          formattedLastMonthLastDate,
        ],
      },
      status: "EDITED",
    };

    if (userRole === 2) {
      whereClause.edited_by = userID;
      whereClauseLastMonth.edited_by = userID;
    } else if (userRole === 3) {
      whereClause.approveAcctgSup = userID;
      whereClauseLastMonth.approveAcctgSup = userID;
    } else if (userRole === 4) {
      whereClause.branch_id = { [Op.in]: user.blist_id.split(",") };
      whereClauseLastMonth.branch_id = { [Op.in]: user.blist_id.split(",") };
    } else if (userRole === 5) {
      whereClause.login_id = userID;
      whereClauseLastMonth.login_id = userID;
    } else if (userRole === 6) {
      whereClause.branch_id = {
        [Op.in]: casBranches.map((branch) => branch.blist_id),
      };
      whereClauseLastMonth.branch_id = {
        [Op.in]: casBranches.map((branch) => branch.blist_id),
      };
    } else if (userRole === 7) {
      whereClause.approveAcctgStaff = userID;
      whereClauseLastMonth.approveAcctgStaff = userID;
    } else if (userRole === 8) {
      whereClause.branch_id = {
        [Op.in]: managerBranches.map((branch) => branch.blist_id),
      };
      whereClauseLastMonth.branch_id = {
        [Op.in]: managerBranches.map((branch) => branch.blist_id),
      };
    }

    const tickets = await Ticket.count({
      where: whereClause,
      include: [
        {
          model: TicketDetails,
          as: "TicketDetails",
        },
      ],
    });

    const ticketsLastMonth = await Ticket.count({
      where: whereClauseLastMonth,
      include: [
        {
          model: TicketDetails,
          as: "TicketDetails",
        },
      ],
    });

    let percentageChange = null;

    if (ticketsLastMonth !== 0) {
      percentageChange =
        ((tickets - ticketsLastMonth) / ticketsLastMonth) * 100;
    } else {
      percentageChange = 0;
    }

    const roundedPercentage = parseFloat(percentageChange.toFixed(2));
    return res.json({
      ticketsThisMonth: tickets,
      ticketsLastMonth: ticketsLastMonth,
      percentageThanLastMonth: roundedPercentage,
    });
  } catch (error) {
    console.error("Error counting all tickets:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while counting all tickets" });
  }
};

const ticketCountsThisWeek = async (req, res) => {
  const userRole = req.role;
  const userID = req.userID;
  const user = await User.findByPk(userID);
  const casBranches = await AssignedCAS.findAll({
    where: { login_id: userID },
  });
  const managerBranches = await AssignedAreaManager.findAll({
    where: { login_id: userID },
  });

  try {
    const whereClause = {
      status: {
        [Op.eq]: ["EDITED"],
      },
    };

    if (userRole === 2) {
      whereClause.edited_by = userID;
    } else if (userRole === 3) {
      whereClause.approveAcctgSup = userID;
    } else if (userRole === 4) {
      whereClause.branch_id = { [Op.in]: user.blist_id.split(",") };
    } else if (userRole === 5) {
      whereClause.login_id = userID;
    } else if (userRole === 6) {
      whereClause.branch_id = {
        [Op.in]: casBranches.map((branch) => branch.blist_id),
      };
    } else if (userRole === 7) {
      whereClause.approveAcctgStaff = userID;
    } else if (userRole === 8) {
      whereClause.branch_id = {
        [Op.in]: managerBranches.map((branch) => branch.blist_id),
      };
    }

    // Get the current date
    const currentDate = new Date();
    const currentDay = currentDate.getDay();

    // Calculate the date range for the current week
    const firstDayOfWeek = new Date(currentDate);
    firstDayOfWeek.setDate(currentDate.getDate() - currentDay);

    const lastDayOfWeek = new Date(currentDate);
    lastDayOfWeek.setDate(currentDate.getDate() + (6 - currentDay));

    const formattedFirstDayOfWeek = firstDayOfWeek.toISOString().split("T")[0];
    const formattedLastDayOfWeek = lastDayOfWeek.toISOString().split("T")[0];

    const ticketsThisWeek = await Ticket.count({
      where: whereClause,
      include: [
        {
          model: TicketDetails,
          as: "TicketDetails",
          where: {
            date_completed: {
              [Op.between]: [formattedFirstDayOfWeek, formattedLastDayOfWeek],
            },
          },
        },
      ],
    });

    // Calculate the date range for the last week
    const firstDayOfLastWeek = new Date(firstDayOfWeek);
    firstDayOfLastWeek.setDate(firstDayOfWeek.getDate() - 7);

    const lastDayOfLastWeek = new Date(lastDayOfWeek);
    lastDayOfLastWeek.setDate(lastDayOfWeek.getDate() - 7);

    const formattedFirstDayOfLastWeek = firstDayOfLastWeek
      .toISOString()
      .split("T")[0];
    const formattedLastDayOfLastWeek = lastDayOfLastWeek
      .toISOString()
      .split("T")[0];

    const ticketsLastWeek = await Ticket.count({
      where: whereClause,
      include: [
        {
          model: TicketDetails,
          as: "TicketDetails",
          where: {
            date_completed: {
              [Op.between]: [
                formattedFirstDayOfLastWeek,
                formattedLastDayOfLastWeek,
              ],
            },
          },
        },
      ],
    });

    let percentageChange = null;

    if (ticketsLastWeek !== 0) {
      percentageChange =
        ((ticketsThisWeek - ticketsLastWeek) / ticketsLastWeek) * 100;
    } else {
      percentageChange = 0;
    }

    const roundedPercentage = parseFloat(percentageChange.toFixed(2));

    return res.json({
      ticketsThisWeek: ticketsThisWeek,
      ticketsLastWeek: ticketsLastWeek,
      percentageThanLastWeek: roundedPercentage,
    });
  } catch (error) {
    console.error("Error counting tickets for this week:", error);
    return res.status(500).json({
      message: "An error occurred while counting tickets for this week",
    });
  }
};

const ticketPendingCountsToday = async (req, res) => {
  const userRole = req.role;
  const userID = req.userID;
  const user = await User.findByPk(userID);
  const groups = await AssignedCategory.findAll({
    where: { login_id: userID },
  });
  const groupCodes = groups.map((group) => group.group_code);
  const casBranches = await AssignedCAS.findAll({
    where: { login_id: userID },
  });
  const managerBranches = await AssignedAreaManager.findAll({
    where: { login_id: userID },
  });

  try {
    const whereClause = {
      status: {
        [Op.eq]: ["PENDING"],
      },
    };

    const whereClauseRejected = {
      status: {
        [Op.eq]: ["REJECTED"],
      },
    };

    if (userRole === 2) {
      whereClause.assigned_person = userID;
      whereClauseRejected.assigned_person = userID;
    } else if (userRole === 3 && groupCodes.includes(1)) {
      whereClause.displayTicket = 1;
      whereClauseRejected.displayTicket = 1;
    } else if (userRole === 3 && groupCodes.includes(2)) {
      whereClause.displayTicket = 2;
      whereClauseRejected.displayTicket = 2;
    } else if (userRole === 3 && groupCodes.includes(3)) {
      whereClause.displayTicket = 3;
      whereClauseRejected.displayTicket = 3;
    } else if (userRole === 3 && groupCodes.includes(4)) {
      whereClause.displayTicket = 4;
      whereClauseRejected.displayTicket = 4;
    } else if (userRole === 3 && groupCodes.includes(5)) {
      whereClause.displayTicket = 5;
      whereClauseRejected.displayTicket = 5;
    } else if (userRole === 3 && groupCodes.includes(6)) {
      whereClause.displayTicket = 6;
      whereClauseRejected.displayTicket = 6;
    } else if (userRole === 3 && groupCodes.includes(8)) {
      whereClause.displayTicket = 9;
      whereClauseRejected.displayTicket = 9;
    } else if (userRole === 3 && groupCodes.includes(9)) {
      whereClause.displayTicket = 20;
      whereClauseRejected.displayTicket = 20;
    } else if (userRole === 4) {
      whereClause.branch_id = { [Op.in]: user.blist_id.split(",") };
      whereClauseRejected.branch_id = { [Op.in]: user.blist_id.split(",") };
    } else if (userRole === 5) {
      whereClause.login_id = userID;
      whereClauseRejected.login_id = userID;
    } else if (userRole === 6) {
      whereClause.branch_id = {
        [Op.in]: casBranches.map((branch) => branch.blist_id),
      };
    } else if (userRole === 7 && groupCodes.includes(2)) {
      whereClause.displayTicket = 12;
      whereClauseRejected.displayTicket = 12;
    } else if (userRole === 7 && groupCodes.includes(3)) {
      whereClause.displayTicket = 13;
      whereClauseRejected.displayTicket = 13;
    } else if (userRole === 7 && groupCodes.includes(4)) {
      whereClause.displayTicket = 14;
      whereClauseRejected.displayTicket = 14;
    } else if (userRole === 7 && groupCodes.includes(8)) {
      whereClause.displayTicket = 10;
      whereClauseRejected.displayTicket = 10;
    } else if (userRole === 7 && groupCodes.includes(9)) {
      whereClause.displayTicket = 21;
      whereClauseRejected.displayTicket = 21;
    } else if (userRole === 7 && groupCodes.includes(10)) {
      whereClause.displayTicket = 31;
      whereClauseRejected.displayTicket = 31;
    } else if (userRole === 8) {
      whereClause.branch_id = {
        [Op.in]: managerBranches.map((branch) => branch.blist_id),
      };
    }

    const tickets = await Ticket.count({
      where: whereClause,
    });

    const ticketsRejected = await Ticket.count({
      where: whereClauseRejected,
    });

    return res.json({ tickets, ticketsRejected });
  } catch (error) {
    console.error("Error counting all tickets:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while counting all tickets" });
  }
};

const ticketThisWeek = async (req, res) => {
  const userRole = req.role;
  const userID = req.userID;
  const user = await User.findByPk(userID);
  const casBranches = await AssignedCAS.findAll({
    where: { login_id: userID },
  });
  const managerBranches = await AssignedAreaManager.findAll({
    where: { login_id: userID },
  });

  try {
    // Get the current date
    const today = new Date();
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay() + 1
    ); // Monday of the current week
    const endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay() + 6
    ); // Saturday of the current week

    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

    const whereClause = {
      "$TicketDetails.date_completed$": {
        [Op.between]: [formattedStartDate, formattedEndDate],
      },
      status: "EDITED",
    };

    if (userRole === 2) {
      whereClause.edited_by = userID;
    } else if (userRole === 3) {
      whereClause.approveAcctgSup = userID;
    } else if (userRole === 4) {
      whereClause.branch_id = { [Op.in]: user.blist_id.split(",") };
    } else if (userRole === 5) {
      whereClause.login_id = userID;
    } else if (userRole === 6) {
      whereClause.branch_id = {
        [Op.in]: casBranches.map((branch) => branch.blist_id),
      };
    } else if (userRole === 7) {
      whereClause.approveAcctgStaff = userID;
    } else if (userRole === 8) {
      whereClause.branch_id = {
        [Op.in]: managerBranches.map((branch) => branch.blist_id),
      };
    }

    const ticketCounts = await Ticket.count({
      attributes: [
        [
          Sequelize.literal(
            "CASE WHEN DAYOFWEEK(`TicketDetails`.`date_completed`) = 2 THEN 'Monday' " +
              "WHEN DAYOFWEEK(`TicketDetails`.`date_completed`) = 3 THEN 'Tuesday' " +
              "WHEN DAYOFWEEK(`TicketDetails`.`date_completed`) = 4 THEN 'Wednesday' " +
              "WHEN DAYOFWEEK(`TicketDetails`.`date_completed`) = 5 THEN 'Thursday' " +
              "WHEN DAYOFWEEK(`TicketDetails`.`date_completed`) = 6 THEN 'Friday' " +
              "WHEN DAYOFWEEK(`TicketDetails`.`date_completed`) = 7 THEN 'Saturday' " +
              "ELSE 'Unknown' END"
          ),
          "day",
        ],
        [Sequelize.fn("COUNT", "*"), "count"],
      ],
      where: whereClause,
      include: [
        {
          model: TicketDetails,
          as: "TicketDetails",
        },
      ],
      group: ["day"],
    });

    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Create an array of all days of the week
    const allDaysOfWeek = dayOrder.map((day) => ({ day, count: 0 }));

    // Merge ticketCounts data with allDaysOfWeek to fill in missing days
    const mergedData = allDaysOfWeek.map((dayObj) => ({
      ...dayObj,
      ...(ticketCounts.find((tc) => tc.day === dayObj.day) || {}),
    }));

    return res.json(mergedData);
  } catch (error) {
    console.error("Error counting all tickets:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while counting all tickets" });
  }
};

const ticketCountsByMonth = async (req, res) => {
  const userRole = req.role;
  const userID = req.userID;
  const user = await User.findByPk(userID);
  const casBranches = await AssignedCAS.findAll({
    where: { login_id: userID },
  });
  const managerBranches = await AssignedAreaManager.findAll({
    where: { login_id: userID },
  });

  try {
    // Get the current year and month
    const today = new Date();
    const currentYear = today.getFullYear();

    // Generate a list of all months in 'YYYY-MM' format for the current year
    const allMonths = [];
    for (let month = 1; month <= 12; month++) {
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      allMonths.push(`${currentYear}-${monthStr}`);
    }

    const whereClause = {
      "$TicketDetails.date_completed$": {
        [Op.between]: [`${currentYear}-01-01`, `${currentYear}-12-31`],
      },
      status: "EDITED",
    };

    if (userRole === 2) {
      whereClause.edited_by = userID;
    } else if (userRole === 3) {
      whereClause.approveAcctgSup = userID;
    } else if (userRole === 4) {
      whereClause.branch_id = { [Op.in]: user.blist_id.split(",") };
    } else if (userRole === 5) {
      whereClause.login_id = userID;
    } else if (userRole === 6) {
      whereClause.branch_id = {
        [Op.in]: casBranches.map((branch) => branch.blist_id),
      };
    } else if (userRole === 7) {
      whereClause.approveAcctgStaff = userID;
    } else if (userRole === 8) {
      whereClause.branch_id = {
        [Op.in]: managerBranches.map((branch) => branch.blist_id),
      };
    }

    const ticketsByMonth = await Ticket.findAll({
      attributes: [
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("TicketDetails.date_completed"),
            "%Y-%m"
          ),
          "month",
        ],
        [Sequelize.fn("COUNT", Sequelize.col("*")), "count"],
      ],
      include: [
        {
          model: TicketDetails,
          as: "TicketDetails",
          attributes: [],
        },
      ],
      where: whereClause,
      group: [
        Sequelize.fn(
          "DATE_FORMAT",
          Sequelize.col("TicketDetails.date_completed"),
          "%Y-%m"
        ),
      ],
      order: [
        Sequelize.fn(
          "DATE_FORMAT",
          Sequelize.col("TicketDetails.date_completed"),
          "%Y-%m"
        ),
      ],
      raw: true,
    });

    // Create an object to store counts for each month
    const monthCounts = {};
    ticketsByMonth.forEach((entry) => {
      monthCounts[entry.month] = entry.count;
    });

    // Create an array of objects with all months and their counts
    const resultWithAllMonths = allMonths.map((month) => ({
      month,
      count: monthCounts[month] || 0,
    }));

    return res.json(resultWithAllMonths);
  } catch (error) {
    console.error("Error counting tickets by month:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while counting tickets by month" });
  }
};

const ticketCountsByMonthLastYear = async (req, res) => {
  const userRole = req.role;
  const userID = req.userID;
  const user = await User.findByPk(userID);
  const casBranches = await AssignedCAS.findAll({
    where: { login_id: userID },
  });
  const managerBranches = await AssignedAreaManager.findAll({
    where: { login_id: userID },
  });

  try {
    // Get the current year and month
    const today = new Date();
    const currentYear = today.getFullYear() - 1;

    // Generate a list of all months in 'YYYY-MM' format for the current year
    const allMonths = [];
    for (let month = 1; month <= 12; month++) {
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      allMonths.push(`${currentYear}-${monthStr}`);
    }

    const whereClause = {
      "$TicketDetails.date_completed$": {
        [Op.between]: [`${currentYear}-01-01`, `${currentYear}-12-31`],
      },
      status: "EDITED",
    };

    if (userRole === 2) {
      whereClause.edited_by = userID;
    } else if (userRole === 3) {
      whereClause.approveAcctgSup = userID;
    } else if (userRole === 4) {
      whereClause.branch_id = { [Op.in]: user.blist_id.split(",") };
    } else if (userRole === 5) {
      whereClause.login_id = userID;
    } else if (userRole === 6) {
      whereClause.branch_id = {
        [Op.in]: casBranches.map((branch) => branch.blist_id),
      };
    } else if (userRole === 7) {
      whereClause.approveAcctgStaff = userID;
    } else if (userRole === 8) {
      whereClause.branch_id = {
        [Op.in]: managerBranches.map((branch) => branch.blist_id),
      };
    }

    const ticketsByMonth = await Ticket.findAll({
      attributes: [
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("TicketDetails.date_completed"),
            "%Y-%m"
          ),
          "month",
        ],
        [Sequelize.fn("COUNT", Sequelize.col("*")), "count"],
      ],
      include: [
        {
          model: TicketDetails,
          as: "TicketDetails",
          attributes: [],
        },
      ],
      where: whereClause,
      group: [
        Sequelize.fn(
          "DATE_FORMAT",
          Sequelize.col("TicketDetails.date_completed"),
          "%Y-%m"
        ),
      ],
      order: [
        Sequelize.fn(
          "DATE_FORMAT",
          Sequelize.col("TicketDetails.date_completed"),
          "%Y-%m"
        ),
      ],
      raw: true,
    });

    // Create an object to store counts for each month
    const monthCounts = {};
    ticketsByMonth.forEach((entry) => {
      monthCounts[entry.month] = entry.count;
    });

    // Create an array of objects with all months and their counts
    const resultWithAllMonths = allMonths.map((month) => ({
      month,
      count: monthCounts[month] || 0,
    }));

    return res.json(resultWithAllMonths);
  } catch (error) {
    console.error("Error counting tickets by month:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while counting tickets by month" });
  }
};

const topBranches = async (req, res) => {
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

  try {
    const topBranches = await Ticket.count({
      attributes: [
        [Sequelize.col("branch_name"), "branch"],
        [Sequelize.fn("COUNT", Sequelize.col("branch_id")), "count"],
      ],
      where: {
        status: "EDITED",
      },
      include: [
        {
          model: TicketDetails,
          as: "TicketDetails",
          attributes: [],
          where: {
            date_completed: {
              [Op.between]: [formattedFirstDayOfMonth, formattedCurrentDate],
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
      group: ["branch"],
      order: [[Sequelize.fn("COUNT", Sequelize.col("branch_id")), "DESC"]],
      limit: 5,
    });

    return res.json(topBranches);
  } catch (error) {
    console.error("Error getting top branches:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while getting top branches" });
  }
};

const updateSupport = async (req, res) => {
  const ticketID = req.params.ticketID;
  const { td_support } = req.body;

  try {
    // Retrieve the existing ticket data from the database
    const ticket = await Ticket.findByPk(ticketID);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Update the td_support field with the new value
    ticket.td_support = td_support;

    // Save the updated ticket data back to the database
    const updatedTicket = await ticket.save();

    // Send a success response with the updated ticket data
    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    // Send an error response
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateNote = async (req, res) => {
  const ticketID = req.params.ticketID;
  const { note } = req.body;

  const ticket = await Ticket.findByPk(ticketID);

  try {
    await TicketDetails.update(
      {
        td_note: note,
      },
      {
        where: { ticket_details_id: ticket.ticket_details_id },
      }
    );
    res.status(200);
  } catch (e) {
    console.error("Error updating the note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  deleteTicket,
  assignedAutomation,
  getAllCompletedTickets,
  viewTicket,
  getAllTicketStatus,
  ticketCount,
  ticketCountsThisWeek,
  ticketPendingCountsToday,
  ticketThisWeek,
  ticketCountsByMonth,
  updateTicketStatus,
  updateTicket,
  ticketCountsByMonthLastYear,
  topBranches,
  updateApproved,
  viewReports,
  getReports,
  updateSupport,
  returnToAutomation,
  setCount,
  updateNote,
};
