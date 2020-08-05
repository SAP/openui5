/*
 * grunt-selenium-visualtest
 *
 *
 * Copyright (c) 2014-2020 SAP SE
 */

'use strict';

var path = require('path');

module.exports = function (grunt) {
	grunt.registerMultiTask('selenium_visualtest', 'Grunt task to run visual tests', function () {
		var done = this.async();
		var args = [];

		// prepare args for visualtestjs command
		var options = this.options();

		if (typeof options.browsers !== 'undefined') {
			args.push('--browsers', options.browsers);
		}
		if (typeof options.baseUrl !== 'undefined') {
			args.push('--baseUrl', options.baseUrl);
		}

		if (typeof options.libs !== 'undefined') {
			args.push('--libFilter', options.libs);
		}
		if (typeof options.specs !== 'undefined') {
			args.push('--specFilter', options.specs);
		}

		if (typeof options.seleniumAddress !== 'undefined') {
			args.push('--seleniumAddress', options.seleniumAddress);
		}
		if (typeof options.seleniumHost !== 'undefined') {
			args.push('--seleniumHost', options.seleniumHost);
		}
		if (typeof options.seleniumPort !== 'undefined') {
			args.push('--seleniumPort', options.seleniumPort);
		}
		if (typeof options.useSeleniumJar !== 'undefined') {
			args.push('--useSeleniumJar', options.useSeleniumJar);
		}
		if (typeof options.seleniumAddressProxy !== 'undefined') {
			args.push('--seleniumAddressProxy', options.seleniumAddressProxy);
		}

		if (typeof options.take !== 'undefined') {
			args.push('--take', options.take);
		}
		if (typeof options.compare !== 'undefined') {
			args.push('--compare', options.compare);
		}
		if (typeof options.update !== 'undefined') {
			args.push('--update', options.update);
		}

		if (typeof options.config !== 'undefined') {
			args.push('--config', options.config);
		}

		// show some more info
		grunt.option('verbose') ? args.push('--verbose', grunt.option('verbose')) : '';

		// spawn new process for visultest run
		var cmd = 'visualtest';
		var child = grunt.util.spawn({
				cmd: cmd,
				args: args,
				opts: {
					stdio: 'pipe'
				}
			},
			function (error,result,code) {
				if (code!=0) {
					if (code == 127){
						grunt.log.error('visualtest was not found in path. Did you forget to install it globally ?');
					} else {
						grunt.log.error('Error while executing visual tests, exit code: ' + code +  ' ,details: ' + error);
					}
					done(false);
				} else {
					done();
				}
			}
		);

		// handle in/out streams of the child process
		process.stdin.pipe(child.stdin);
		child.stdout.pipe(process.stdout);
		child.stderr.pipe(process.stderr);
	});
};
