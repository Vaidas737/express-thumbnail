var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var lwip = require('lwip');


function convert(location, filepath, width, height, cb) {
  mkdirp(path.dirname(location), function(err) {
    if (err) { return cb(err); }

    lwip.open(filepath, function(err, image) {
      if (err) { return cb(err); }

      var widthRatio = width / image.width();
      var heightRatio = height / image.height();
      var ratio = Math.max(widthRatio, heightRatio);

      image
        .batch()
        .scale(ratio)
        .crop(width, height)
        .writeFile(location, function (err) {
          return cb(err);
        });
    });
  });
}

function register(rootDir, options) {

  rootDir = path.normalize(rootDir);

  options = options || {};
  options.cacheDir = options.cacheDir || path.join(rootDir, '.thumb'); // cache folder, default to [root dir]/.thumb

  return function (req, res, next) {
    var filename = path.normalize(decodeURI(req.url.replace(/\?(.*)/, '')));
    var filepath = path.join(rootDir, filename);
    var dimension = req.query.thumb || '';
    var dimensions = dimension.split('x');
    var location = path.join(options.cacheDir, dimension, filename);

    fs.stat(filepath, function (err, stats) {

      // go forward
      if (err || !stats.isFile()) { return next(); }

      // send original file
      if (!dimension) { return res.sendFile(filepath); }

      // send converted file
      fs.exists(location, function (exists) {

        // file was found in cache
        if (exists) { return res.sendFile(location); }

        // convert and send
        convert(location, filepath, +dimensions[0], +dimensions[1], function (err) {
          if (err) {
            console.log(err);
            return next();
          }
          return res.sendFile(location);
        });
      });
    });
  };
}

exports.register = register;
