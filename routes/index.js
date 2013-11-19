/*
	# Routes entry point.

	(The MIT License)
	Copyright © 2013 Carson S. Christian <cscade@gmail.com>
*/
/*jshint node:true */

var adapters = require('../adapters');

module.exports = function (app) {
	/*
		## GET /
	*/
	app.get('/', function (req, res) {
		var parsed = [];
		var settings = app.get('settings');
		
		Object.keys(settings).forEach(function (k) {
			parsed.push({
				key: k,
				value: settings[k]
			});
		});
		res.render('index', {
			controllers: adapters.controllers,
			parsed: parsed,
			settings: settings
		});
	});
	
	/*
		404
	*/
	app.all('*', function (req, res) {
		if (req.xhr) return res.send(404);
		app.log.debug({
			req: req
		}, '404 not found: %s', req.url);
		res.redirect('/');
	});
};