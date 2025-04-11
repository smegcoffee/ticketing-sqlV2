const { DataTypes } = require('sequelize');
const db = require('../config/db.config');
const User = require('./userlogin.model');
const CategoryGroup = require('./categorygroup.model');

const AssignedCategory = db.define('assigned_category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  login_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User', 
      key: 'login_id',
    },
  },
  group_code: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: CategoryGroup,
      key: 'id',
    },
  },
}, {
  freezeTableName: true,
  timestamps: false,
});

AssignedCategory.belongsTo(User, { foreignKey: 'login_id', as: 'User' });
AssignedCategory.belongsTo(CategoryGroup, { foreignKey: 'group_code', as: 'CategoryGroup' });

module.exports = AssignedCategory;
