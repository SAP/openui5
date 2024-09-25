sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'sap/ui/test/actions/Press',
	"sap/ui/test/actions/EnterText",
	"sap/ui/events/KeyCodes"
], function (
	Opa5,
	opaTest,
	Press,
	EnterText,
	KeyCodes
) {
	"use strict";

	var oActions = new Opa5({
		iClickBackButton: function () {
			return this.waitFor({
				controlType : "sap.m.Button",
				matchers : new sap.ui.test.matchers.PropertyStrictEquals({
					name : "icon",
					value: "sap-icon://nav-back"
				}),
				actions: new Press(),
				errorMessage: "Did not find the Icon"
			});
		},

		iClickFistListItem: function () {
			return this.waitFor({
				controlType: "sap.m.StandardListItem",
				actions: new Press(),
				errorMessage: "Did not find the ListItem"
			});
		}
	});

	var oAssertions = new Opa5({

		iSeeEnabledLinks: function (sId) {
			return this.waitFor({
				check: function () {
					return Opa5.getJQuery()(".sapMLnk:not(.sapMMsgViewItemDisabledLink)").length > 0;
				},
				success: function () {
						Opa5.assert.ok(true, "Links are shown");
				},
				errorMessage: "Links are disabled"
			});
		}
	});

	Opa5.extendConfig({
		actions: oActions,
		assertions: oAssertions,
		autoWait: true,
		viewName: "MyView"
	});

	opaTest('Check if links are enabled on second navigation', function (Given, When, Then) {
		// Arrange
		Given.iStartMyAppInAFrame("./test-resources/sap/m/qunit/opa/messageview/URLValidation/URLValidation.html");

		// Assert
		Then.iSeeEnabledLinks();

		// Act
		When.iClickBackButton();
		When.iClickFistListItem();

		// Assert
		Then.iSeeEnabledLinks();

		// Tear down
		Then.iTeardownMyApp();
	});
});
