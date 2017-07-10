var connector = require('./connector');
var Promise = require('bluebird');
var Store = require('./mongoose-store');
var label = require('./config').module;

function _handleError(error) {
  console.error(label, error.toString());
  return Promise.reject(error);
}

/**
 *
 * Function to connect to mongoose and set up models based on schemas.
 *
 * Users have the option to set their own custom schemas if required.
 *
 * @param {string} mongoUrl - A valid mongodb connection URL
 * @param {object} options - Any custom connection parameters for the mongoose connection
 * @returns {bluebird|exports|module.exports}
 */
function connect(mongoUrl, options) {
   return connector.connectToMongo(mongoUrl, options);
}

function disconnect() {
  return connector.closeConnection();
}

function getDataAccessLayer(dataset) {
  return new Promise(function(resolve, reject) {
    if (!dataset) {
      return reject(new Error("Invalid  dataset " + dataset));
    }
    var mongoDal = new Store(dataset, connector.connection);
    resolve(mongoDal);
  });
}


module.exports = {
  getDAL: getDataAccessLayer,
  connect: connect,
  disconnect: disconnect
};
