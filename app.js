var express  = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var logger = require('morgan');
var request = require('request');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var hbs = require('express-handlebars');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var routes = require('./routes/index.js');


// ----- Startup
var port = process.env.PORT || 3000;
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
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

passport.use(new FacebookStrategy({
	clientID: process.env.FACEBOOK_APP_ID,
	clientSecret: process.env.FACEBOOK_APP_SECRET,
	callbackURL: 'http://localhost:3000/auth/facebook/callback'
}, function(accessToken, refreshToken, profile, done) {
	process.nextTick(function () {
		return done(null, profile);
	});
}
));


// ----- Routing
// TODO: Add routes -The index route cannot go into auth file
// because it requires the feedly object, which lives in this namespace
// var auth = require('./routes/auth');

app.get('/', routes.main);
app.get('/login', routes.login);
app.get('/update', routes.update);
app.get('/createUser', routes.createUser);
app.post('/vote', routes.vote);

app.get('/auth/facebook', 
passport.authenticate('facebook'),
function(req, res){
});

app.get('/auth/facebook/callback',
passport.authenticate('facebook', { failureRedirect: '/login' }),
function(req, res) {
 	res.redirect('/createUser');
});

app.listen(port);
