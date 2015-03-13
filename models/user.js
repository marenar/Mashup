var mongoose = require('mongoose');

var schema = new mongoose.Schema ({
	name: {type: String, unique: true}
});

module.exports = mongoose.model('User', schema);
