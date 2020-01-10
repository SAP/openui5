/*
 * Copyright (c) 2014-2020 SAP SE
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

							'**/*.js',

							// configuration copied from sap/ui/core/.library

							// files are already part of sap-ui-core.js
							'!sap/ui/thirdparty/baseuri.js',
							'!sap/ui/thirdparty/es6-promise.js',
							'!sap/ui/thirdparty/es6-shim-nopromise.js',
							'!ui5loader*.js',

							// exclude all merged files as well as the top level jQuery copy (not visible in OpenUI5)
							'!jquery-*.js',
							'!sap-*',
							// CorePlugin, shouldn't be installed by default
							'!sap/ui/core/plugin/DeclarativeSupport.js',
							'!sap/ui/core/plugin/LessSupport.js',
							// exclude non-productive code
							'!sap/ui/debug/**',
							'!sap/ui/core/support/**',
							'!sap/ui/qunit/**',
							'!sap/ui/test/**',
							'!testsuite/**',
							// Ignore substitutes for moved third party libs
							'!jquery-ui-core.js',
							'!jquery-ui-datepicker.js',
							'!jquery-ui-position.js',
							'!sap/ui/model/odata/datajs.js',
							// Third party libs which should NOT be part of the all-in-one file
							'!sap/ui/thirdparty/blanket.js',
							// '!sap/ui/thirdparty/crossroads.js'
							// '!sap/ui/thirdparty/caja-htmlsanitizer.js'
							'!sap/ui/thirdparty/d3.js',
							'!sap/ui/thirdparty/datajs.js',
							'!sap/ui/thirdparty/es6-object-assign.js',
							'!sap/ui/thirdparty/es6-string-methods.js',
							'!sap/ui/thirdparty/flexie.js',
							'!sap/ui/thirdparty/handlebars.js',
							// '!sap/ui/thirdparty/hasher.js'
							'!sap/ui/thirdparty/IPv6.js',
							'!sap/ui/thirdparty/iscroll.js',
							'!sap/ui/thirdparty/iscroll-lite.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-widget.js',
							'!sap/ui/thirdparty/jqueryui/jquery-effect*.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-effect.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-effect-blind.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-effect-bounce.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-effect-clip.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-effect-drop.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-effect-explode.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-effect-fade.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-effect-fold.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-effect-highlight.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-effect-pulsate.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-effect-scale.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-effect-shake.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-effect-slide.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-effect-transfer.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-mouse.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-draggable.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-resizable.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-selectable.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-sortable.js',
							'!sap/ui/thirdparty/jqueryui/jquery-ui-droppable.js',
							'!sap/ui/thirdparty/jszip.js',
							'!sap/ui/thirdparty/klay.js',
							'!sap/ui/thirdparty/less.js',
							'!sap/ui/thirdparty/mobify-carousel.js',
							'!sap/ui/thirdparty/mobiscroll/js/mobiscroll-core.js',
							'!sap/ui/thirdparty/mobiscroll/js/mobiscroll-scroller.js',
							'!sap/ui/thirdparty/mobiscroll/js/mobiscroll-datetime.js',
							'!sap/ui/thirdparty/punycode.js',
							'!sap/ui/thirdparty/qunit-2.js',
							'!sap/ui/thirdparty/qunit-composite.js',
							'!sap/ui/thirdparty/qunit-reporter-junit.js',
							'!sap/ui/thirdparty/qunit.js',
							'!sap/ui/thirdparty/RequestRecorder.js',
							'!sap/ui/thirdparty/require.js',
							'!sap/ui/thirdparty/SecondLevelDomains.js',
							// '!sap/ui/thirdparty/signals.js'
							'!sap/ui/thirdparty/sinon-4.js',
							'!sap/ui/thirdparty/sinon-ie.js',
							'!sap/ui/thirdparty/sinon-qunit.js',
							'!sap/ui/thirdparty/sinon-server.js',
							'!sap/ui/thirdparty/sinon.js',
							'!sap/ui/thirdparty/swipe-view.js',
							'!sap/ui/thirdparty/unorm.js',
							'!sap/ui/thirdparty/unormdata.js',
							// URI is no longer excluded because it's needed in jquery.sap.global and others
							// '!sap/ui/thirdparty/URI.js'
							'!sap/ui/thirdparty/URITemplate.js',
							'!sap/ui/thirdparty/vkbeautify.js',
							'!sap/ui/thirdparty/zyngascroll.js',
							// INCLUDED (because not mentioned in the list above) are the following libs:
							// jquery.sap.global.js
							// sap/ui/thirdparty/jquery-mobile-custom.js
							// sap/ui/thirdparty/jqueryui/jquery-ui-core.js
							// sap/ui/thirdparty/jqueryui/jquery-ui-position.js
							// sap/ui/thirdparty/jqueryui/jquery-ui-datepicker.js

							// exclude CLDR and messagebundles
							'!sap/ui/core/cldr/**',
							'!sap/ui/core/messagebundle*'
						]
					},
					jsdoc: {
						exclude: [ 'sap/ui/qunit', 'sap/ui/thirdparty' ]
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
					path: 'src/sap.ui.documentation',
					jsdoc: {
						exclude: [ 'sap/ui/documentation/sdk/thirdparty' ]
					}
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
					path: 'src/sap.ui.codeeditor',
					preload: {
						src: [
							'**/*.js',
							'!sap/ui/codeeditor/js/**'
						]
					},
					jsdoc: {
						exclude: [ 'sap/ui/codeeditor/js' ]
					}
			},
			{
					name: 'sap.ui.support',
					path: 'src/sap.ui.support'
			},
			{
					name: 'sap.ui.rta',
					path: 'src/sap.ui.rta'
			},
			{
					name: 'sap.ui.integration',
					path: 'src/sap.ui.integration'
			},
			{
				name: 'sap.ui.testrecorder',
				path: 'src/sap.ui.testrecorder'
		}	,
			{
					name: 'themelib_sap_bluecrystal',
					path: 'src/themelib_sap_bluecrystal',
					type: 'theme'
			},
			{
					name: 'themelib_sap_belize',
					path: 'src/themelib_sap_belize',
					type: 'theme'
			},
			{
					name: 'themelib_sap_fiori_3',
					path: 'src/themelib_sap_fiori_3',
					type: 'theme'
			}
		]

	};

	// Load config extension script to allow overrides to "grunt" and "gruntData"
	var configExtensionFile = grunt.option("config-extension");
	if (configExtensionFile) {
		configExtensionFile.split(',').forEach(file => require(path.resolve(file))(grunt, gruntData));
	}

	// Normalize all library 'path' to individual 'src' and 'test' paths
	gruntData.allLibraries.forEach(function(library) {
		library.src = library.src || library.path + "/src";
		library.test = library.test || library.path + "/test";
	});

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
				'gitpush': 'grunt-git',
				'jsdoc': 'grunt-jsdoc'
			}
		},

		data: gruntData

	});

};
