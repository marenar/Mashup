var express  = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var logger = require('morgan');
var request = require('request');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var hbs = require('express-handlebars');


// ----- Startup
var port = process.env.PORT || 8080;
var mongoURI = process.env.MONGOURI || "mongodb://localhost/test";

var app = express();
mongoose.connect(mongoURI);



// ----- Config Templating
var hbsOptions = {
	defaultLayout: 'main',
	extname: 'hbs'
};
app.engine('hbs', hbs(hbsOptions));
app.set('views', path.join(__dirname, 'views', 'pages'));
app.set('view engine', 'hbs');


// ----- Config Middleware
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


// ----- Initilize data for Feedly connection
var FeedlyObj = require('feedly-node');
var feedly = new FeedlyObj({
	id: process.env.MYCLIENTID,
	secret: process.env.MYCLIENTSECRET,
	protocol: 'http', // optional, feedly recommends http, but I do not.
	redirect_uri: 'http://localhost:8080/' // set to your own redirect
});


// ----- Custom Authentication Middleware
// TODO: get session to be persistent across refreshes
app.use('/', function(req, res, next) {

    // FIXME: This may never fire at present,
    //  but should be catching most post-login traffic
    // If user is already authed, continue
	if (feedly.access_token) next();

    // If the user has been redirected with the code, use it
    else if (req.query.code) next();

    // Otherwise redirect user to auth via Feedly's OAuth system
	else res.redirect( feedly.createURL() );
});


// ----- Routing
// TODO: Add routes -The index route cannot go into auth file
// because it requires the feedly object, which lives in this namespace
// var auth = require('./routes/auth');

app.get('/', function(req, res) {
    var code = req.query.code;
    if( code ) {
        feedly.getAccessToken(code, function(err, access_token) {
            if (err) return console.log(err);
            feedly.setAccessToken(access_token);

            // FIXME: Dummy render to serve as test
            feedly.get('/profile', function(err, response) {
                if (err) return res.sendStatus(500);
                 res.render('index', {data: response});
            });
        });
    }
});

app.listen(port);
