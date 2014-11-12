# jasstor 

[![Build Status](https://drone.io/github.com/lkrnac/jasstor/status.png)](https://drone.io/github.com/lkrnac/jasstor/latest)
[![Coverage Status](https://coveralls.io/repos/lkrnac/jasstor/badge.png?branch=master)](https://coveralls.io/r/lkrnac/jasstor?branch=master)
[![Dependency Status](https://david-dm.org/lkrnac/jasstor.svg?theme=shields.io)](https://david-dm.org/lkrnac/jasstor)
[![devDependency Status](https://david-dm.org/lkrnac/jasstor/dev-status.svg?theme=shields.io)](https://david-dm.org/lkrnac/jasstor#info=devDependencies)
[![license](http://img.shields.io/npm/l/jasstor.svg)](http://img.shields.io/npm/l/jasstor.svg)
[![NPM](https://nodei.co/npm/jasstor.png)](https://nodei.co/npm/jasstor/)

Simple file storage for credentials (Node.js module).

## Features
 - Stores credentials (user, hashed password) and role name into JSON file
 - Handles verification of given username and password
 - Reads role for given user
 - Passwords are hashed with [bcrypt](https://github.com/ncb000gt/node.bcrypt.js)

## Installation
```Shell
npm install jasstor
```

## Getting Started
```javascript
var Jasstor = require('jasstor');
var jasstor = new Jasstor('credentials.txt');

//Encrypt and store password into JSON file
jasstor.saveCredentials('user', 'password', 'role', function(err){
  if (err) {
    //handle error
  }
});

//Verify credentials and read user's role
jasstor.verify('user', 'password', function(err, role){
  if (role){
    //user authenticated with role
  } else {
    //user don't exist or wrong password
  }
});

//Read role for user
jasstor.getRole('user', function (err, role) {
  if (role){
    //user has role
  } else {
    //user don't exist
  }
});

```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Gulp](http://gulpjs.com/).

### Build
```Shell
npm install
npm test
```

## License
Copyright (c) 2014 Lubos Krnac. Licensed under the MIT license.
