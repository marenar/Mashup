var mongoose = require('mongoose');
var Post = require('../models/post');
var request = require('request');

// ----- Initilize data for Feedly connection
var FeedlyObj = require('feedly-node');
var feedly = new FeedlyObj({
	id: process.env.MYCLIENTID,
	secret: process.env.MYCLIENTSECRET,
	protocol: 'http', // optional, feedly recommends http, but I do not.
	redirect_uri: 'http://localhost:8080/' // set to your own redirect
});

var routes = {};
var categories = ['tech', 'business', 'design', 'food', 'marketing', 'news', 'fashion', 'startups', 'photography', 'gaming','baking','do it yourself', 'beauty','comics', 'cars', 'culture', 'seo', 'education', 'science','finance','film', 'travel', 'youtube','vimeo'];

routes.mixes = function(req, res, ids, cat, next) {
    var url = 'http://cloud.feedly.com/v3/mixes/contents?streamId=' + ids.shift();
    request(url, function(err, response, body) {
        var r = JSON.parse(body);
         if (err) {
            console.log("Error");
        } else {
            for (var j = 0; j < r.items.length; j++) {
                var post = r.items[j];
                var contentSource = post.summary || post.content
                var myContent = contentSource.content || '';
                var newPost = {title: post.title || '', content: myContent, author: post.author || '', source: post.origin.title || '', url: post.originId || '', category: cat || '', upvoteUsers: [], downvoteUsers: [], count: 0};
                Post.update(
                    {title: newPost.title}, 
                    {$setOnInsert: newPost}, 
                    {upsert: true}, 
                    function(err) {
                        if (err) console.log(err);
                    }
                );
            }
            if (ids.length == 0) {
                next();
            } else {
                routes.mixes(req, res, ids, cat, next);
            }
        }
    });
};

routes.update = function (req, res) {
    var helper = function (req, res, categories) {
        var cat = categories.shift();
        var url = 'http://cloud.feedly.com/v3/search/feeds?query=' + cat;
        request(url, function(err, response, body) {
            if (err) res.sendStatus(500);
            r = JSON.parse(body);
            var ids = [];
            for (var i = 0; i < r.results.length; i++) {
                ids.push(r.results[i].feedId);
            };
            console.log(cat);
            routes.mixes(req, res, ids, cat, function () {
                if (categories.length == 0) {
                    res.send("Yay");
                } else {
                    helper(req, res, categories);
                }
            });
        });
    }
    helper(req, res, categories);
}

routes.main = function (req, res) {
    Post.find({}).limit(50).sort('count').exec(function (err, results) {
        res.render('index', {posts: results});
    });
}

routes.login = function(req, res) {
    res.render('login');
}

module.exports = routes;
