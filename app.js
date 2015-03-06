var express  = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var logger = require('morgan');
var port = process.env.PORT || 3000;
var mongoURI = process.env.MONGOURI || "mongodb://localhost/test";

var app = express();
mongoose.connect(mongoURI);

app.use(express.static(__dirname + '/public/' ));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.listen(port);