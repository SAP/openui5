/*global QUnit */
(function() {
	"use strict";

	QUnit.config.autostart = false;

	sap.ui.require([
		"sap/ui/test/Opa5",
		"sap/ui/test/opaQunit",
		"sap/ui/test/actions/Press"
	], function (Opa5, opaTest, Press) {
		QUnit.module("Message Toast");

		Opa5.extendConfig({
			viewNamespace: "sap.m.sample.TableTest.applicationUnderTest.view.",
			autoWait: true
		});

		opaTest("Should click on a list item and see success confirmation", function (Given, When, Then) {

			Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

			When.waitFor({
				controlType: "sap.m.ColumnListItem",
				matchers: [function (oCandidateListItem) {
					var oTableLine = {};
					oTableLine = oCandidateListItem.getBindingContext().getObject();
					var sFound = false;

					for (var sName in oTableLine) {
						if ((sName === "Name") && (oTableLine[sName].toString() === "Astro Phone 6")) {
							QUnit.ok(true, "Cell has been found");
							sFound = true;
							break;
						}
					}
					return sFound;
				}],

				actions: new Press(),
				errorMessage: "Cell could not be found in the table"
			});

			Then.waitFor({
				controlType: "sap.m.Button",
				check: function (aButtons) {
					return aButtons.filter(function (oButton) {
						if (oButton.getText() !== "OK") {
							return false;
						}
						return true;
					});
				},
				actions: new Press(),
				errorMessage: "Did not find the OK button"
			});

			Then.iTeardownMyAppFrame();
		});

		QUnit.start();
	});
});
