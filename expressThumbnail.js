var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var lwip = require('lwip');

var expressThumbnail = module.exports;

expressThumbnail.register = function(rootDir, options) {

  rootDir = path.normalize(rootDir);

  options = options || {};
  options.cacheDir = options.cacheDir || path.join(rootDir, '.thumb');       // cache folder, default to [root dir]/.thumb

  return function (req, res, next) {
    var filename = decodeURI(req.url.replace(/\?(.*)/, ''));                 // file name in root dir
    var filepath = path.join(rootDir, filename);                             // file path
    var dimension = req.query.thumb || '';                                   // thumbnail dimensions
    var location = path.join(options.cacheDir, dimension, filename);         // file location in cache

    function sendConverted() {
      var dimensions = dimension.split('x');
      var convertOptions = {
        filepath: filepath,
        location: location,
        width: dimensions[0],
        height: dimensions[1]
      };

      convert(convertOptions, function (err) {
        if (err) {
          console.log(err);
          return next();
        }
        return res.sendFile(location);
      });
    }

    function createThumbnail(options, callback) {
      lwip.open(options.filepath, function(err, image) {
        if (err) { return callback(err); }

        var widthRatio = options.width / image.width();
        var heightRatio = options.height / image.height();
        var ratio = Math.max(widthRatio, heightRatio);

        image
          .batch()
          .scale(ratio)
          .crop(+options.width, +options.height)
          .writeFile(options.location, function (err) {
            return callback(err);
          });
      });
    }

    function convert(options, callback) {
      mkdirp(path.dirname(options.location), function(err) {
        if (err) { return callback(err); }
        createThumbnail(options, callback);
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
