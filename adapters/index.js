/*
	# Adapter handler.

	(The MIT License)
	Copyright © 2013 Carson S. Christian <cscade@gmail.com>
*/
/*jshint node:true */

/*
	## attach

	Attach all controller adapters.

	@param {Object} app
*/
exports.attach = function (app) {
	var controllers = app.get('settings').controllers;
	
	if (!Array.isArray(controllers)) return app.log.warn('No controllers are configured in settings.json.');
	controllers.forEach(function (controller) {
		var Adapter;
		
		if (!controller.adapter || typeof controller.adapter !== 'string') return app.log.warn('All controllers must have a `adapter` property.');
		if (!controller.address || typeof controller.address !== 'string') return app.log.warn('All controllers must have a `address` property.');
		if (!controller.name || typeof controller.name !== 'string') return app.log.warn('All controllers must have a `name` property.');
		if (!!controller.port && typeof controller.port !== 'number') return app.log.warn('Controller `port` must be a number if specified.');
		try {
			Adapter = require(controller.adapter);
		} catch (e) {
			return app.log.warn('There is no adapter of type "%s" for controller "%s".', controller.adapter, controller.name);
		}
		new Adapter(controller.address, !!controller.port ? controller.port : null, function (e, adapter) {
			if (e) return app.log.error({
				err: e,
				controller: controller
			}, 'Unable to connect adapter for "%s".', controller.name);
			app.log.info({
				adapter: {
					device: adapter.device.info,
					ready: adapter.ready
				}
			}, 'Adapter connected for "%s".', controller.name);
		});
	});
};