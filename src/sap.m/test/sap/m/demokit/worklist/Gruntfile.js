/*eslint-env node*/
'use strict';

module.exports = function(grunt) {

	grunt.initConfig({

		dir: {
			webapp: 'app',
			tests: 'test',
			dist: 'dist',
			bower_components: 'bower_components',
			localServerTestUrl : 'http://localhost:8080/test-resources'
		},

		connect: {
			options: {
				port: 8080,
				hostname: '*'
			},
			src: {},
			dist: {}
		},

		openui5_connect: {
			options: {
				resources: [
					'<%= dir.bower_components %>/openui5/src/sap.ui.core/src',
					'<%= dir.bower_components %>/openui5/src/sap.m/src',
					'<%= dir.bower_components %>/openui5/src/sap.ui.layout/src',
					'<%= dir.bower_components %>/openui5/src/themelib_sap_bluecrystal/src'
				]
			},
			src: {
				options: {
					appresources: ['.'],
					testresources: ['<%= dir.tests %>']
				}
			},
			dist: {
				options: {
					appresources: '<%= dir.dist %>'
				}
			}
		},

		eslint: {
			options: {
				quiet: true
			},

			all: ['<%= dir.tests %>', '<%= dir.webapp %>'],
			webapp: ['<%= dir.webapp %>']
		},
		qunit: {
			options: {
				/* for debugging*/
				'--remote-debugger-autorun' : 'yes',
				'--remote-debugger-port' : 8000
			},

			unit: {
				options: {
					urls: [
						'<%= dir.localServerTestUrl %>/unit/unitTests.qunit.html'
					]
				}

			},
			opa: {
				options: {
					urls: [
						'<%= dir.localServerTestUrl %>/integration/opaTests.qunit.html'
					],
					// same as qunits timeout 90 seconds since opa test might take a while
					timeout: 900000
				}

			}
		}

	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-openui5');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-contrib-qunit');

	// Server task
	grunt.registerTask('serve', function(target) {
		grunt.task.run('openui5_connect:' + (target || 'src') + ':keepalive');
	});

	// Linting task
	grunt.registerTask('lint', ['eslint:all']);

	// Build task
	grunt.registerTask('build', ['openui5_preload', 'copy']);

	// Test task
	grunt.registerTask('test', ['openui5_connect:src', 'qunit:unit', 'qunit:opa']);
	grunt.registerTask('unitTest', ['openui5_connect:src', 'qunit:unit']);
	grunt.registerTask('opaTest', ['openui5_connect:src', 'qunit:opa']);

	// Default task
	grunt.registerTask('default', [
		'lint:all',
		'test'
	]);
};
