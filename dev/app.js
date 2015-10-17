var express = require('express');

var expressThumbnail = require('../expressThumbnail');

var app = express();

app.use(expressThumbnail.register(__dirname + '/images'));

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Server listening at http://%s:%s", host, port);
});