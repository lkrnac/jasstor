'use strict';

// jshint -W098
var should = require('should');
var fs = require('fs');

var Jasstor = require('../dist/jasstor');
var checkError = require('./testUtils').checkError;

var credentialsFile = 'testCredentials.txt';

describe('Transpiled Jasstor library', function () {
  var jasstor = new Jasstor(credentialsFile);
  beforeEach(function (done) {
    //done callback is not passed directly
    //because we want to ignore possible error
    fs.unlink(credentialsFile, function () {
      done();
    });
  });

  it('should store encrypted password', function (done) {
    jasstor.saveCredentials('user', 'password', 'role', function () {
      fs.readFile(credentialsFile, function (err, data) {
        checkError(err, done);
        var jsonDataForUser = JSON.parse(data).user;
        jsonDataForUser.password.should.be.ok;
        jsonDataForUser.password.should.not.equal('password');
        done();
      });
    });
  });
});
