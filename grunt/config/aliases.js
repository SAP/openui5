// task aliases
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
		'lint': ['eslint'],

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
		'build': [
			'copy',
			'replace',
			'openui5_library_preload',
			'openui5_theme'
		],

		// Package task
		'package': [
			'compress:target'
		],

		// Default task (called when just running "grunt")
		'default': [
			'lint',
			'clean',
			'build',
			'test'
		]

	};
}
