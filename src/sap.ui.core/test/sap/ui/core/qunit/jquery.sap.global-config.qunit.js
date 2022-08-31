/* global QUnit */
sap.ui.define(["sap/ui/core/Configuration"], function(Configuration) {
	"use strict";
	QUnit.module("Basic");

	QUnit.test("ExternalConfig", function(assert) {

		var oConfig = Configuration;

		assert.equal(oConfig.getTheme(), "sap_bluecrystal", "Theme must be sap_blucrystal");
		assert.ok(sap.ui.commons !== undefined, "sap.ui.commons must be preloaded");
		assert.ok(sap.m === undefined, "sap.m must not be preloaded");

	});
});