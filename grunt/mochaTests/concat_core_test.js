/*eslint-env mocha */
'use strict';

var assert = require('assert');
var grunt = require('grunt');

describe('openui5_concat_core', function() {

	it('should create the concatinated sap-ui-core-dbg.js', function() {

		var coreJsContent = grunt.file.read('target/openui5-sap.ui.core/resources/sap-ui-core-dbg.js');
		assert.ok(coreJsContent.indexOf('sap.ui.Device') !== -1, 'Did contain the Device api');
		assert.ok(coreJsContent.indexOf('return jQuery;') !== -1, 'Did contain jQuery');
		assert.ok(coreJsContent.indexOf('jQuery.sap.require("sap.ui.core.Core"); sap.ui.getCore().boot && sap.ui.getCore().boot();') !== -1, 'Did contain the bootstrap for core');

	});

	it('should create the concatinated sap-ui-core-noJQuery-dbg.js', function() {

		var coreNoQueryJsContent = grunt.file.read('target/openui5-sap.ui.core/resources/sap-ui-core-noJQuery-dbg.js');
		assert.ok(coreNoQueryJsContent.indexOf('sap.ui.Device') !== -1, 'Did contain the Device api');
		assert.ok(coreNoQueryJsContent.indexOf('return jQuery;') === -1, 'Did not contain jQuery');
		assert.ok(coreNoQueryJsContent.indexOf('jQuery.sap.require("sap.ui.core.Core"); sap.ui.getCore().boot && sap.ui.getCore().boot();') !== -1, 'Did contain the bootstrap for core');

	});

	it('should create the concatinated sap-ui-core.js', function() {

		var coreJsContent = grunt.file.read('target/openui5-sap.ui.core/resources/sap-ui-core.js');
		assert.ok(coreJsContent.indexOf('sap.ui.Device') !== -1, 'Did contain the Device api');
		assert.ok(coreJsContent.indexOf('* jQuery JavaScript Library') !== -1, 'Did contain jQuery');
		assert.ok(coreJsContent.indexOf('sap.ui.getCore().boot&&sap.ui.getCore().boot()') !== -1, 'Did contain the bootstrap for core');

	});

	it('should create the concatinated sap-ui-coreNoJQuery.js', function() {

		var coreNoQueryJsContent = grunt.file.read('target/openui5-sap.ui.core/resources/sap-ui-core-noJQuery.js');
		assert.ok(coreNoQueryJsContent.indexOf('sap.ui.Device') !== -1, 'Did contain the Device api');
		assert.ok(coreNoQueryJsContent.indexOf('* jQuery JavaScript Library') === -1, 'Did not contain jQuery');
		assert.ok(coreNoQueryJsContent.indexOf('sap.ui.getCore().boot&&sap.ui.getCore().boot()') !== -1, 'Did contain the bootstrap for core');

	});

	it('should create the sap-ui-debug.js', function() {

		var sapUiDebugContent = grunt.file.read('target/openui5-sap.ui.core/resources/sap-ui-debug.js');
		assert.ok(sapUiDebugContent.indexOf("raw:sap/ui/debug/ControlTree.js") !== -1, 'Did contain the Control Tree');
		assert.ok(sapUiDebugContent.indexOf('jQuery.sap.require("sap.ui.core.Core"); sap.ui.getCore().boot && sap.ui.getCore().boot();') === -1, 'Did not contain the bootstrap for core');

	});
});
