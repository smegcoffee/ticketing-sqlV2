const { DataTypes } = require('sequelize');
const db = require('../config/db.config');
const User = require('./userlogin.model');
const TicketDetails = require('./ticketdetails.model');
const BranchList = require('./branchlist.model');

const Ticket = db.define('ticket', {
  ticket_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ticket_code: {
    type: DataTypes.STRING
  },
  login_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references:{
      model: User,
      key: 'login_id',
    },
  },
  ticket_details_id: {
    type: DataTypes.INTEGER,
    unique: true,
    references:{
      model: TicketDetails,
      key: 'ticket_details_id',
    },
  },
  branch_id: {
    type: DataTypes.STRING,
    allowNull: true,
    references:{
      model: BranchList,
      key: 'blist_id',
    },
  },
  branch_name: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING
  },
  isCounted: {
    type: DataTypes.TINYINT
  },
  isApproved : {
    type: DataTypes.TINYINT
  },
  assigned_person: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references:{
      model: User,
      key: 'login_id',
    },
  },
  edited_by: {
    type: DataTypes.INTEGER,
    references:{
      model: User,
      key: 'login_id',
    }
  },
  notifStaff: {
    type: DataTypes.INTEGER
  },
  notifHead: {
    type: DataTypes.INTEGER
  },
  notifAccounting: {
    type: DataTypes.INTEGER
  },
  notifAutomation: {
    type: DataTypes.INTEGER
  },
  notifAUTM: {
    type: DataTypes.INTEGER
  },
  notifAdmin: {
    type: DataTypes.INTEGER
  },
  displayTicket: {
    type: DataTypes.INTEGER
  },
  approveHead: {
    type: DataTypes.INTEGER,
    references:{
      model: User,
      key: 'login_id',
    }
  },
  approveAcctgStaff: {
    type: DataTypes.INTEGER,
    references:{
      model: User,
      key: 'login_id',
    }
  },
  approveAcctgSup: {
    type: DataTypes.INTEGER,
    references:{
      model: User,
      key: 'login_id',
    }
  },
  approveAutm: {
    type: DataTypes.INTEGER,
    references:{
      model: User,
      key: 'login_id',
    }
  },
  answer: {
    type: DataTypes.INTEGER
  },
  appTBranchHead: {
    type: DataTypes.STRING
  },
  appTAccStaff: {
    type: DataTypes.STRING
  },
  appTAccHead: {
    type: DataTypes.STRING
  },
  appTAutomationHead: {
    type: DataTypes.STRING
  },
  appTEdited: {
    type: DataTypes.STRING
  }
  
},{
  freezeTableName: true,
  timestamps: false
  });

Ticket.belongsTo(TicketDetails, { foreignKey: 'ticket_details_id', as: 'TicketDetails' });
Ticket.belongsTo(User, { foreignKey: 'login_id', as: 'UserTicket' });
Ticket.belongsTo(User, { foreignKey: 'assigned_person', as: 'AssignedTicket' });
Ticket.belongsTo(BranchList, { foreignKey: 'branch_id', as: 'Branch' });
Ticket.belongsTo(User, { foreignKey: 'approveHead', as: 'ApproveHead' });
Ticket.belongsTo(User, { foreignKey: 'approveAcctgStaff', as: 'ApproveAccountingStaff' });
Ticket.belongsTo(User, { foreignKey: 'approveAcctgSup', as: 'ApproveAccountingHead' });
Ticket.belongsTo(User, { foreignKey: 'approveAutm', as: 'AutomationHead' });
Ticket.belongsTo(User, { foreignKey: 'edited_by', as: 'Automation' });

module.exports = Ticket;
