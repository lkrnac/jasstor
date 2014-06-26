"use strict";
'use strict';
var fs = require('fs');
var should = require('should');
var Jasstor = require('../dist/jasstor.js');
var credentialsFile = 'testCredentials.txt';
var checkError = (function(err, done) {
  if (err) {
    done(err);
  }
});
describe('jasstor', (function() {
  describe('when creadentials file doesn\'t exist', (function() {
    var jasstor = new Jasstor(credentialsFile);
    beforeEach((function(done) {
      fs.unlink(credentialsFile, (function(err) {
        jasstor.saveCredentials('user', 'password', (function(err) {
          return done(err);
        }));
      }));
    }));
    it('should store the password', (function(done) {
      fs.readFile(credentialsFile, (function(err, data) {
        checkError(err, done);
        var jsonData = JSON.parse(data);
        jsonData.user.should.be.ok;
        jsonData.user.should.not.equal('password');
        done();
      }));
    }));
  }));
  describe('when creadentials file already exist', (function() {
    var jasstor = new Jasstor(credentialsFile);
    beforeEach((function(done) {
      jasstor.saveCredentials('user', 'password', (function(err) {
        return done(err);
      }));
    }));
    it('should ovewrite the existing paword', (function(done) {
      fs.readFile(credentialsFile, (function(err, data) {
        checkError(err, done);
        var jsonData = JSON.parse(data);
        var hashedPassword = jsonData.user;
        jasstor.saveCredentials('user', 'password1', (function(err) {
          checkError(err, done);
          fs.readFile(credentialsFile, (function(err, data) {
            checkError(err, done);
            var jsonData = JSON.parse(data);
            jsonData.user.should.not.equal(hashedPassword);
            done();
          }));
        }));
      }));
    }));
  }));
}));
