const UserDetails = require('../models/userdetails.model');
const AssignedCategory = require('../models/assignedcategory.model');
const User = require('../models/userlogin.model');
const { Op, Sequelize } = require('sequelize');
const Category = require('../models/category.model');
const BranchList = require('../models/branchlist.model');
const CategoryGroup = require('../models/categorygroup.model');
const TicketDetails = require('../models/ticketdetails.model');
const AssignedCAS = require('../models/assignedCAS.model');
const Ticket = require('../models/ticket.model');


const assignedToCategory = async (req, res) => {
  const { accountingID, categoryID } = req.body;
  try {
      const accountingDetails = await User.findByPk(accountingID);
      const categoryList = await CategoryGroup.findAll({ where: { id: categoryID } });
      const checkUser = await AssignedCategory.findAll({ where: { group_code: categoryID, login_id: accountingID } });

      if (checkUser.length > 0) {
          return res.status(400).json({ message: 'Category already exists' });
      } else {
          if (categoryID.length === 1) {
              await AssignedCategory.create({ login_id: accountingDetails.login_id, group_code: categoryID });
              return res.status(200).json({ message: 'Assigned category created' });
          } else if (categoryID.length > 1) {
              const insertMultiCategory = categoryList.map(ticket => ({
                  login_id: accountingID,
                  group_code: ticket.id
              }));
              await AssignedCategory.bulkCreate(insertMultiCategory);
              return res.status(200).json({ message: 'Assigned category created' });
          } else {
              return res.status(400).json({ message: 'Invalid category data' });
          }
      }
  } catch (error) {
      console.error('Error assigning category', error);
      return res.status(500).json({ message: 'An error occurred while assigning category' });
  }
};


const getAllAccountingAssigned = async (req, res) => {
    try {
        const result = await AssignedCategory.findAll({
            include: [
                {
                  model: CategoryGroup,
                  as: 'CategoryGroup',
                  // attributes: [[Sequelize.fn('MAX', Sequelize.col('Branch.b_code'))]],
                },
                {
                    model: User,
                    as: 'User',
                    attributes:['blist_id', 'login_id','user_role_id']
                }
              ],
        }); // Query the database

        // Send the response with the data
        res.status(200).json(result); // Assuming that you want to send the data as JSON
    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
};

const getAssignedCategoryGroup = async (req, res) => {
    const userID = req.params.userID;
    try {
        const result = await AssignedCategory.findAll({
            where: { login_id: userID },
            include: [
                {
                  model: CategoryGroup,
                  as: 'CategoryGroup',
                  // attributes: [[Sequelize.fn('MAX', Sequelize.col('Branch.b_code'))]],
                },
                {
                    model: User,
                    as: 'User',
                    attributes:['blist_id', 'login_id','user_role_id']
                }
              ],
        }); // Query the database

        // Send the response with the data
        res.status(200).json(result); // Assuming that you want to send the data as JSON
    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
};


const getSingleAccountingAssigned = async (req, res) => {
    const userID = req.userID;
    try {
        const result = await AssignedCategory.findAll({
            include: [
                {
                  model: CategoryGroup,
                  as: 'CategoryGroup',
                  // attributes: [[Sequelize.fn('MAX', Sequelize.col('Branch.b_code'))]],
                },
                {
                    model: User,
                    as: 'User',
                    attributes:['blist_id', 'login_id','user_role_id'],
                    where: {
                        "login_id": userID
                    }
                }
              ],
        }); // Query the database

        // Send the response with the data
        res.status(200).json(result); // Assuming that you want to send the data as JSON
    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
};

const assignedCategoryDelete = async (req, res) => {
    const { accountingName, categories } = req.body;
  
    // const accountingID = await UserDetails.findOne({ where: { user_details_id: accountingName } });
    const userID = await User.findOne({ where: { user_details_id: accountingName } });
    const categoryList = await CategoryGroup.findAll({ where: { id: categories } });
    const categoriesToDelete = categoryList.map(code => code.id);
  
    try {
      await AssignedCategory.destroy({
        where: {
          login_id: userID.login_id,
          group_code: categoriesToDelete
        }
      });
  
      return res.status(200).json({ message: 'Assigned categories deleted' });
    } catch (error) {
      return res.status(500).json({ message: 'An error occurred while deleting categories ' + accountingName });
    }
  };

const assignedCASDelete = async (req, res) => {
    const { casID, branches } = req.body;

    const branchList = await BranchList.findAll({ where: { blist_id: branches } });
    const branchesToDelete = branchList.map(branch => branch.blist_id);

    try {
        await AssignedCAS.destroy({
        where: {
            login_id: casID,
            blist_id: branchesToDelete
        }
        });

        return res.status(200).json({ message: 'Assigned branches deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while deleting branches ' + casID });
    }
};
  
const getAssignedCategories = async (req, res) => {
    const userId = req.userID;
    try {
        // Get assigned categories for the user
        const assignedCategories = await AssignedCategory.findAll({ where: { login_id: userId } });

        // Extract group codes from assigned categories
        const groupCodes = assignedCategories.map((assignCategory) => assignCategory.group_code);

        // Find all tickets with TicketDetails and Categories where group_code is in the array
        const result = await Ticket.findAll({
            where: {
                "$TicketDetails.Category.group_code$": {
                    [Sequelize.Op.in]: groupCodes
                }
            },
            include: [
                {
                    model: TicketDetails,
                    as: 'TicketDetails',
                    include: [
                        {
                            model: Category,
                            as: 'Category',
                        }
                    ]
                },
                {
                    model: User,
                    as: 'UserTicket',
                    include:[
                        {
                            model: UserDetails,
                            as: 'UserDetails',
                        }
                    ]
                }
            ]
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
};

const assignedBranchCAS = async (req, res) => {
    const { casID, branchID } = req.body;
    try {
        const casDetails = await User.findByPk(casID);
        const branchList = await BranchList.findAll({ where: { blist_id: branchID } });
        const checkUser = await AssignedCAS.findAll({ where: { blist_id: branchID, login_id: casID } });
  
        if (checkUser.length > 0) {
            return res.status(400).json({ message: 'Branch already exists' });
        } else {
            if (branchID.length === 1) {
                await AssignedCAS.create({ login_id: casDetails.login_id, blist_id: branchID });
                return res.status(200).json({ message: 'Assigned branch created' });
            } else if (branchID.length > 1) {
                const insertMultiBranch = branchList.map(branch => ({
                    login_id: casID,
                    blist_id: branch.blist_id
                }));
                await AssignedCAS.bulkCreate(insertMultiBranch);
                return res.status(200).json({ message: 'Assigned branches created' });
            } else {
                return res.status(400).json({ message: 'Invalid branch data' });
            }
        }
    } catch (error) {
        console.error('Error assigning branch', error);
        return res.status(500).json({ message: 'An error occurred while assigning branch' });
    }
};

  
  const getAllCASAssigned = async (req, res) => {
    try {
        const result = await AssignedCAS.findAll({
            include: [
                {
                  model: BranchList,
                  as: 'Branch'
                },
                {
                    model: User,
                    as: 'User',
                    attributes:['blist_id', 'login_id','user_role_id']
                }
              ],
        }); // Query the database

        // Send the response with the data
        res.status(200).json(result); // Assuming that you want to send the data as JSON
    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
};
  


module.exports = { assignedCASDelete, getAllCASAssigned, assignedToCategory, getSingleAccountingAssigned, getAllAccountingAssigned, assignedCategoryDelete, getAssignedCategories, assignedBranchCAS, getAssignedCategoryGroup };
