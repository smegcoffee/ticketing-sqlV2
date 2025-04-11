const UserDetails = require('../models/userdetails.model');
const User = require('../models/userlogin.model');
const { Op, Sequelize } = require('sequelize');
const Category = require('../models/category.model');
const BranchList = require('../models/branchlist.model');
const AssignedAreaManager = require('../models/assignedareamanager.model');


const assignedBranchManager = async (req, res) => {
  const { managerID, branchID } = req.body;
  try {
      const managerDetails = await User.findByPk(managerID);
      const branchList = await BranchList.findAll({ where: { blist_id: branchID } });
      const checkUser = await AssignedAreaManager.findAll({ where: { blist_id: branchID, login_id: managerID } });

      if (checkUser.length > 0) {
          return res.status(400).json({ message: 'Branch already exists' });
      } else {
          if (branchID.length === 1) {
              await AssignedAreaManager.create({ login_id: managerDetails.login_id, blist_id: branchID });
              return res.status(200).json({ message: 'Assigned branch created' });
          } else if (branchID.length > 1) {
              const insertMultiBranch = branchList.map(branch => ({
                  login_id: managerID,
                  blist_id: branch.blist_id
              }));
              await AssignedAreaManager.bulkCreate(insertMultiBranch);
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

const findAllBlistManager = async (req, res) => {
  try {
      const result = await BranchList.findAll({
        where: {
          blist_id: {
            [Sequelize.Op.notIn]: Sequelize.literal('(SELECT blist_id FROM assigned_area_manager)')
          }
        }
      });
    
      // Use the 'result' variable here, which contains the filtered data
      res.status(200).json(result);
    } catch (error) {
      // Handle any errors
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
};

const getAllManagerAssigned = async (req, res) => {
  try {
      const result = await AssignedAreaManager.findAll({
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

const assignedManagerDelete = async (req, res) => {
  const { managerID, branches } = req.body;

  const branchList = await BranchList.findAll({ where: { blist_id: branches } });
  const branchesToDelete = branchList.map(branch => branch.blist_id);

  try {
      await AssignedAreaManager.destroy({
      where: {
          login_id: managerID,
          blist_id: branchesToDelete
      }
      });

      return res.status(200).json({ message: 'Assigned branches deleted' });
  } catch (error) {
      return res.status(500).json({ message: 'An error occurred while deleting branches ' + managerID });
  }
};

module.exports = { findAllBlistManager, getAllManagerAssigned, assignedBranchManager, assignedManagerDelete };