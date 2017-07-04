'use strict';

var label = '[fh-mongoose] ';
var Promise = require('bluebird');

var handlers = {
  onError: function(err) {
    console.error(label, err.toString());
  },
  onConnection: function(uri) {
    console.info(label, 'Connected to Mongo @', uri);
  },
  onConnectionOpen: function() {
    console.info(label, 'Mongo connection open');
  },
  onClose: function() {
    console.info(label, 'Mongo connection closed');
  }
};

var Db = {};
Db.connection = {};

Db.connectToMongo = function(_uri, _opts) {
  return new Promise(function(resolve, reject) {
    _opts = _opts || {};
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(_uri, _opts, function(err, db) {
      if (err || !db) {
        handlers.onError(err);
        reject(err);
      } else {
        Db.connection = db;
        handlers.onConnection(_uri);
        resolve(db);
      }
    });
  });
};

Db.getConfig= function() {
  var self = this;
  return new Promise(function(resolve) {
    // var self = Db;
    console.log(self);
    resolve(self.connection.config);
  });
};

Db.closeConnection= function() {
  var self = this;
  return new Promise(function(resolve) {
    self.connection.close(handlers.onClose);
    resolve(true);
  });
};

module.exports = Db;