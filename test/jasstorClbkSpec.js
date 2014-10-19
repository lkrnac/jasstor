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

var verifyOk = (done) => {
  return (err, result) => {
    checkError(err, done);
    result.should.be.ok;
    done();
  };
};

var verifyNotOk = (done) => {
  return (err, result) => {
    checkError(err, done);
    result.should.not.be.ok;
    done();
  };
};

describe('jasstor', () => {
  describe('when creadentials file doesn\'t exist', () => {
    var jasstor = new Jasstor(credentialsFile);
    beforeEach(done => {
      fs.unlink(credentialsFile, done);
    });

    it('should store the password', done => {
      jasstor.saveCredentials('user', 'password', () => {
        fs.readFile(credentialsFile, (err, data) => {
          checkError(err, done);
          var jsonData = JSON.parse(data);
          jsonData.user.should.be.ok;
          jsonData.user.should.not.equal('password');
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
    beforeEach((done) => {
      fs.unlink(credentialsFile, () => {
        jasstor.saveCredentials('user', 'password', done);
      });
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

    it('should store various passwords', done => {
      jasstor.saveCredentials('user1', 'password1', () => {
        jasstor.verify('user1', 'password1', verifyOk(() => {
          jasstor.verify('user', 'password', verifyOk(done));
        }));
      });
    });

    it('should accept correct password', done => {
      jasstor.verify('user', 'password', verifyOk(done));
    });

    it('should refuse incorrect password', done => {
      jasstor.verify('user', 'password1', verifyNotOk(done));
    });

    it('should refuse non-existing user', done => {
      jasstor.verify('user1', 'password1', verifyNotOk(done));
    });
  });
});
