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
  bcrypt.genSalt(10, (err, salt) =>
    bcrypt.hash(password, salt, (err, hash) => callback(err, hash))
  );
};

var readJsonFile = (storageFile, callback) => {
  fs.exists(storageFile, (result) => {
    if (result === false) {
      callback(null, {});
    } else {
      fs.readFile(storageFile, (err, data) => {
        var jsonData = JSON.parse(data);
        callback(null, jsonData);
      });
    }
  });
};

module.exports = class Jasstor {
  constructor(storageFile) {
    this.storageFile = storageFile;
  }

  saveCredentials(user, password, callback) {
    readJsonFile(this.storageFile, (err, jsonData) => {
      hashPassword(password, (err, hash) => {
        jsonData[user] = hash;
        var jsonDataString = JSON.stringify(jsonData);

        fs.writeFile(this.storageFile, jsonDataString, callback);
      });
    });
  }

  verify(user, password, callback) {
    readJsonFile(this.storageFile, (err, jsonData) => {
      var storedPassword = jsonData[user];
      if (storedPassword === undefined) {
        callback(null, false);
      } else {
        bcrypt.compare(password, storedPassword, callback);
      }
    });
  }
};
