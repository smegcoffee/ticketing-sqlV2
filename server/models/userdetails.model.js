const { DataTypes } = require('sequelize');
const db = require('../config/db.config');

const UserDetails = db.define('user_details', {
  user_details_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_contact: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  profile_pic: {
    type: DataTypes.STRING,
    allowNull: true
  }
},{
  freezeTableName: true,
  timestamps: false
  });


module.exports = UserDetails;
