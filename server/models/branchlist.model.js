const { DataTypes } = require('sequelize');
const db = require('../config/db.config');

const BranchList = db.define('branch_list', {
  blist_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  b_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  b_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  category: {
    type: DataTypes.STRING
  }
},{
  freezeTableName: true,
  timestamps: false
  });

module.exports = BranchList;
