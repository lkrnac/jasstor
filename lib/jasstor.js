/*
 * jasstor
 * https://github.com/lkrnac/jasstor
 *
 * Copyright (c) 2014 Lubos Krnac
 * Licensed under the MIT license.
 */

var fs = require('fs');
var bcrypt = require('bcrypt');

var hashPassword = (password, callback) => {
  'use strict';
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
};
