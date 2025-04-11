const { DataTypes } = require('sequelize');
const db = require('../config/db.config');
const Category = require('./category.model');
const Supplier = require('./supplier.model');

const TicketDetails = db.define('ticket_details', {
  ticket_details_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ticket_category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true,
    references:{
      model: Category,
      key: 'ticket_category_id',
    },
  },
  ticket_transaction_date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  td_ref_number: {
    type: DataTypes.STRING,
  },
  td_purpose: {
    type: DataTypes.JSON,
    allowNull: false
  },
  td_from: {
    type: DataTypes.JSON,
  },
  td_to: {
    type: DataTypes.JSON,
  },
  td_note: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  td_support: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  supplier: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references:{
      model: Supplier,
      key: 'id',
    }
  },
  date_created: {
    type: DataTypes.STRING,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date_completed: {
    type: DataTypes.STRING
  },

},{
  freezeTableName: true,
  timestamps: false
  });

TicketDetails.belongsTo(Category, { foreignKey: 'ticket_category_id', as: 'Category' });
TicketDetails.belongsTo(Supplier, { foreignKey: 'supplier', as: 'Supplier' });

module.exports = TicketDetails;
