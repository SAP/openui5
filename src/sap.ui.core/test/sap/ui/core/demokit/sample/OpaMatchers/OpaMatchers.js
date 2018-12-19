/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor"
], function (Opa5, opaTest, PropertyStrictEquals, Properties, Ancestor) {
	"use strict";

	QUnit.module("Matchers");

	Opa5.extendConfig({
		viewNamespace: "appUnderTest.view.",
		autoWait : true
	});

	opaTest("Should find a Button with a matching property", function(Given, When, Then) {

		Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

		When.waitFor({
			viewName : "Main",
			controlType : "sap.m.Button",
			matchers : new PropertyStrictEquals({name : "text", value : "Changed text"}),
			success : function (aButtons) {
				Opa5.assert.ok(true, "Found the button: " + aButtons[0]);
			},
			errorMessage : "Did not find the button with the property Text equal to Changed text"
		});

		Then.waitFor({
			id: new RegExp("changingButton"),
			success : function (aButtons) {
				Opa5.assert.ok(true, "Found the button: " + aButtons[0]);
			},
			errorMessage : "Did not find the button with corresponding ID"
		});


		Then.iTeardownMyAppFrame();
	});

	opaTest("Should find a Button using inline-matchers, nested waitFors, Ancestor and Properties matchers", function(Given, When, Then) {

		Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

		When.waitFor({
			viewName : "Main",
			controlType : "sap.m.Bar",
			// inline-matcher directly as function
			matchers : function(oControl) {
				return oControl.hasStyleClass("sapMPageHeader");
			},
			success : function (aBars) {
				var oInternalHeader = aBars[0];

				// nested waitFor
				this.waitFor({
					viewName : "Main",
					controlType : "sap.m.Button",
					matchers : [
						// Properties matcher takes an object containing a properties to match as a parameter:
						// {propertyName : propertyValue, secondPropertyName : secondPropertyValue, ...}
						// where property values can be a regexp values also (with a string typed properties)
						new Properties({
							text : "Changed text"
						}),
						// Ancestor matcher takes a control as a parameter
						new Ancestor(oInternalHeader)
					],
					success : function (aButtons) {
						Opa5.assert.ok(true, "Found the button: " + aButtons[0] + "in a bar" + oInternalHeader);
					},
					errorMessage : "Did not find the button with a text 'Changed text' in an ancestor 'internal header'"
				});
			},
			errorMessage : "Did not find the bar with styleClass 'sapMPageHeader'"
		});

		Then.iTeardownMyAppFrame();
	});

	opaTest("Should find a Button using viewId", function (Given, When, Then) {

		Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

		When.waitFor({
			// use viewId when viewName is not enough to uniquely define a view
			viewId : "container-appUnderTest---myMainView",
			controlType : "sap.m.Button",
			matchers: new Properties({
				text : "Changed text"
			}),
			success : function (aButtons) {
				Opa5.assert.ok(true, "Found the button: " + aButtons[0] + " in view with ID myMainView");
			},
			errorMessage : "Did not find the button in the view with ID myMainView"
		});

		Then.iTeardownMyAppFrame();
	});

	QUnit.start();
});

