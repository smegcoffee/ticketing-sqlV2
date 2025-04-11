const { DataTypes } = require('sequelize');
const db = require('../config/db.config');

const UserRole = db.define('user_role', {
  user_role_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
},{
  freezeTableName: true,
  timestamps: false
  });

module.exports = UserRole;
