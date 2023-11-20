/* global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/test/opaQunit',
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/LabelFor',
	'sap/ui/test/actions/EnterText'
], function (opaTest, Opa5, LabelFor, EnterText) {
	"use strict";

	QUnit.module("Test the App");

	Opa5.extendConfig({
		viewNamespace: "appUnderTest.view.",
		autoWait : true
	});

	var sName = "My name";
	var sAddress = "My address";
	var sMail = "MyMail";
	var sViewName = "Main";

	opaTest("Populate user data in form", function (Given, When, Then) {

		// Arrange
		Given.iStartMyAppInAFrame("webapp/index.html");

		// Act
		When.waitFor({
			viewName: sViewName,
			controlType: "sap.m.Input",
			matchers: new LabelFor({
				key: "NAME_LABEL"
			}),
			actions: new EnterText({text: sName}),
			errorMessage: "Failed to fulfill Name input"
		}).waitFor({
			viewName: sViewName,
			controlType: "sap.m.Input",
			matchers: new LabelFor({
				text: "Address"
			}),
			actions: new EnterText({text: sAddress}),
			errorMessage: "Failed to fulfill Address input"
		}).waitFor({
			viewName: sViewName,
			controlType: "sap.m.Input",
			matchers: new LabelFor({
				key: "MAIL_LABEL"
			}),
			actions: new EnterText({text: sMail}),
			errorMessage: "Failed to fulfill Mail input"
		});

		// Assert
		Then.waitFor({
			viewName: sViewName,
			id: "inputName",
			success: function (oInput) {
				Opa5.assert.ok(oInput.getValue() === sName, "The input is fulfilled with the proper text");
			},
			errorMessage: "Input have wrong value"
		}).waitFor({
			viewName: sViewName,
			id: "inputAddress",
			success: function (oInput) {
				Opa5.assert.ok(oInput.getValue() === sAddress, "The input is fulfilled with the proper text");
			},
			errorMessage: "Input have wrong value"
		}).waitFor({
			viewName: sViewName,
			id: "inputMail",
			success: function (oInput) {
				Opa5.assert.ok(oInput.getValue() === sMail, "The input is fulfilled with the proper text");
			},
			errorMessage: "Input have wrong value"
		}).waitFor({
			viewName: sViewName,
			controlType: "sap.m.Input",
			matchers: {
				// LabelFor - declarative syntax
				labelFor: {
					key: "NAME_LABEL"
				},
				properties: {
					value: sName
				}
			},
			success: function () {
				Opa5.assert.ok(true, "The input is found with declarative LabelFor");
			},
			errorMessage: "Input has wrong value"
		});

		// Tear down should always be done in real use case
		// In this sample we commented it out so you can see the result.
		// If no globals is activated,
		// IE will fail because the frame with an id will be recognized as global.
		if (QUnit.config.noglobals) {
			Then.iTeardownMyAppFrame();
		}
	});

	QUnit.start();

});
