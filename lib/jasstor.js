/*
 * jasstor
 * https://github.com/lkrnac/jasstor
 *
 * Copyright (c) 2014 Lubos Krnac
 * Licensed under the MIT license.
 */
'use strict';

//Traceur is included here only to provide runtime in transpiled ES5 code
// jshint -W098
var traceur = require('gulp-traceur');
var Bluebird = require('bluebird');

var fs = Bluebird.promisifyAll(require('fs'));
var bcrypt = Bluebird.promisifyAll(require('bcrypt'));

var hashPassword = password => {
  return new Promise(resolve => {
    bcrypt.genSaltAsync(10)
      .then(salt => {
        return bcrypt.hashAsync(password, salt);
      }).then(resolve);
  });
};

var readJsonFile = storageFile => {
  return new Promise((resolve, reject) => {
    fs.exists(storageFile, result => {
      if (result === true) {
        fs.readFileAsync(storageFile)
          .then(JSON.parse)
          .then(resolve)
          .catch(reject);
      } else {
        resolve({});
      }
    });
  });
};

module.exports = class Jasstor {
  constructor(storageFile) {
    this.storageFile = storageFile;
  }

  saveCredentials(user, password, role, callback) {
    readJsonFile(this.storageFile)
      .then(jsonData => {
        hashPassword(password)
          .then((hash) => {
            jsonData[user] = {
              password: hash,
              role: role
            };
            var jsonDataString = JSON.stringify(jsonData);

            fs.writeFile(this.storageFile, jsonDataString, callback);
          });
      });
  }

  verify(user, password, callback) {
    readJsonFile(this.storageFile)
      .then(jsonData => {
        var dataForUser = jsonData[user];
        if (dataForUser !== undefined) {
          bcrypt.compare(password, dataForUser.password, (err, result) => {
            if (result === true) {
              callback(err, dataForUser.role);
            } else {
              callback(err, undefined);
            }
          });
        } else {
          callback(undefined, undefined);
        }
      }).catch(callback);
  }

  getRole(user, callback) {
    readJsonFile(this.storageFile)
      .then(jsonData => {
        if (jsonData[user] !== undefined) {
          callback(undefined, jsonData[user].role);
        } else {
          callback(undefined, undefined);
        }
      }).catch(callback);
  }
};
