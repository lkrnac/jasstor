'use strict';

module.exports.checkError = function(err, done) {
  if (err) {
    done(err);
  }
};
