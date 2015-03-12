var express  = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var logger = require('morgan');
var port = process.env.PORT || 8080;
var mongoURI = process.env.MONGOURI || "mongodb://localhost/test";
var request = require('request');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var hbs = require('express-handlebars');

var app = express();
mongoose.connect(mongoURI);
var FeedlyObj = require('feedly-node');

app.use(express.static(__dirname + '/public/' ));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

var feedly = new FeedlyObj({
	id: process.env.MYCLIENTID,
	secret: process.env.MYCLIENTSECRET,
	protocol: 'http', // optional, feedly recommends http, but I do not.
	redirect_uri: 'http://localhost:8080/' // set to your own redirect
});


app.use(function(req, res, next) {
	console.log("middleware");
	if (feedly.access_token) next();
	else if (req.session.access_token) {
		feedly.setAccessToken(req.session.access_token);
		next();
	} else if (req.query.code) {
		next();
	} else {
		var url = feedly.createURL();
		if (req.url === '/') {
			req.session.myUrl = '/#/home';
		} else {
			req.session.myUrl = req.url;
		}
		console.log(req.session.myUrl);
		res.redirect(url);
	}
});

app.get('/', function(req, res) {
	var code = req.query.code;
	feedly.getAccessToken(code, function(err, access_token) {
		if (err) {
			console.log(err);
		} else {
			req.session.access_token = access_token;
			console.log(req.session.myUrl);
			res.redirect(req.session.myUrl);
		}
	})
});

var feedly = new FeedlyObj({
	id: process.env.MYCLIENTID,
	secret: process.env.MYCLIENTSECRET,
	protocol: 'http', // optional, feedly recommends http, but I do not.
	redirect_uri: 'http://localhost:8080/' // set to your own redirect
});


app.use('/', function(req, res, next) {
	if (feedly.access_token) next();
	else if (req.session.access_token) {
		feedly.setAccessToken(req.session.access_token);
		next();
	} else if (req.query.code) {
		next();
	} else {
		var url = feedly.createURL();
		res.redirect(url);
	}
});

app.get('/', function(req, res) {
    var code = req.query.code;
	feedly.getAccessToken(code, function(err, access_token) {
		if (err) {
			console.log(err);
		} else {
			req.session.access_token = access_token;
			res.redirect('/access');
		}
	})
});

app.get('/access', function(req, res) {
    res.sendFile(__dirname + '/views/layout.html');
	feedly.get('/profile', function(err, response) {
		if (err) return res.sendStatus(500);
		//res.json(response);
        ;
	})	
});

app.listen(port);
