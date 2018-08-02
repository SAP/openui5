/*global QUnit */
QUnit.config.autostart = false;

sap.ui.require([], function() {

	QUnit.test("preconditions", function(assert) {
		assert.equal(sap.ui.getCore, undefined, "no sap.ui.getCore yet");
		assert.ok(sap.ui.loader.config().async, "loader is configured for async mode");
	});

	QUnit.test("booting", function(assert) {
		var done = assert.async();
		// create configuration
		window["sap-ui-config"] = window["sap-ui-config"] || {};
		window["sap-ui-config"]["xx-bootTask"] = function(complete) {
			sap.ui.getCore().loadLibrary("sap.ui.testlib", "test-resources/sap/ui/core/qunit/testdata/uilib");
			setTimeout(complete, 5);
		};

		// load and boot the core
		sap.ui.require(["sap/ui/core/Core"], function(core) {
			core.boot();
			sap.ui.getCore().attachInit(function() {
				assert.ok(true, "Core should initalize after loading and booting it");
				done();
			});
		}, function(oErr) {
			assert.strictEqual(oErr, {}, "requiring the Core must not fail");
		});
	});

	QUnit.start();
});
