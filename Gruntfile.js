/*
	# Gruntfile
*/
/*jshint node:true */

module.exports = function (grunt) {
	grunt.initConfig({
		// Package file.
		pkg: grunt.file.readJSON('package.json'),
		// Reusable locations.
		locations: {
			js: {
				src: 'js',
				dest: 'public/js'
			}
		},
		// Code quality.
		jshint: {
			options: {
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				undef: true,
				// Relax.
				boss: true,
				smarttabs: true,
				devel: true
			},
			grunt: [
				'Gruntfile.js'
			],
			server: [
				'app.js',
				'lib/**/*.js',
				'routes/**/*.js'
			],
			client: [
				'<%= locations.js.src %>/views/**/*.js'
			],
			dist: {
				options: {
					unused: true,
					devel: false
				},
				files: {
					src: [
						'app.js',
						'lib/**/*.js',
						'routes/**/*.js',
						'<%= locations.js.src %>/views/**/*.js'
					]
				}
			}
		},
		// Basic concatenations.
		concat: {
			// Development view js.
			devViews: {
				files: [
					/*
						Automatically create files based on sources.
					*/
					{
						expand: true,
						cwd: '<%= locations.js.src %>/views/',
						src: ['**/*.js'],
						dest: '<%= locations.js.dest %>/views/',
						rename: function (dest, target) {
							var temp;
							
							// Return all filesnames as 'development.js'.
							temp = target.split('/');
							temp.pop();
							temp.push('development.js');
							return dest + temp.join('/');
						}
					}
				]
			}
		},
		// Minification.
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("mm-dd-yyyy") %> */\n'
			},
			// Production view js.
			views: {
				files: [
					/*
						Automatically create files based on sources.
					*/
					{
						expand: true,
						cwd: '<%= locations.js.src %>/views/',
						src: ['**/*.js'],
						dest: '<%= locations.js.dest %>/views/',
						rename: function (dest, target) {
							var temp;
							
							// Return all filesnames as 'production.js'.
							temp = target.split('/');
							temp.pop();
							temp.push('production.js');
							return dest + temp.join('/');
						}
					}
				]
			}
		},
		// CSS
		stylus: {
			options: {
				compress: true
			},
			all: {
				files: {
					'public/css/library.css': ['stylus/theme.styl']
				}
			}
		},
		// Watches.
		watch: {
			client: {
				files: [
					'<%= locations.js.src %>/views/**/*.js'
				],
				tasks: ['concat', 'jshint:client']
			},
			css: {
				files: 'stylus/**/*.styl',
				tasks: ['stylus']
			},
			server: {
				files: [
					'app.js',
					'lib/**/*.js',
					'routes/**/*.js'
				],
				tasks: ['jshint:server']
			}
		}
	});
	
	// Dependecies.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-stylus');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	
	// Tasks.
	grunt.registerTask('default', ['jshint:server', 'jshint:client', 'concat', 'stylus']);
	grunt.registerTask('dist', ['jshint:grunt', 'jshint:dist', 'concat', 'uglify', 'stylus']);
};
