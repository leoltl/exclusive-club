const mongoose = require('mongoose');

module.exports = function createDBconnection(connectionString) {
  mongoose.set('useCreateIndex', true);
  const connection = mongoose.createConnection(
    connectionString, { 
      useNewUrlParser: true, useUnifiedTopology: true 
    })
  
  
  //Bind connection to error event (to get notification of connection errors)
  connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
  return connection;
}
