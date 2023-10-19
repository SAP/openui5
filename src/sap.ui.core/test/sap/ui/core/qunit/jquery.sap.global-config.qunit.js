/* global QUnit */
sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/Theming"
], function(
	Core,
	Theming
) {
	"use strict";
	QUnit.module("Basic");

	QUnit.test("ExternalConfig", function(assert) {
		return Core.ready().then(() => {
			assert.equal(Theming.getTheme(), "sap_bluecrystal", "Theme must be sap_blucrystal");
			assert.ok(sap.ui.commons !== undefined, "sap.ui.commons must be preloaded");
			assert.ok(sap.m === undefined, "sap.m must not be preloaded");
		});
	});
});