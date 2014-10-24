'use strict';
//this include is only for debugging purposes
//var traceur = require('traceur');

var Bluebird = require('bluebird');
var fs = Bluebird.promisifyAll(require('fs'));
var should = require('should');

import Jasstor from '../dist/jasstor.js';

var credentialsFile = 'testCredentials.txt';

var readFilePromise = function (credentialsFile, userName) {
  return fs.readFileAsync(credentialsFile)
    .then(JSON.parse)
    .then(jsonData => {
      return jsonData[userName].password;
    })
    .catch((err) => {
      throw err;
    });
};


var verifyNotOk = (jasstor, user, password, done) => {
  jasstor.verifyAsync(user, password)
    .then(result => {
      should(result).not.be.ok;
      done();
    }).catch(done);
};

/* jshint maxparams: 5 */
var verifyOk = (jasstor, user, password, expectedRole, done) => {
  jasstor.verifyAsync(user, password)
    .then(actualRole => {
      actualRole.should.be.equal(expectedRole);
      done();
    }).catch(done);
};

describe('jasstor tested with promises', () => {
  var jasstor = Bluebird.promisifyAll(new Jasstor(credentialsFile));

  describe('when creadentials file doesn\'t exist', () => {
    beforeEach(done => {
      //done callback is not passed into finally block directly
      //because we want to ignore possible error
      fs.unlinkAsync(credentialsFile)
        .finally(() => {
          done();
        });
    });

    it('should store encrypted password', done => {
      jasstor.saveCredentialsAsync('user', 'password', 'role')
        .then(() => {
          var password = readFilePromise(credentialsFile, 'user');
          password.should.not.equal('password');
          done();
        }).catch(done);
    });

    it('should refuse non-existing user', done => {
      verifyNotOk(jasstor, 'user1', 'password1', done);
    });
  });

  describe('when creadentials file already exist', () => {
    beforeEach(done => {
      fs.unlinkAsync(credentialsFile)
        .finally(() => {
          jasstor.saveCredentials('user', 'password', 'role', done);
        });
    });

    it('should overwrite existing password', done => {
      var originalPassword = readFilePromise(credentialsFile, 'user');
      var newPassword;
      jasstor.saveCredentialsAsync('user', 'password1', 'role')
        .then(() => {
          newPassword = readFilePromise(credentialsFile, 'user');
          newPassword.should.be.ok;
          originalPassword.should.be.ok;
          newPassword.should.not.equal(originalPassword);
          done();
        })
        .catch(done);
    });

    it('should store various passwords', done => {
      jasstor.saveCredentialsAsync('user1', 'password1', 'role1')
        .then(() => {
          verifyOk(jasstor, 'user1', 'password1', 'role1', () => {
            verifyOk(jasstor, 'user', 'password', 'role', done);
          });
        })
        .catch(done);
    });
    it('should accept correct password', done => {
      verifyOk(jasstor, 'user', 'password', 'role', done);
    });

    it('should refuse incorrect password', done => {
      verifyNotOk(jasstor, 'user', 'password1', done);
    });

    it('should refuse non-existing user', done => {
      verifyNotOk(jasstor, 'user1', 'password1', done);
    });

    it('should return correct role for existing user', done => {
      jasstor.getRoleAsync('user')
        .then(role => {
          role.should.be.equal('role');
          done();
        }).catch(done);
    });

    it('should not find role for non-existing user', done => {
      jasstor.getRoleAsync('user1')
        .then(role => {
        should(role).be.undefined;
        done();
      }).catch(done);
    });
  });

});
