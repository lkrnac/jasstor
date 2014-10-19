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

module.exports = class Jasstor {
  constructor(storageFile) {
    this.storageFile = storageFile;
  }

  saveCredentials(user, password, callback) {
    hashPassword(password, (err, hash) => {
      var passwords = {};
      var jsonPasswords = {};
      passwords[user] = hash;
      jsonPasswords = JSON.stringify(passwords);

      fs.writeFile(this.storageFile, jsonPasswords, err => callback(err));
    });
  }

  verify(user, password, callback) {
    fs.exists(this.storageFile, (result) => {
      if (result === false) {
        callback(null, false);
      } else {
        fs.readFile(this.storageFile, (err, data) => {
          var jsonData = JSON.parse(data);
          var storedPassword = jsonData[user];
          if (storedPassword === undefined) {
            callback(null, false);
          } else {
            bcrypt.compare(password, storedPassword, callback);
          }
        });
      }
    });
  }
};
