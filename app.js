/*
	# test-leveldb
*/

var app;
var async = require('async');
var bunyan = require('bunyan');
var db;
var express = require('express');
var fd;
var fs = require('fs');
var levelup = require('levelup');
var MemDOWN = require('memdown');

/*
	Initialize application.
*/
app = express();

app.set('config', require('./config/' + app.get('env') + '.json'));
app.set('package', require('./package.json'));

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
			streams: [
				{
					level: app.get('env') === 'development' ? 'trace' : 'info',
					type: 'raw',
					stream: new bunyan.RingBuffer({ limit: 100 })
				},
				app.get('env') === 'development' ? {
					level: 'trace',
					stream: process.stdout
				} : undefined
			].filter(function (a) {return !!a;})
		});
		app.log.info({
			environment: app.get('env'),
			writable: app.get('environmentWritable')
		}, 'Setting up.');
		app.log.trace('Logger initialized.');
		next();
	},
	/*
		
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
				}, 'LevelDB initialized using disk I/O.');
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
				}, 'LevelDB initialized using volatile RAM.');
				next();
			});
		}
	},
}, function (e) {
	if (e) {
		app.log.error(e, 'Initialization failed.');
		return process.exit(1);
	}
	app.log.info('Initialization complete.');
});