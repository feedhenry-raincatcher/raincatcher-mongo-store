'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var buildQuery = require('./query-builder');


// TODO move to CRUD http://mongodb.github.io/node-mongodb-native/2.1/tutorials/crud/
/**
 *
 * A single mongoose store for a single data set (e.g. workorders etc)
 *
 * @param {string} _datasetId - The ID of the data set for this store
 * @param {Model} _model - The mongoose model associated with this data set.
 * @constructor
 */
function Store(_datasetId, mongoConnection) {
  this.db = mongoConnection;
  this.datasetId = _datasetId;
}

Store.prototype.init = function(data) {
  var self = this;
  if (!_.isArray(data)) {
    console.log("Initialization data is not array.");
    return Promise.resolve();
  }

  return Promise.map(data, function(entry) {
    self.db.collection(self.datasetId).insertOne(entry).catch(function(err) {
      return self.handleError(undefined, err);
    });
  });
};

Store.prototype.isPersistent = true;

/**
 *
 * Handling an error response that includes an ID.
 *
 * If it's a mongoose Validation Error, it should include the mongoose validation error message.
 *
 * @param {string} id - An ID to pass include with the error
 * @param {Promise} error - The error to handle
 */
Store.prototype.handleError = function handleError(id, error) {
  if (!(error instanceof Error)) {
    error = new Error(error);
  }
  error.message += " (" + this.datasetId + ")";
  error.id = id;
  return Promise.reject(error);
};

Store.prototype.create = function(object) {
  var self = this;
  return self.db.collection(self.datasetId).insertOne(object).then(function() {
    return object;
  }).catch(function(err) {
    return self.handleError(undefined, err);
  });
};

Store.prototype.findById = function(id) {
  var self = this;

  return self.db.collection(self.datasetId).findOne({id: id}, {_id: 0}).catch(function(err) {
    return self.handleError(id, err);
  });
};

Store.prototype.read = function(id) {
  var self = this;
  return self.db.collection(self.datasetId).findOne({id: id}, {_id: 0}).then(function(result) {
    if (!result) {
      return Promise.reject();
    }
    return result;
  }).catch(function(err) {
    return self.handleError(id, err);
  });
};

Store.prototype.update = function(object) {
  var self = this;

  var query;

  if (!_.isObject(object)) {
    return self.handleError(null, new Error("Expected an object to update"));
  }

  if (object._id) {
    delete object._id;
  }
  if (object.id) {
    query = {id: object.id};
  } else if (object._localuid) {
    query = {_localuid: object._localuid};
  } else {
    return self.handleError(null, new Error("Expected the object to have either an id or _localuid field"));
  }
  return new Promise(function(resolve, reject) {
    return self.db.collection(self.datasetId).replaceOne(query, object, {wtimeout: 10000}).catch(function(err) {
      return reject(err);
    }).then(function() {
      return resolve(object);
    });
  });
};

/**
 *
 * @param object
 * @returns {Promise}
 */
Store.prototype.remove = function(object) {
  var self = this;
  var id = object instanceof Object ? object.id : object;
  return self.db.collection(self.datasetId).deleteOne({id: id}).catch(function(err) {
    return self.handleError(id, err);
  });
};

/**
 *
 * Listing documents for a model.
 *
 * @param {object} filter - Optional filter to pass when listing documents for a model. (See https://docs.mongodb.com/manual/tutorial/query-documents/)
 */
Store.prototype.list = function(filter) {
  var self = this;
  filter = filter || {};

  var query = buildQuery(filter);

  var resultPromise = self.db.collection(self.datasetId).find(query);

  if (filter.sort && typeof filter.sort === 'object') {
    resultPromise = resultPromise.sort(filter.sort);
  }
  return resultPromise.toArray().catch(function(err) {
    return self.handleError(undefined, err);
  });
};

Store.prototype.buildQuery = buildQuery;

require('./listen')(Store);

module.exports = Store;