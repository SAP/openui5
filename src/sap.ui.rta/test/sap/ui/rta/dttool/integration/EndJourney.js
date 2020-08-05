/*global QUnit*/

sap.ui.require([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5"
], function (
	opaTest,
	Opa5
) {
	"use strict";

	QUnit.module("EndJourney");

	opaTest("Tearing the app down", function (Given) {
		Given.iTeardownMyUIComponent();
		Opa5.assert.expect(0);
	});
});