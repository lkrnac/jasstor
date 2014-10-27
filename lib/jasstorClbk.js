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

var fs = require('fs');
var bcrypt = require('bcrypt');

var hashPassword = (password, callback) => {
  bcrypt.genSalt(10, (err, salt) => bcrypt.hash(password, salt, callback));
};

var readJsonFile = (storageFile, callback) => {
  fs.exists(storageFile, (result) => {
    if (result === false) {
      callback(null, {});
    } else {
      fs.readFile(storageFile, (err, data) => {
        var jsonData = JSON.parse(data);
        callback(err, jsonData);
      });
    }
  });
};

module.exports = class Jasstor {
  constructor(storageFile) {
    this.storageFile = storageFile;
  }

  saveCredentials(user, password, role, callback) {
    readJsonFile(this.storageFile, (err, jsonData) => {
      hashPassword(password, (err, hash) => {
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
    readJsonFile(this.storageFile, (err, jsonData) => {
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
        callback(err, undefined);
      }
    });
  }

  getRole(user, callback) {
    readJsonFile(this.storageFile, (err, jsonData) => {
      if (jsonData[user] !== undefined){
        callback(err, jsonData[user].role);
      } else {
        callback(err, undefined);
      }
    });
  }
};
