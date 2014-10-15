'use strict';

//this include is only for debugging purposes
//var traceur = require('traceur');

var Bluebird = require('bluebird');
var fs = require('fs');
// jshint -W098
var should = require('should');

var checkError = require('../test/testUtils').checkError;
import Jasstor from '../dist/jasstor.js';

var credentialsFile = 'testCredentials.txt';

describe('jasstor', () => {
  describe('when creadentials file doesn\'t exist', () => {
    var jasstor = new Jasstor(credentialsFile);
    beforeEach(done => {
      //ignore error when testing file didn't exist before deletion
      fs.unlink(credentialsFile, err => {
        jasstor.saveCredentials('user', 'password', err => done(err));
      });
    });
    it('should store the password', done => {
      fs.readFile(credentialsFile, (err, data) => {
        checkError(err, done);
        var jsonData = JSON.parse(data);
        jsonData.user.should.be.ok;
        jsonData.user.should.not.equal('password');
        done();
      });
    });
  });

  describe('when creadentials file already exist', () => {
    var jasstor = new Jasstor(credentialsFile);
    beforeEach((done) => {
      jasstor.saveCredentials('user', 'password', (err) => done(err));
    });
    it('should overwrite existing password', done => {
      fs.readFile(credentialsFile, (err, data) => {
        checkError(err, done);
        var jsonData = JSON.parse(data);
        var hashedPassword = jsonData.user;
        jasstor.saveCredentials('user', 'password1', err => {
          checkError(err, done);
          fs.readFile(credentialsFile, (err, data) => {
            checkError(err, done);
            var jsonData = JSON.parse(data);
            jsonData.user.should.not.equal(hashedPassword);
            done();
          });
        });
      });
    });
  });
});
