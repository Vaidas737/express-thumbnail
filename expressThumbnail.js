var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var imageMagick = require('gm').subClass({ imageMagick: true });

var expressThumbnail = module.exports;

// Register middleware.
expressThumbnail.register = function(rootDir, options) {

  rootDir = path.normalize(rootDir);

  options = options || {};
  options.cacheDir = options.cacheDir || path.join(rootDir, '.thumb');       // cache folder, default to {root dir}/.thumb
  options.quality = options.quality || 80;                                   // compression level, default to 80
  options.gravity = options.gravity || 'Center';                             // thumbnail gravity, default to Center

  return function (req, res, next) {
    var filename = decodeURI(req.url.replace(/\?(.*)/, ''));                 // file name in root dir
    var filepath = path.join(rootDir, filename);                             // file path
    var dimension = req.query.thumb || '';                                   // thumbnail dimensions
    var location = path.join(options.cacheDir, dimension, filename);         // file location in cache

    // send converted file from cache
    function sendConverted() {
      var dimensions = dimension.split('x');
      var convertOptions = {
        filepath: filepath,
        location: location,
        width: dimensions[0],
        height: dimensions[1],
        quality: options.quality,
        gravity: options.gravity
      };

      expressThumbnail.convert(convertOptions, function (err) {
        if (err) {
          console.log(err);
          return next();
        }
        return res.sendFile(location);
      });
    }

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
        sendConverted();
      });
    });
  };
};

// Convert the image and store in the cache.
expressThumbnail.convert = function(options, callback) {
  mkdirp(path.dirname(options.location), function(err) {
    if (err) { return callback(err); }
    var img = imageMagick(options.filepath).gravity(options.gravity);
    img.thumb(options.width, options.height, options.location, options.quality, function(err, stdout, stderr, command) {
      return err ? callback(err) : callback(null);
    });
  });
};