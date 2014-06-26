'use strict';

var fs = require('fs');
// jshint -W098
var should = require('should');

var Jasstor = require('../dist/jasstor.js');

var credentialsFile = 'testCredentials.txt';

var checkError = function (err, done) {
  if (err) {
    done(err);
  }
};

var callTestingMethod = function (done) {
  var jasstor = new Jasstor(credentialsFile);
  jasstor.saveCredentials('user', 'password', function () {
    done();
  });
};

describe('jasstor', function () {
  describe('when creadentials file doesn\'t exist', function () {
    beforeEach(function (done) {
      fs.unlink(credentialsFile, function (err) {
        //ignore error when testing file didn't exist before deletion
        callTestingMethod(done);
      });
    });
    it('should store the password',
      function (done) {
        fs.readFile(credentialsFile, function (err, data) {
          checkError(err, done);
          var jsonData = JSON.parse(data);
          jsonData.user.should.be.ok;
          jsonData.user.should.not.equal('password');
          done();
        });
      });
  });
});
