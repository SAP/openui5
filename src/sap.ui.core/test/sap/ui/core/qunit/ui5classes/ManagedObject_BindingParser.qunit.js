/* global QUnit */
sap.ui.define([
	"sap/ui/base/BindingInfo",
	"sap/ui/base/BindingParser"
], function(
	BindingInfo,
	BindingParser
) {
	"use strict";

	QUnit.module("FLP Boot Scenario");

	QUnit.test("Check binding parser is set correctly after core is booted and FLP changed the bindingSyntax configuration", function (assert) {
		assert.expect(1);
		var done = assert.async();
		// load config file as in FLP boot scenario with specific config before core is loaded
		sap.ui.require(["fixture/customboot/common.configure.ui5"], function () {
			// load core and check that bindingparser is correctly derived from config after core was loaded
			sap.ui.require(["sap/ui/core/Core"], function(Core) {
				assert.equal(BindingInfo.parse, BindingParser.complexParser, "compatversion set by 'FLP' results in a complexParser");
				done();
			}, function(oErr) {
				assert.ok(false, "requiring the Core must not fail");
				done();
			});
		});
	});
});