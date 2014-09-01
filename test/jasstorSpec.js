'use strict';

//this include is only for debugging purposes
//var traceur = require('traceur');

var Bluebird = require('bluebird');
var fs = Bluebird.promisifyAll(require('fs'));
// jshint -W098
var should = require('should');

import Jasstor from '../dist/jasstor.js';

var credentialsFile = 'testCredentials.txt';

var checkError = (err, done) => {
  if (err) {
    done(err);
  }
};

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
    it('should ovewrite the existing password', done => {
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

  describe('when creadentials file already exist using promises', () => {
    var jasstorWithCallbacks = new Jasstor(credentialsFile);
    var jasstor = Bluebird.promisifyAll(jasstorWithCallbacks);
    beforeEach((done) => {
      jasstor.saveCredentials('user', 'password', (err) => done(err));
    });
    it('should ovewrite the existing paword', done => {
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
  });

});
