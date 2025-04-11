const { DataTypes } = require('sequelize');
const db = require('../config/db.config');

const CategoryGroup = db.define('group_category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  group_code: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  freezeTableName: true,
  timestamps: false,
});

module.exports = CategoryGroup;
