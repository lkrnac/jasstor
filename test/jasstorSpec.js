'use strict';

var fs = require('fs');
// jshint -W098
var should = require('should');

var Jasstor = require('../dist/jasstor.js');

var credentialsFile = 'testCredentials.txt';

var checkError = (err, done) => {
  if (err) {
    done(err);
  }
};

var callTestingMethod = (done) => {
  var jasstor = new Jasstor(credentialsFile);
  jasstor.saveCredentials('user', 'password', () => done());
};

describe('jasstor', () => {
  describe('when creadentials file doesn\'t exist', () => {
    beforeEach((done) => {
      //ignore error when testing file didn't exist before deletion
      fs.unlink(credentialsFile, (err) => callTestingMethod(done));
    });
    it('should store the password', (done) => {
      fs.readFile(credentialsFile, (err, data) => {
        checkError(err, done);
        var jsonData = JSON.parse(data);
        jsonData.user.should.be.ok;
        jsonData.user.should.not.equal('password');
        done();
      });
    });
  });
});
