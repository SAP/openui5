/* global QUnit */
sap.ui.define([
	"sap/ui/core/Control"
], function(Control) {
	"use strict";

	QUnit.module("FLP Boot Scenario");

	QUnit.test("Check binding parser is set correctly after core is booted", function (assert) {
		assert.expect(1);
		var done = assert.async();

		// load config file as in FLP boot scenario with specific config before core is loaded
		sap.ui.require(["testdata/core/testdata/customboot/common.configure.ui5"], function () {
			// load core and check that bindingparser is correctly derived from config after core was loaded
			sap.ui.require(["sap/ui/core/Core"], function(Core) {
				var oControl = new Control({
					busy: "{ path: '/test'}"
				});
				assert.strictEqual(oControl.getBindingInfo("busy").parts[0].path, "/test", "Check that complex binding path was parsed corretly by complexparser");
				done();
			}, function(oErr) {
				assert.strictEqual(oErr, {}, "requiring the Core must not fail");
			});
		});
	});
});