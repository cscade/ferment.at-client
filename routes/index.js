/*
	# Routes entry point.
*/
/*jshint node:true */

module.exports = function (app) {
	/*
		## GET /
	*/
	app.get('/', function (req, res) {
		res.render('index');
	});
	
	/*
		## GET /logs
	*/
	app.get('/logs', function (req, res) {
		res.render('logs');
	});
	
	/*
		## GET /settings
	*/
	app.get('/settings', function (req, res, next) {
		var parsed = [];
		var settings = app.get('settings');
		
		Object.keys(settings).forEach(function (k) {
			parsed.push({
				key: k,
				value: settings[k]
			});
		});
		res.render('settings', {
			settings: parsed
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