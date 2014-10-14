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
      //ignore error when testing file didn't exist before deletion
      fs.unlink(credentialsFile, function (err) {
        jasstor.saveCredentials('user', 'password', function (err) {
          done(err);
        });
      });
    });
    it('should work when included into ES5 module', function(done) {
      fs.readFile(credentialsFile, function (err, data) {
        checkError(err, done);
        var jsonData = JSON.parse(data);
        jsonData.user.should.be.ok;
        jsonData.user.should.not.equal('password');
        done();
      });
    });
  });
