const { DataTypes } = require('sequelize');
const db = require('../config/db.config');
const BranchList = require('./branchlist.model')

const BranchDetails = db.define('branch_details', {
  bdetails_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  blist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references:{
        model: BranchList,
        key: 'blist_id',
      },
  },
  b_address: {
    type: DataTypes.STRING
  },
  b_contact: {
    type: DataTypes.STRING
  },
  b_email: {
    type: DataTypes.STRING
  }
},{
  freezeTableName: true,
  timestamps: false
  });

BranchDetails.belongsTo(BranchList, { foreignKey: 'blist_id', as: 'Branch' });

module.exports = BranchDetails;
