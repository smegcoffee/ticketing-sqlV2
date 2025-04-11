const { DataTypes } = require('sequelize');
const db = require('../config/db.config');
const User = require('./userlogin.model');
const BranchList = require('./branchlist.model');

const AssignedTo = db.define('assigned_branch', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  login_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references:{
        model: User,
        key: 'login_id',
      },
  },
  blist_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    references:{
        model: BranchList,
        key: 'blist_id',
      },
  }
},{
  freezeTableName: true,
  timestamps: false
  });

AssignedTo.belongsTo(User, { foreignKey: 'login_id', as: 'User' });
AssignedTo.belongsTo(BranchList, { foreignKey: 'blist_id', as: 'Branch' });

module.exports = AssignedTo;
