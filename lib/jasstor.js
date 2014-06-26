/*
 * jasstor
 * https://github.com/lkrnac/jasstor
 *
 * Copyright (c) 2014 Lubos Krnac
 * Licensed under the MIT license.
 */

var fs = require('fs');

module.exports = class Jasstor {
  constructor(storageFile) {
    this.storageFile = storageFile;
  }
  saveCredentials(user, password, callback) {
    var passwords = {};
    var jsonPasswords = {};
    passwords[user] = password;
    jsonPasswords = JSON.stringify(passwords);

    fs.writeFile(this.storageFile, jsonPasswords, function (err) {
      callback(err);
    });

  }
};
