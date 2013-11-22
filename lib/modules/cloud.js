/*
	# Cloud connection module.

	This module handles all communications with the cloud service.

	(The MIT License)
	Copyright © 2013 Carson S. Christian <cscade@gmail.com>
*/
/*jshint node:true, -W069 */

var app;
var adapters = require('./adapters');
var request = require('request');

/*
	# Cloud
*/
var Cloud = function () {
	var that = this;
	
	this.log = app.log.child({
		module: 'cloud'
	}, true);
	// Touch in.
	this.touch(function (e) {
		if (e) return;
		that.log.info('Connection to cloud service OK.');
		// Get initial configuration.
		that.getConfiguration(function (e) {
			if (e) return;
			that.log.info(that.configuration, 'Configuration received.');
			// Spin up adapters.
			adapters.attach(app, that.configuration.controllers);
			// Set interval tasks.
			that.timer = setInterval(function () {
				that.interval();
			}, that.configuration.interval);
		});
	});
};

/*
	## getConfiguration

	Get the configuration for this client from the cloud.

	@param {Function} next(e)
*/
Cloud.prototype.getConfiguration = function (next) {
	var that = this;
	
	this.request('get', '/configuration', function (e, res, body) {
		if (e) {
			if (e.code === 'ECONNREFUSED') {
				that.log.error('The service is unreachable.');
				return next(e);
			}
			if (!res || (res.statusCode !== 401 && res.statusCode !== 404)) that.log.error(e);
			return next(e);
		}
		if (res.statusCode === 404) {
			that.unauthorized = true;
			that.log.fatal('The service does not recognize your Client ID.');
			return next(new Error('unauthorized'));
		}
		that.configuration = body;
		next();
	});
};

/*
	## interval

	Perform interval tasks.
*/
Cloud.prototype.interval = function () {
	var that = this;
	// Touch in.
	this.log.debug('Interval fired.');
	this.touch(function (e) {
		if (e) return;
		that.log.debug('Connection to cloud service OK.');
	});
};

/*
	## touch

	Touch the API server, confirming credentials and updating touch time.

	@param {Function} next(e)
*/
Cloud.prototype.touch = function (next) {
	var that = this;
	
	this.request('head', '/touch', function (e, res) {
		if (e) {
			if (e.code === 'ECONNREFUSED') {
				that.log.error('The service is unreachable.');
				return next(e);
			}
			if (!res || (res.statusCode !== 401 && res.statusCode !== 404)) that.log.error(e);
			return next(e);
		}
		if (res.statusCode === 404) {
			that.unauthorized = true;
			that.log.fatal('The service does not recognize your Client ID.');
			return next(new Error('unauthorized'));
		}
		next();
	});
};

/*
	## request

	Make a request.

	@param {String} method
	@param {String} endpoint
	@param {Object} [body]
	@param {Function} next(e, res, body) Body will be decoded JSON.
*/
Cloud.prototype.request = function (method, endpoint, body, next) {
	var headers;
	var that = this;
	
	if (this.unauthorized) return;
	if (typeof body === 'function') {
		next = body;
		body = undefined;
	}
	method = method.toUpperCase();
	// Set up headers.
	headers = {
		'Authorization': 'Bearer ' + app.get('settings').apiKey,
		'X-Client-Id': app.get('settings').clientId
	};
	if (method === 'POST' && body) headers['Content-Type'] = 'application/json';
	if (method !== 'HEAD') headers['Accept'] = 'application/json';
	// Make the request.
	request({
		body: method === 'POST' && body ? JSON.stringify(body) : undefined,
		headers: headers,
		method: method,
		url: app.get('settings').apiEndpoint + endpoint,
	}, function (e, res, body) {
		if (e) return next(e);
		if (res.statusCode === 401) {
			that.unauthorized = true;
			that.log.fatal('The service does not recognize your API Key.');
			return next(new Error('unauthorized'), res, {
				error: {
					message: 'unauthorized'
				}
			});
		}
		if (res.statusCode === 409) return next(new Error('conflict'), res, {
			error: {
				message: 'conflict'
			}
		});
		if (res.statusCode === 500) return next(new Error('server_error'), res, {
			error: {
				message: 'internal server error'
			}
		});
		if (method !== 'HEAD' && body) {
			try {
				body = JSON.parse(body);
			} catch (err) {
				return next(err);
			}
		}
		next(null, res, body);
	});
};

/*
	## initialize
*/
exports.initialize = function (a) {
	app = a;
	return exports.cloud = new Cloud();
};