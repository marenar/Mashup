App.Router.map(function() {
	this.route('/', {path: '/home'});
});

App.IndexRoute = Ember.Route.extend({
	model: function() {
		this.store.find('user');
	}
});