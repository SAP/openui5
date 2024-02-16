/*global QUnit*/
sap.ui.define([
	"sap/ui/core/Theming",
	"sap/ui/core/theming/ThemeHelper"
], function(Theming, ThemeHelper) {
	"use strict";

	QUnit.module("ThemeHelper");

	QUnit.test("getMetadata from inline parameter", function (assert) {
		var done = assert.async();
		var oMetadata;

		sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib12", { async: true }).then(function () {
			var fnAssertApplied = function () {
				oMetadata = ThemeHelper.getMetadata("sap-ui-theme-testlibs-themeParameters-lib12");
				assert.deepEqual(oMetadata, {
					"Path": "UI5.sample/path",
					"PathPattern": "/%UI5%/sample/%pattern%.css",
					"Extends": ["sap_horizon_hcb","base"],
					"Version": {
						"Build": "1.0.0",
						"Source": "1.0.0",
						"Engine": "1.0.0"
					}
				}, "Metadata correct");
				Theming.detachApplied(fnAssertApplied);
				done();
			};

			Theming.attachApplied(fnAssertApplied);
		});

		oMetadata = ThemeHelper.getMetadata("sap-ui-theme-testlibs-themeParameters-lib12");
		assert.notOk(oMetadata, "Metadata not available yet");
	});
});
