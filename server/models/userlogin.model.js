const { DataTypes } = require("sequelize");
const db = require("../config/db.config");
const UserDetails = require("./userdetails.model");
const UserRole = require("./user_role.model");
const BranchList = require("./branchlist.model");

const User = db.define(
  "user_login",
  {
    login_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_details_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: UserDetails,
        key: "user_details_id",
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: UserRole,
        key: "user_role_id",
      },
    },
    blist_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BranchList,
        key: "blist_id",
      },
    },
    requesting_password: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

User.belongsTo(UserDetails, {
  foreignKey: "user_details_id",
  as: "UserDetails",
});
User.belongsTo(UserRole, { foreignKey: "user_role_id", as: "UserRole" });
User.belongsTo(BranchList, { foreignKey: "blist_id", as: "Branch" });

module.exports = User;
