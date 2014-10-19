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

// jshint -W072
var verifyNotOk = (jasstor, user, password, done) => {
  jasstor.verifyAsync(user, password)
    .then((result) => {
      result.should.not.be.ok;
      done();
    }).catch(done);
};

var verifyOk = (jasstor, user, password, done) => {
  jasstor.verifyAsync(user, password)
    .then((result) => {
      result.should.be.ok;
      done();
    }).catch(done);
};

describe('jasstor tested with promises', () => {
  var jasstor = Bluebird.promisifyAll(new Jasstor(credentialsFile));

  describe('when creadentials file doesn\'t exist', () => {
    beforeEach(done => {
      //ignore error when testing file didn't exist before deletion
      fs.unlink(credentialsFile, err => {
        jasstor.saveCredentials('user', 'password', done);
      });
    });

    it('should store the password', done => {
      var password = readFilePromise(credentialsFile, 'user');
      password.should.not.equal('password');
      done();
    });

    it('should refuse non-existing user', done => {
      verifyNotOk(jasstor, 'user1', 'password1', done);
    });
  });

  describe('when creadentials file already exist', () => {
    beforeEach((done) => {
      jasstor.saveCredentials('user', 'password', done);
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
        .catch(done);
    });

//    it('should store various passwords', done => {
//      jasstor.saveCredentials('user1', 'password1', done);
//
//    });
    it('should accept correct password', done => {
      verifyOk(jasstor, 'user', 'password', done);
    });

    it('should refuse incorrect password', done => {
      verifyNotOk(jasstor, 'user', 'password1', done);
    });

    it('should refuse non-existing user', done => {
      verifyNotOk(jasstor, 'user1', 'password1', done);
    });
  });

});
