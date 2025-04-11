const { DataTypes } = require('sequelize');
const db = require('../config/db.config');
const User = require('./userlogin.model');
const BranchList = require('./branchlist.model');

const AssignedAreaManager = db.define('assigned_area_manager', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  login_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references:{
        model: User,
        key: 'login_id',
      },
  },
  blist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
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

AssignedAreaManager.belongsTo(User, { foreignKey: 'login_id', as: 'User' });
AssignedAreaManager.belongsTo(BranchList, { foreignKey: 'blist_id', as: 'Branch' });

module.exports = AssignedAreaManager;
