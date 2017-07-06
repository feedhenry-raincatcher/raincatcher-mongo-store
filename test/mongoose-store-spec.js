'use strict';

var config = require('./../lib/config');
var assert = require('assert');
var Connector = require('./../lib');

var mongoUri = 'mongodb://localhost:27017/raincatcher-mongo2';

describe(config.module, function() {
  var testDal = {};
  var testDoc = {};

  before(function() {
    Connector.connect(mongoUri, {}).then(function() {
    });
  });

  it('should return an instance of workorders model', function(done) {
    Connector.getDAL('workorders').then(function(_dal) {
      _dal.init({}).then(function() {
        done();
      }, function(error) {
        done(error);
      });
    }, function(error) {
      done(error);
    });
  });

  it('should return an instance of workflows data access layer', function(done) {
    Connector.getDAL('workflows').then(function(_dal) {
      _dal.init({}).then(function() {
        done();
      }, function(error) {
        done(error);
      });
    }, function(error) {
      done(error);
    });
  });

  it('should return an instance of result data access layer', function(done) {
    Connector.getDAL('result').then(function(_dal) {
      testDal = _dal;
      _dal.init({}).then(function() {
        done();
      }, function(error) {
        done(error);
      });
    }, function(error) {
      done(error);
    });
  });

  it('should add item to result collection', function(done) {
    Connector.getDAL('result').then(function(_dal) {
      testDal = _dal;
      _dal.create({
        id: "testid",
        status: 'test',
        _localuid: "localid",
        workorderId: '1234567890'
      }).then(function(doc) {
        testDoc = doc;
        assert.equal(testDoc.status, 'test');
        done();
      }, function(error) {
        done(error);
      });
    });
  });

  it('should return a list of test records', function(done) {
    testDal.list().then(function(results) {
      done(assert.equal(results && results.length > 0, true));
    }, function(error) {
      done(error);
    });
  });

  it('should update test record', function(done) {
    var id = testDoc.id;
    testDal.update(testDoc).then(function(result) {
      testDoc = result;
      done(assert.equal(result.id, id));
    }, function(error) {
      done(error);
    });
  });

  it('should update with a local id', function(done) {
    testDal.update(testDoc).then(function(result) {
      testDoc = result;
      done(assert.equal(result._localuid, 'localid'));
    }, function(error) {
      done(error);
    });
  });

  it('should return an error if no record exists', function(done) {
    var id = "idontexist";
    testDal.read(id).then(function(data) {
      done(new Error("Expected an error but got ", data));
    }, function(error) {
      assert.ok(error, "Expected an error");
      done();
    });
  });

  it('should read test record', function(done) {
    var id = testDoc.id;
    testDal.read(id).then(function() {
      done();
    }, function(error) {
      done(error);
    });
  });

  it('should find test record by ID', function(done) {
    var id = testDoc.id;
    testDal.findById(id).then(function(result) {
      done(assert.equal(id, result.id));
    }, function(error) {
      done(error);
    });
  });

  it('should remove test record', function(done) {
    testDal.remove(testDoc).then(function() {
      done();
    }, function(error) {
      done(error);
    });
  });

  it('should close connection to db', function(done) {
    Connector.disconnect().then(function() {
      done();
    }, function(error) {
      done(error);
    });
  });
});
