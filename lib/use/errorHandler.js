/*
	# Router error handler.
*/
/*jshint node:true */

/*
	## errorHandler

	Error handler for routes.
*/
/*jshint unused:false */
module.exports = function (app) {
	return function (e, req, res, next) {
		var message;
		
		message = e.message;
		app.log.debug(e, 'Router error.');
		// Handle XHR requests differently.
		if (req.xhr) return res.send(e.status_code || 500);
		// Flash back, or render static.
		if (req.flash && req.method === 'POST') {
			req.flash('error', message);
			res.redirect('back');
		} else {
			res.render('error', {
				message: message
			});
		}
	};
};