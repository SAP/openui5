/*
 * Copyright (c) 2014-2017 SAP SE
 */

'use strict';

var path = require('path');
var moment = require('moment');
var semver = require('semver');

module.exports = function(grunt) {

	// Force unix linefeeds (see https://github.com/gruntjs/grunt/issues/1123)
	// (grunt uses grunt.util.normalizelf when processing templates)
	grunt.util.linefeed = '\n';

	// Log time how long tasks take
	require('grunt-timer').init(grunt, {
		deferLogs: true,
		color: 'cyan'
	});

	// Check for valid required Node.js version from package.json
	// npm does not validate this within the project itself; only if this project would be installed as a dependency (which is not the case as of now)
	var pkg = grunt.file.readJSON(__dirname + "/package.json");
	if (pkg.engines && pkg.engines.node && !semver.satisfies(process.version, pkg.engines.node)) {
		grunt.log.error('!!! WARNING !!!');
		grunt.log.error('Unsupported Node.js version: wanted "' + pkg.engines.node + '" (current: "' + process.version + '")');
		grunt.log.error('Please update your Node.js installation!');
	}

	// Load all custom tasks from grunt/tasks dir
	grunt.loadTasks(path.join(process.cwd(), 'grunt/tasks'));

	// set default options
	grunt.option('production', grunt.option('production') || false);
	if (typeof grunt.option('minify-css') === 'undefined') {
		grunt.option('minify-css', grunt.option('production'));
	}
	if (typeof grunt.option('include-test-resources') === 'undefined') {
		grunt.option('include-test-resources', grunt.option('no-production'));
	}

	// set of libraries to use (e.g. --libs=sap.ui.core)
	var libsOption = grunt.option('libs');
	var libs = libsOption ? libsOption.split(',') : null;

	// the gruntdata contains the configuration for the build part
	// we distinguish here between a testsuite which is an application
	// and the libraries which are the re-use modules
	var gruntData = {

		buildtime: moment().utc().format('YYYYMMDDHHmmss'),
		lastchange: '',

		testsuite: {
			name: 'testsuite',
			path: 'src/testsuite'
		},
		allLibraries: [
			{
					name: 'sap.ui.core',
					path: 'src/sap.ui.core',
					preload: {
						src: [

							'*.js',

							// files are already part of sap-ui-core.js
							'!sap/ui/thirdparty/es6-promise.js',
							'!jquery.sap.global.js',
							'!sap-ui-*.js',

							'sap/ui/core/**',
							'!sap/ui/core/cldr/**',
							'!sap/ui/core/messagebundle*',

							'sap/ui/base/**',
							'sap/ui/model/**',
							'sap/ui/Global.js'
						]
					}
			},
			{
					name: 'sap.ui.unified',
					path: 'src/sap.ui.unified'
			},
			{
					name: 'sap.ui.layout',
					path: 'src/sap.ui.layout'
			},
			{
					name: 'sap.m',
					path: 'src/sap.m'
			},
			{
					name: 'sap.tnt',
					path: 'src/sap.tnt'
			},
			{
					name: 'sap.f',
					path: 'src/sap.f'
			},
			{
					name: 'sap.ui.commons',
					path: 'src/sap.ui.commons'
			},
			{
					name: 'sap.ui.table',
					path: 'src/sap.ui.table'
			},
			{
					name: 'sap.ui.ux3',
					path: 'src/sap.ui.ux3'
			},
			{
					name: 'sap.ui.suite',
					path: 'src/sap.ui.suite'
			},
			{
					name: 'sap.ui.documentation',
					path: 'src/sap.ui.documentation'
			},
			{
					name: 'sap.ui.dt',
					path: 'src/sap.ui.dt'
			},
			{
					name: 'sap.uxap',
					path: 'src/sap.uxap'
			},
			{
					name: 'sap.ui.fl',
					path: 'src/sap.ui.fl'
			},
			{
					name: 'sap.ui.codeeditor',
					path: 'src/sap.ui.codeeditor'
			},
			{
					name: 'sap.ui.support',
					path: 'src/sap.ui.support'
			},
			{
					name: 'themelib_sap_bluecrystal',
					path: 'src/themelib_sap_bluecrystal',
					type: 'theme'
			},
			{
					name: 'themelib_sap_goldreflection',
					path: 'src/themelib_sap_goldreflection',
					type: 'theme'
			},
			{
					name: 'themelib_sap_belize',
					path: 'src/themelib_sap_belize',
					type: 'theme'
			},
			{
					name: 'sap.ui.demokit',
					path: 'src/sap.ui.demokit',
					bower: false // exclude from bower publish
			}
		]

	};

	// Load config extension script to allow overrides to "grunt" and "gruntData"
	var configExtensionFile = grunt.option("config-extension");
	if (configExtensionFile) {
		configExtensionFile.split(',').forEach(file => require(path.resolve(file))(grunt, gruntData));
	}

	// determine set of libraries to use (specified by --libs option)
	gruntData.libraries = !libs ? gruntData.allLibraries : gruntData.allLibraries.filter(function(library) {
		return libs.indexOf(library.name) > -1;
	});

	// Load all grunt config files (in grunt subfolder) and all tasks installed via npm
	require('load-grunt-config')(grunt, {

		configPath: path.join(process.cwd(), 'grunt/config'),

		// loads grunt plugins just-in-time (faster than using load-grunt-tasks)
		jitGrunt: {
			staticMappings: {
				'replace': 'grunt-text-replace',
				'openui5_connect': 'grunt-openui5',
				'openui5_theme': 'grunt-openui5',
				'openui5_preload': 'grunt-openui5',
				'gitclone': 'grunt-git',
				'gitadd': 'grunt-git',
				'gitcommit': 'grunt-git',
				'gittag': 'grunt-git',
				'gitpush': 'grunt-git'
			}
		},

		data: gruntData

	});

};
