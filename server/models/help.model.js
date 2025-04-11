const { DataTypes } = require('sequelize');
const db = require('../config/db.config');

const Help = db.define('help', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  question: {
    type: DataTypes.STRING,
    allowNull: false
  },
  answer: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  }
},{
  freezeTableName: true,
  timestamps: false
  });

module.exports = Help;
