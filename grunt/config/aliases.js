// task aliases

var semver = require('semver');
var async = require('async');

module.exports = function(grunt, config) {

	return {

		// Server task
		'serve': function(mode) {
			if (!mode || (mode !== 'src' && mode !== 'target')) {
				mode = 'src';
			}
			grunt.task.run(['openui5_connect:' + mode]);
		},

		// Lint task
		'lint': function(library, glob) {
			var aTasks = [];
			if (arguments.length > 0) {
				Array.prototype.forEach.call(arguments, function(path) {
					grunt.config(['eslint', path], path);
					aTasks.push('eslint:' + path);
				});
			} else {
				aTasks.push('eslint');
			}
			grunt.task.run(aTasks);
		},

		// QUnit test task
		'test': function(mode) {

			if (!mode || (mode !== 'src' && mode !== 'target')) {
				mode = 'src';
			}

			grunt.option('port', 0); // use random port

			// listen to the connect server startup
			grunt.event.on('connect.*.listening', function(hostname, port) {
				if (hostname === '0.0.0.0') {
					hostname = 'localhost';
				}

				// set baseUrl (using hostname / port from connect task)
				grunt.config(['selenium_qunit', 'options', 'baseUrl'], 'http://' + hostname + ':' + port);

				// define the contextpath
				grunt.config(['selenium_qunit', 'run', 'options', 'contextPath'], '/' + config.testsuite.name);

				// run selenium task
				grunt.task.run(['selenium_qunit:run']);
			});

			// TODO: test:target mode should also work!!!

			// dynamic port
			grunt.config(['openui5_connect', mode, 'options', 'port'], 0);

			// disable keepalive for server
			grunt.config(['openui5_connect', mode, 'options', 'keepalive'], false);

			// cleanup and start connect server
			grunt.task.run([
				'clean:target.surefire-reports',
				'openui5_connect:' + mode
			]);
		},

		// Build task
		'build': function() {

			// if running build in publish mode, change the version first
			if (grunt.option('publish')) {
				var version = semver.inc(grunt.config(['package', 'version']), 'prerelease', grunt.config('buildtime'));
				grunt.config(['package', 'version'], version);
			}

			var aTasks = [ 'lastchange' ];

			// testsuite
			if (grunt.option('include-test-resources')) {
				aTasks.push('copy:test-target-' + config.testsuite.name);
			}

			config.libraries.forEach(function(library) {

				// copy
				aTasks.push('copy:src-target-' + library.name);
				if (grunt.option('include-test-resources')) {
					aTasks.push('copy:test-target-' + library.name);
				}

				// theme
				aTasks.push('openui5_theme:target-' + library.name);

			});

			aTasks.push('replace');
			aTasks.push('concat');

			config.libraries.forEach(function(library) {
				// library preload
				if (library.type !== 'theme') {
					aTasks.push('openui5_library_preload:target-preload-' + library.name);
				}
			});

			if (grunt.option('publish')) {

				// copy built resources into individual bower repositories
				config.libraries.forEach(function(library) {
					if (library.bower !== false) {
						aTasks.push('copy:bower-' + library.name);
					}
				});

				// update the version info in all bower.json files
				aTasks.push('updateBowerVersions');

				// run git "add commit tag push" to publish the updated bower repo
				aTasks.push('publishBower');
			}

			// run all build tasks
			grunt.task.run(aTasks);
		},

		// Package task
		'package': [
			'compress:target'
		],

		'lastchange': function() {
			var done = this.async();

			grunt.util.spawn({
					cmd: 'git',
					args: [ 'rev-parse', 'HEAD' ]
			}, function(error, result, code) {
				if (!error) {
					var hash = result.stdout;
					grunt.config('lastchange', hash);
					grunt.log.writeln('lastchange: ' + hash);
				}
				done(error);
			});

		},

		// updates version infos (incl. dependency versions) of bower.json files
		'updateBowerVersions': function() {

			var version = grunt.config(['package', 'version']);

			config.libraries.forEach(function(library) {

				if (library.bower === false) {
					return;
				}

				var bowerFilename = '../bower-openui5-' + library.name + '/bower.json';

				grunt.log.subhead(library.name);

				var bower = grunt.file.readJSON(bowerFilename);
				var oldVersion = bower.version;

				// update version
				bower.version = version;

				grunt.log.writeln('version: ' + oldVersion + ' => ' + version);

				// check for dependency infos
				if (bower.dependencies) {
					Object.keys(bower.dependencies).forEach(function(dependency) {

						var oldDependencyVersion = bower.dependencies[dependency];
						bower.dependencies[dependency] = version;

						grunt.log.writeln('dependencies.' + dependency + ': ' + oldDependencyVersion + ' => ' + version);

					});
				}

				grunt.file.write(bowerFilename, JSON.stringify(bower, null, 2));

			});

		},

		// create a git commit + tag for each bower repository (without push)
		'publishBower': function() {

			var version = grunt.config(['package', 'version']);

			async.each(config.libraries.filter(function(library) {
				return library.bower !== false;
			}), function(library, done) {

				function git(args, callback) {
					grunt.util.spawn({
							cmd: 'git',
							args: args,
							opts: {
								cwd: '../bower-openui5-' + library.name
							}
					}, function () {
							callback.apply(this, arguments);
					});
				}

				async.eachSeries([
					['add', '-A'],
					['commit', '-m', version],
					['tag', '-a', version, '-m', version]
				], git, done);

			}, this.async());

		},

		// Default task (called when just running "grunt")
		'default': [
			'lint',
			'clean',
			'build',
			'mochaTest',
			'test'
		]

	};
}
