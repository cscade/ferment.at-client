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
		404
	*/
	app.all('*', function (req, res) {
		if (req.xhr) return res.send(404);
		app.log.debug(req, '404 not found');
		res.redirect('/');
	});
};