const UserRole = require("../models/user_role.model");

const getAllRoles = async (req, res) => {
  try {
    const roles = await UserRole.findAll();
    const sortedRoles = roles.sort();

    return res.json(sortedRoles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching roles" });
  }
};

module.exports = { getAllRoles };
