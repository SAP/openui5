/*global QUnit */
sap.ui.define([], function() {
	"use strict";

	QUnit.test("preconditions", function(assert) {
		assert.equal(sap.ui.getCore, undefined, "no sap.ui.getCore yet");
		assert.ok(sap.ui.loader.config().async, "loader is configured for async mode");
	});

	QUnit.test("booting", function(assert) {
		var done = assert.async();
		// create configuration
		window["sap-ui-config"] = window["sap-ui-config"] || {};
		window["sap-ui-config"]["xx-bootTask"] = function(complete) {
			// The load library call triggers a synchronous loading of the sap.ui.testlib library.
			// This leads to an async / sync conflict of the Core and triggers the repeated execution.
			sap.ui.getCore().loadLibrary("sap.ui.testlib", "test-resources/sap/ui/core/qunit/testdata/uilib");
			setTimeout(complete, 5);
		};

		// load and boot the core
		sap.ui.require(["sap/ui/core/Core"], function(Core) {
			Core.boot();
			Core.ready().then(function() {
				assert.ok(true, "Core should initalize after loading and booting it");
				done();
			});
		}, function(oErr) {
			assert.strictEqual(oErr, {}, "requiring the Core must not fail");
		});
	});
});
