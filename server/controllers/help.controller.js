const Help = require("../models/help.model");
const UserRole = require("../models/user_role.model");
const User = require("../models/userlogin.model");

const createHelp = async (req, res) => {
  const { question, answer, role } = req.body;

  try {
    await Help.create({
      question,
      answer,
      role,
    });

    return res.status(201).json({ message: "Question & Answer added" });
  } catch (error) {
    console.error("Error adding help:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while adding help" });
  }
};

const getAllAutomationHelp = async (req, res) => {
  try {
    const automation = await Help.findAndCountAll({
      where: {
        role: 2,
      },
    });
    return res.json(automation);
  } catch (error) {
    console.error("Error getting help:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while getting help" });
  }
};

const getAllBranchHelp = async (req, res) => {
  try {
    const branch = await Help.findAndCountAll({
      where: {
        role: 5,
      },
    });
    return res.json(branch);
  } catch (error) {
    console.error("Error getting help:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while getting help" });
  }
};

const viewHelp = async (req, res) => {
  const helpID = req.params.helpID;

  try {
    const help = await Help.findOne({
      where: {
        id: helpID,
      },
    });

    return res.json(help);
  } catch (error) {
    console.error("Error fetching branch:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching branch" });
  }
};

const editHelp = async (req, res) => {
  const helpID = req.params.helpID;
  const { question, answer, role } = req.body;
  try {
    await Help.update(
      {
        question,
        answer,
        role,
      },
      {
        where: {
          id: helpID,
        },
      }
    );

    return res.json({ message: "Successfully updated." });
  } catch (error) {
    console.error("Error updating help:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating help" });
  }
};

const deleteHelp = async (req, res) => {
  const helpID = req.params.helpID;
  try {
    await Help.destroy({
      where: {
        id: helpID,
      },
    });

    return res.json({ message: "Successfully deleted." });
  } catch (error) {
    console.error("Error deleting help:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting help" });
  }
};

module.exports = {
  createHelp,
  getAllAutomationHelp,
  getAllBranchHelp,
  editHelp,
  deleteHelp,
  viewHelp,
};
