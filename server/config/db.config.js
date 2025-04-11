// const { Sequelize } = require('sequelize');

// // Create a connection pool
// const sequelize = new Sequelize('ticketingdb', 'root', 'D@pho04051983', {
//   host: 'localhost',
//   dialect: 'mysql',
//   dialectOptions: {
//     connectTimeout: 60000 // Set the timeout to 60 seconds
//   },
//   pool: {
//     // max: 500, // Adjust the maximum number of connections
//     // min: 0,
//     acquire: 120000,
//     idle: 10000,
//   },
//   logging: console.log
// });

// module.exports = sequelize;

const { Sequelize } = require('sequelize');

// Create a new Sequelize instance
const sequelize = new Sequelize({
  database: 'ticketingdb',
  username: 'root',
  password: '',
  host: 'localhost',
  dialect: 'mysql', // Change this to the appropriate dialect
  dialectOptions: {
    connectTimeout: 60000 // Set the timeout to 60 seconds
  },
  // pool: {
  //   // Adjust the pool settings as per your requirements
  //   // max: 5, // Maximum number of connections in the pool
  //   // min: 0, // Minimum number of connections in the pool
  //   acquire: 60000, // Maximum time, in milliseconds, that pool will try to get the connection before throwing an error
  //   idle: 10000 // Maximum time, in milliseconds, that a connection can be idle before being released
  // },
  logging: console.log // If you want to log SQL queries
});

// Test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
