/*global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/core/Lib"
], function (
	Opa5,
	opaTest,
	Lib
) {
	"use strict";

	QUnit.module("Support Assistant Booting");

	Opa5.extendConfig({
		viewNamespace: "appUnderTest.view."
	});

	opaTest("Support Assistant OPA extension should start in UIComponent container", function (Given, When, Then) {

		Given.iStartMyUIComponent({
			componentConfig: {
				name: "appUnderTest",
				url: "test-resources/sap/ui/support/integration/applicationUnderTest/"
			}
		});

		When.waitFor({
			viewName: "Main",
			check: function () {
				return Lib.isLoaded("sap.ui.support");
			},
			success: function () {
				Opa5.assert.ok(true, "Support Assistant library loaded");
			}
		});

		Then.iTeardownMyApp();
	});

});
