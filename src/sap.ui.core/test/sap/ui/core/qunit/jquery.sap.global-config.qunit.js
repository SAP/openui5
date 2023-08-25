/* global QUnit */
sap.ui.define(["sap/ui/core/Theming"], function(Theming) {
	"use strict";
	QUnit.module("Basic");

	QUnit.test("ExternalConfig", function(assert) {

		assert.equal(Theming.getTheme(), "sap_bluecrystal", "Theme must be sap_blucrystal");
		assert.ok(sap.ui.commons !== undefined, "sap.ui.commons must be preloaded");
		assert.ok(sap.m === undefined, "sap.m must not be preloaded");

	});
});