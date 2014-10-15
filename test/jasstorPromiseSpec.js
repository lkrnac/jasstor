'use strict';
//this include is only for debugging purposes
//var traceur = require('traceur');

var Bluebird = require('bluebird');
var fs = Bluebird.promisifyAll(require('fs'));
// jshint -W098
var should = require('should');

import Jasstor from '../dist/jasstor.js';

var credentialsFile = 'testCredentials.txt';

var readFilePromise = function (credentialsFile, userName) {
  return fs.readFileAsync(credentialsFile)
    .then(JSON.parse)
    .then(jsonData => {
      return jsonData[userName];
    })
    .catch((err) => {
      throw err;
    });
};

describe('jasstor tested with promises', () => {
  var jasstorWithCallbacks = new Jasstor(credentialsFile);
  var jasstor = Bluebird.promisifyAll(jasstorWithCallbacks);

  describe('when creadentials file doesn\'t exist', () => {
    beforeEach(done => {
      //ignore error when testing file didn't exist before deletion
      fs.unlink(credentialsFile, err => {
        jasstor.saveCredentials('user', 'password', err => done(err));
      });
    });
    it('should store the password', done => {
      var password = readFilePromise(credentialsFile, 'user');
      password.should.not.equal('password');
      done();
    });
  });

  describe('when creadentials file already exist', () => {
    beforeEach((done) => {
      jasstor.saveCredentials('user', 'password', (err) => done(err));
    });
    it('should overwrite existing password', done => {
      var originalPassword = readFilePromise(credentialsFile, 'user');
      var newPassword;
      jasstor.saveCredentialsAsync('user', 'password1')
        .then(() => {
          newPassword = readFilePromise(credentialsFile, 'user');
          newPassword.should.be.ok;
          originalPassword.should.be.ok;
          newPassword.should.not.equal(originalPassword);
          done();
        })
        .catch((err) => {
          throw err;
        });
    });
    //it('should')
  });

});