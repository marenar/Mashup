var mongoose = require('mongoose');
var Post = require('../models/post');
var User = require('../models/user');
var request = require('request');

var routes = {};
var categoriesStatic = ['tech', 'business', 'design', 'food', 'marketing', 'news', 'fashion', 'startups', 'photography', 'gaming','baking','do it yourself', 'beauty','comics', 'cars', 'culture', 'seo', 'education', 'science','finance','film', 'travel', 'youtube','vimeo'];
var categories = ['tech', 'business', 'design', 'food', 'marketing', 'news', 'fashion', 'startups', 'photography', 'gaming','baking','do it yourself', 'beauty','comics', 'cars', 'culture', 'seo', 'education', 'science','finance','film', 'travel', 'youtube','vimeo'];

routes.mixes = function(req, res, ids, cat, next) {
    var url = 'http://cloud.feedly.com/v3/mixes/contents?streamId=' + ids.shift();
    request(url, function(err, response, body) {
        var r = JSON.parse(body);
         if (err) {
            return res.sendStatus(500);
        } else {
            for (var j = 0; j < r.items.length; j++) {
                var post = r.items[j];
                var contentSource = post.summary || post.content
                var myContent = contentSource.content || '';
                if (post.visual) {
                    var image = post.visual.url;
                }
                var newPost = {title: post.title || '', content: myContent, author: post.author || '', source: post.origin.title || '', url: post.originId || '', image: image || '', category: cat || ''};
                Post.update(
                    {title: newPost.title}, 
                    {$set: newPost, $setOnInsert: {userVotes: [], count: 0}}, 
                    {upsert: true}, 
                    function(err) {
                        if (err) return res.sendStatus(500);
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
            if (err) return err;
            r = JSON.parse(body);
            var ids = [];
            for (var i = 0; i < r.results.length; i++) {
                ids.push(r.results[i].feedId);
            };
            console.log(cat);
            routes.mixes(req, res, ids, cat, function () {
                if (categories.length == 0) {
                    return "success";
                } else {
                    helper(req, res, categories);
                }
            });
        });
    }
    helper(req, res, categories);
}

var voteHelper = function (req, posts) {
    var formattedPosts = [];
    for (var i = 0; i < posts.length; i++) {
        posts[i].hasVoted = 0;
        var index = posts[i].userVotes.indexOf(req.session.userId);
        var obj = posts[i].toObject()
        if (index < 0) {
            obj.hasVoted = false
        } else {
            obj.hasVoted = true
        }
        formattedPosts.push(obj);
    }
    return formattedPosts
}

routes.main = function (req, res) {
    if (!req.session.userId) {
        res.redirect('/login');
    } else {
        Post.find(req.params, {"_id": 0}).limit(50)
            .sort({'count': -1})
            .exec(function (err, results) {
                var formattedPosts = voteHelper(req, results);
                console.log(formattedPosts[0]);
                res.render('index', {posts: formattedPosts, cats: categoriesStatic});
            });
    }
}

routes.login = function(req, res) {
    res.render('login');
    routes.update(req, res);
}

routes.createUser = function(req, res) {
    var myUser = {name: req.user.name.givenName};
    User.findOneAndUpdate(
        {name: myUser.name}, 
        {$setOnInsert: myUser}, 
        {upsert: true}, 
        function(err, user) {
            if (err) {
                return res.sendStatus(500);
            } else {
                req.session.userId = user["_id"];
                res.redirect('/');
            }
        }
    );
}

routes.vote = function (req, res) {
    if (req.session.userId) {
        Post.find({title: req.body.title}, function(err, result) {
            if (result[0].userVotes.indexOf(req.session.userId) < 0) {
                Post.update(
                    {title: req.body.title}, 
                    {$inc: {count: req.body.vote}, $push: {userVotes: req.session.userId}},
                    function(err) {
                        if (err) return res.sendStatus(500);
                    }
                );
            }
        })
    }
}

module.exports = routes;
