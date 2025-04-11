const BranchList = require("../models/branchlist.model");
const BranchDetails = require("../models/branchdetails.model");
const Ticket = require("../models/ticket.model");
const AssignedTo = require("../models/assigendto.model");
const { Op } = require("sequelize");

const createBranch = async (req, res) => {
  const {
    branch_code,
    branch_name,
    branch_address,
    branch_contact,
    branch_email,
    branch_category,
  } = req.body;

  try {
    const existingCode = await BranchList.findOne({
      where: { b_code: branch_code },
    });
    const existingName = await BranchList.findOne({
      where: { b_name: branch_name },
    });

    if (existingCode) {
      return res.status(409).json({ message: "Branch Code already exist!" });
    } else if (existingName) {
      return res.status(409).json({ message: "Branch Name already exist!" });
    }else {
      const branch = await BranchList.create({
        b_code: branch_code,
        b_name: branch_name,
        category: branch_category,
      });

      await BranchDetails.create({
        blist_id: branch.blist_id,
        b_address: branch_address,
        b_contact: branch_contact,
        b_email: branch_email,
      });

      return res.status(201).json({ message: "Branch created." });
    }
  } catch (error) {
    console.error("Error adding branch:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while adding branch" });
  }
};

const updateBranch = async (req, res) => {
  const branchID = req.params.branchID;
  const {
    branch_code,
    branch_name,
    branch_address,
    branch_contact,
    branch_email,
    branch_category,
  } = req.body;
  const branch = await BranchList.findByPk(branchID);
  try {
    const branchDetails = await BranchDetails.findOne({
      where: { blist_id: branchID },
    });

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    } else {
      if (branch_code !== branch.b_code) {
        const existingCode = await BranchList.findOne({
          where: { b_code: branch_code },
        });

        if (existingCode) {
          return res.json({ message: "Branch Code already exist" });
        }
      }

      if (branch_name !== branch.b_name) {
        const existingName = await BranchList.findOne({
          where: { b_name: branch_name },
        });

        if (existingName) {
          return res.json({ message: "Branch Name already exist" });
        }
      }

      // if (branch_email !== branchDetails.b_email) {
      //   const existingEmail = await BranchDetails.findOne({
      //     where: { b_email: branch_email },
      //   });

      //   if (existingEmail) {
      //     return res.json({ message: "Email already exist" });
      //   }
      // }

      await BranchDetails.update(
        {
          b_address: branch_address,
          b_contact: branch_contact,
          b_email: branch_email,
        },
        {
          where: { blist_id: branchID },
        }
      );

      await BranchList.update(
        {
          b_code: branch_code,
          b_name: branch_name,
          category: branch_category,
        },
        {
          where: { blist_id: branchID },
        }
      );

      await Ticket.update(
        {
          branch_name,
        },
        {
          where: { branch_name: branch.b_name },
        }
      );

      return res.status(200).json({ message: "Branch updated successfully" });
    }
  } catch (error) {
    console.error("Error updating branch:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating branch" });
  }
};

const getAllBranch = async (req, res) => {
  try {
    const allBranch = await BranchDetails.findAll({
      include: [
        {
          model: BranchList,
          as: "Branch",
          attributes: ["b_code", "b_name", "category"],
        },
      ],
      order: [
        [{ model: BranchList, as: "Branch" }, "b_name", "ASC"],
      ],
    });

    return res.json(allBranch);
  } catch (error) {
    console.error("Error fetching all branches:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching all branches" });
  }
};

const tableBranches = async (req, res) => {
  const { search } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  try {
    const allBranch = await BranchDetails.findAndCountAll({
      include: [
        {
          model: BranchList,
          as: "Branch",
          attributes: ["b_code", "b_name", "category"],
        },
      ],
      where: {
        [Op.or]: [
          { "$Branch.b_code$": { [Op.like]: `%${search}%` } },
          { "$Branch.b_name$": { [Op.like]: `%${search}%` } },
          { b_address: { [Op.like]: `%${search}%` } },
          { b_contact: { [Op.like]: `%${search}%` } },
          { b_email: { [Op.like]: `%${search}%` } },
        ],
      },
      order: [
        [{ model: BranchList, as: "Branch" }, "b_name", "ASC"],
      ],
      limit: limit,
      offset: offset,
    });

    return res.json(allBranch);
  } catch (error) {
    console.error("Error fetching all branches:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching all branches" });
  }
};

const getAllBranchCategories = async (req, res) => {
  try {
    const distinctCategories = await BranchList.findAll({
      attributes: ["category"],
      group: ["category"],
    });

    const categories = distinctCategories.map((item) => item.category);
    const sortedCategories = categories.sort();

    return res.json(sortedCategories);
  } catch (error) {
    console.error("Error getting all branch categories:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while all the branch categories" });
  }
};

const viewBranch = async (req, res) => {
  const branchID = req.params.branchID;

  try {
    const branch = await BranchDetails.findOne({
      where: {
        blist_id: branchID,
      },
      attributes: ["b_address", "b_contact", "b_email"],
      include: [
        {
          model: BranchList,
          as: "Branch",
          attributes: ["b_code", "b_name", "category"],
        },
      ],
    });

    return res.json(branch);
  } catch (error) {
    console.error("Error fetching branch:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching branch" });
  }
};

const deleteBranch = async (req, res) => {
  const branchID = req.params.branchID;

  try {
    const branch = await BranchList.findByPk(branchID);
    const ticket = await Ticket.findOne({ where: { branch_id: branchID } });
    const assigned = await AssignedTo.findOne({
      where: { blist_id: branchID },
    });

    if (!branch) {
      return res.status(404).json({ message: "No branch found" });
    }

    if (ticket) {
      return res
        .status(409)
        .json({ message: `Can't delete! Branch is in used!` });
    }

    if (assigned) {
      return res
        .status(409)
        .json({ message: `Can't delete! Branch is in used!` });
    }

    await BranchList.destroy({
      where: {
        blist_id: branchID,
      },
    });

    return res.status(200).json({ message: "Branch deleted successfully" });
  } catch (error) {
    console.error("Error deleting branch:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting branch" });
  }
};

module.exports = {
  createBranch,
  updateBranch,
  getAllBranch,
  getAllBranchCategories,
  viewBranch,
  deleteBranch,
  tableBranches,
};
