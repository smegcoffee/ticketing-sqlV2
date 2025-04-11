const { DataTypes } = require('sequelize');
const db = require('../config/db.config');

const Supplier = db.define('supplier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  supplier: {
    type: DataTypes.STRING,
    allowNull: false
  }
},{
  freezeTableName: true,
  timestamps: false
  });

module.exports = Supplier;
