/*
	# ferment.at-local

	The official client module for the ferment.at cloud logging service.

	(The MIT License)
	Copyright © 2013 Carson S. Christian <cscade@gmail.com>
*/
/*jshint node:true */

var adapters = require('./adapters');
var app;
var async = require('async');
var bunyan = require('bunyan');
var db;
var express = require('express');
var errorHandler = require('./lib/use/errorHandler');
var fd;
var flash = require('connect-flash');
var fs = require('fs');
var http = require('http');
var levelup = require('levelup');
var moment = require('moment');
var path = require('path');
var ringbuffer = new bunyan.RingBuffer({ limit: 50 });

var MemDOWN = require('memdown');

/*
	Initialize application.
*/
app = express();

app.set('config', require('./config/client/' + app.get('env') + '.json'));
app.set('package', require('./package.json'));

/*
	Jade locals.
*/
app.locals.logLevels = {
	10: 'TRACE',
	20: 'DEBUG',
	30: 'INFO',
	40: 'WARN',
	50: 'ERROR',
	60: 'FATAL'
};
app.locals.logs = function () {
	var level = app.get('env') === 'production' ? bunyan.resolveLevel('info') : bunyan.resolveLevel('trace');
	var logs = [];
	
	for (var i = ringbuffer.records.length - 1; i >= 0; i--) {
		if (ringbuffer.records[i].level >= level) logs.push({
			level: ringbuffer.records[i].level,
			msg: ringbuffer.records[i].msg,
			object: ringbuffer.records[i],
			time: ringbuffer.records[i].time
		});
	}
	return logs;
};
app.locals.moment = moment;
app.locals.version = app.get('package').version;

/*
	Check writable disk state.
*/
try {
	fs.closeSync(fs.openSync(app.get('config').touchFile, 'w'));
	app.set('environmentWritable', true);
} catch (e) {
	app.set('environmentWritable', false);
}

/*
	Services initialization.
*/
async.series({
	/*
		Bunyan logger.
	*/
	logger: function (next) {
		// Log only to a ringbuffer, except in development mode.
		app.log = bunyan.createLogger({
			name: app.get('package').name,
			serializers: bunyan.stdSerializers,
			streams: [
				{
					level: app.get('env') === 'development' ? 'trace' : 'info',
					type: 'raw',
					stream: ringbuffer
				},
				app.get('env') === 'development' ? {
					level: 'trace',
					stream: process.stdout
				} : undefined
			].filter(function (a) {return !!a;})
		});
		app.log.info({
			environment: {
				name: app.get('env'),
				writable: app.get('environmentWritable')
			}
		}, 'Starting up.');
		app.log.trace('Logger initialized.');
		next();
	},
	/*
		Database.
	*/
	database: function (next) {
		if (app.get('environmentWritable')) {
			// In a writable environment, use leveldb on disk.
			levelup('./leveldb', {
				valueEncoding: 'json'
			}, function (e, db) {
				if (e) return next(e);
				app.db = db;
				app.log.trace({
					store: 'LevelDOWN'
				}, 'Level initialized using disk I/O.');
				next();
			});
		} else {
			// In a read-only environment, use MemDOWN ram store instead.
			levelup('', {
				db: MemDOWN,
				valueEncoding: 'json'
			}, function (e, db) {
				if (e) return next(e);
				app.db = db;
				app.log.trace({
					store: 'MemDOWN'
				}, 'Level initialized using volatile RAM.');
				next();
			});
		}
	},
	/*
		Express.
	*/
	express: function (next) {
		app.set('views', __dirname + '/jade');
		app.set('view engine', 'jade');
		app.use(express.compress());
		app.use(express.static(path.join(__dirname, 'public'), {
			// Set cache age to 1 day in production.
			maxAge: app.get('env') === 'production' ? 86400000 : 0
		}));
		app.use(express.bodyParser());
		app.use(express.cookieParser());
		app.use(express.cookieSession({
			key: 'csid',
			secret: 'nerple'
		}));
		app.use(flash());
		app.use(app.router);
		require('./routes')(app);
		app.use(errorHandler(app));
		app.log.trace('Express initialized.');
		next();
	},
	/*
		Listen.
	*/
	listen: function (next) {
		var server;
		
		server = http.createServer(app);
		server.on('error', next);
		server.on('listening', next);
		server.listen(app.get('config').listen);
	}
}, function (e) {
	var settings;
	
	if (e) {
		app.log.error(e, 'Initialization failed.');
		return process.exit(1);
	}
	app.log.info({
		environment: app.get('env'),
		port: app.get('config').listen,
		version: app.get('package').version
	}, 'Client ready.');
	/*
		Review settings file.
	*/
	try {
		settings = require('./config/settings.json');
		app.set('settings', settings);
	} catch (e) {
		app.log.fatal(e, 'Your settings.json file is invalid.');
	}
	/*
		Spin up adapters.
	*/
	adapters.attach(app);
});