'use strict';

//this include is only for debugging purposes
//var traceur = require('traceur');
var fs = require('fs');
var should = require('should');

var checkError = require('../test/testUtils').checkError;
import Jasstor from '../dist/jasstor.js';

var credentialsFile = 'testCredentials.txt';

var verifyOk = (expectedRole, done) => {
  return (err, actualRole) => {
    checkError(err, done);
    actualRole.should.be.equal(expectedRole);
    done();
  };
};

var verifyNotOk = done => {
  return (err, actualRole) => {
    checkError(err, done);
    should(actualRole).not.be.ok;
    done();
  };
};

describe('jasstor', () => {
  describe('when creadentials file doesn\'t exist', () => {
    var jasstor = new Jasstor(credentialsFile);
    beforeEach(done => {
      //done callback is not passed directly
      //because we want to ignore possible error
      fs.unlink(credentialsFile, () => {
        done();
      });
    });

    it('should store encrypted password', done => {
      jasstor.saveCredentials('user', 'password', 'role', () => {
        fs.readFile(credentialsFile, (err, data) => {
          checkError(err, done);
          var jsonDataForUser = JSON.parse(data).user;
          jsonDataForUser.password.should.be.ok;
          jsonDataForUser.password.should.not.equal('password');
          done();
        });
      });
    });

    it('should refuse non-existing user', done => {
      jasstor.verify('user1', 'password1', verifyNotOk(done));
    });
  });

  describe('when creadentials file already exist', () => {
    var jasstor = new Jasstor(credentialsFile);
    beforeEach(done => {
      fs.unlink(credentialsFile, () => {
        jasstor.saveCredentials('user', 'password', 'role', done);
      });
    });

    it('should overwrite existing password', done => {
      fs.readFile(credentialsFile, (err, data) => {
        checkError(err, done);
        var jsonData = JSON.parse(data);
        var originalPassword = jsonData.user.password;
        jasstor.saveCredentials('user', 'password1', 'role', err => {
          checkError(err, done);
          fs.readFile(credentialsFile, (err, data) => {
            checkError(err, done);
            var changedPassword = JSON.parse(data).user.password;
            changedPassword.should.not.equal(originalPassword);
            done();
          });
        });
      });
    });

    it('should store various passwords', done => {
      jasstor.saveCredentials('user1', 'password1', 'role1', () => {
        jasstor.verify('user1', 'password1', verifyOk('role1', () => {
          jasstor.verify('user', 'password', verifyOk('role', done));
        }));
      });
    });

    it('should accept correct password', done => {
      jasstor.verify('user', 'password', verifyOk('role', done));
    });

    it('should refuse incorrect password', done => {
      jasstor.verify('user', 'password1', verifyNotOk(done));
    });

    it('should refuse non-existing user', done => {
      jasstor.verify('user1', 'password1', verifyNotOk(done));
    });

    it('should return correct role for existing user', done => {
      jasstor.getRole('user', (err, role) => {
        checkError(err);
        'role'.should.be.equal(role);
        done();
      });
    });

    it('should not find role for non-existing user', done => {
      jasstor.getRole('user1', (err, role) => {
        checkError(err);
        should(role).be.undefined;
        done();
      });
    });
  });
});
