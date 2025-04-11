const User = require('../models/userlogin.model');
const BranchList = require('../models/branchlist.model');
const AssignedTo = require('../models/assigendto.model');
const UserDetails = require('../models/userdetails.model');
const { Op, Sequelize } = require('sequelize');

const assignedTo = async (req, res) => {
    const { automationName, branches } = req.body;
    try{
      const automationID = await UserDetails.findOne({ where: { fname: automationName} });
      const userID = await User.findByPk( automationID.user_details_id);
      const existingAssignments = await AssignedTo.findAll({ where: { login_id: userID.login_id } });
      const existingBranchIds = existingAssignments.map(assign => assign.blist_id);

      const branchList = await BranchList.findAll({ where: { b_code: branches } });

      const newBranchIds = branchList.map(branch => branch.blist_id);
      const branchesToAdd = newBranchIds.filter(id => !existingBranchIds.includes(id));
      
      
      if(branches.length > 1){
        const insertAllBranches = branchesToAdd.map(blist_id => ({
          login_id: userID.login_id,
          blist_id
        }))
        await AssignedTo.bulkCreate(insertAllBranches);
        return res.status(200).json({ message: 'Assigned branches created' });
      }else if (branches.length === 1){
        const insertAllBranches = branchesToAdd.map(blist_id => ({
          login_id: userID.login_id,
          blist_id
        }))
        await AssignedTo.create(insertAllBranches);
        return res.status(200).json({ message: 'Assigned branches created' });
      }
      
    } catch (error) {
          console.error('Error assigning branches', error);
          return res.status(500).json({ message: 'An error occurred while assigning branches' });
    }

};

const assignedToUpdate = async (req, res) => {
  const { automationName, branches } = req.body;

  try {
    const automationID = await UserDetails.findOne({ where: { fname: automationName } });
    const userID = await User.findOne({ where: {user_details_id: automationID.user_details_id}});
    const existingAssignments = await AssignedTo.findAll({ where: { login_id: userID.login_id } });
    const existingBranchIds = existingAssignments.map(assign => assign.blist_id);
    const branchList = await BranchList.findAll({ where: { b_code: branches } });
    const newBranchIds = branchList.map(branch => branch.blist_id);
    const branchesToAdd = newBranchIds.filter(id => !existingBranchIds.includes(id));
    const branchesToRemove = existingBranchIds.filter(id => !newBranchIds.includes(id));

    if (branchesToAdd.length > 0) {
      const insertAllBranches = branchesToAdd.map(blist_id => ({
        login_id: userID.login_id,
        blist_id
      }));
      await AssignedTo.bulkCreate(insertAllBranches);
    }

    if (branchesToRemove.length > 0) {
      await AssignedTo.destroy({ where: { login_id: userID.login_id, blist_id: branchesToRemove } });
    }

    return res.status(200).json({ message: 'Assigned branches updated' });
  } catch (error) {
    console.error('Error updating branches', error);
    return res.status(500).json({ message: 'An error occurred while updating branches to automation ' + automationName });
  }
};

const assignedToDelete = async (req, res) => {
  const { automationName, branches } = req.body;

  try {
    const automationID = await UserDetails.findOne({ where: { fname: automationName } });
    const userID = await User.findOne({ where: {user_details_id: automationID.user_details_id}});
    const branchList = await BranchList.findAll({ where: { b_code: branches } });

    const branchIdsToDelete = branchList.map(branch => branch.blist_id);

    await AssignedTo.destroy({
      where: {
        login_id: userID.login_id,
        blist_id: branchIdsToDelete
      }
    });

    return res.status(200).json({ message: 'Assigned branches deleted' });
  } catch (error) {
    console.error('Error deleting branches', error);
    return res.status(500).json({ message: 'An error occurred while deleting branches from automation ' + automationName });
  }
};



const findAllBlist = async (req, res) => {
    try {
        const result = await BranchList.findAll({
          where: {
            blist_id: {
              [Sequelize.Op.notIn]: Sequelize.literal('(SELECT blist_id FROM assigned_branch)')
            }
          },
          attributes: ['b_code']
        });
     
        // Use the 'result' variable here, which contains the filtered data
        res.status(200).json(result);
      } catch (error) {
        // Handle any errors
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
      }
  };

const findAllBlistCAS = async (req, res) => {
  try {
      const result = await BranchList.findAll({
        where: {
          blist_id: {
            [Sequelize.Op.notIn]: Sequelize.literal('(SELECT blist_id FROM assigned_branch_cas)')
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
  
  const findAllInBlist = async (req, res) => {
    try {
      const result = await AssignedTo.findAll({
        include: [
          {
            model: BranchList,
            as: 'Branch',
            // attributes: [[Sequelize.fn('MAX', Sequelize.col('Branch.b_code'))]],
          }
        ],
        
      });
  
      // Use the 'result' variable here, which contains the joined data
      return res.json(result);
    } catch (error) {
      // Handle any errors
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };
  
  const getAllAutomationAssigned = async (req, res) => {
    try{
      const result = await AssignedTo.findAll({})
    }catch(error){
      console.error(error);
      res.status(500).json({error: "An error occurred"});
    }
  };

  

module.exports = { findAllBlistCAS, assignedTo, findAllBlist, findAllInBlist, assignedToUpdate, assignedToDelete, getAllAutomationAssigned };