const { DataTypes } = require('sequelize');
const db = require('../config/db.config');
const CategoryGroup = require('./categorygroup.model');

const Category = db.define('ticket_category', {
  ticket_category_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category_shortcut: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  group_code: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: CategoryGroup,
      key: 'id',
    },
  }
},{
  freezeTableName: true,
  timestamps: false
  });

Category.belongsTo(CategoryGroup, { foreignKey: 'group_code', as: 'CategoryGroup' });

module.exports = Category;
