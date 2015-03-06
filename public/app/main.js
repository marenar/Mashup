window.App = Ember.Application.create({
	LOG_TRANSITIONS: true,
	LOG_TRANSITIONS_INTERNAL: true
})

App.ApplicationSerializer = DS.RESTSerializer.extend({
	primaryKey: '_id',
	serializeId: function(id) {
		return id.toString();
	}
});

App.ApplicationAdapter = DS.RESTAdapter.extend({
	namespace: 'api'
});
