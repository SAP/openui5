/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/actions/Press"
], function (Opa5, opaTest, PropertyStrictEquals, Properties, Ancestor, Press) {
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

	opaTest("Should find a disabled Button", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

		When.waitFor({
			controlType: "sap.m.Button",
			// Search for both enabled and disabled controls.
			// Note that `autoWait` is still `true`, and by default `autoWait` limits the search to enabled controls.
			// "enabled: false" has priority over "autoWait: true"
			enabled: false,
			matchers: new Properties({
				text: "You can't click me"
			}),
			success: function (aButtons) {
				Opa5.assert.ok(true, "Found the disabled button: " + aButtons[0]);
			},
			errorMessage: "Did not find the disabled button"
		});

		Then.iTeardownMyAppFrame();
	});

	opaTest("Should check that a popover is closed", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

		When.waitFor({
			viewName: "Main",
			id: "togglePopoverButton",
			actions: new Press(),
			errorMessage: "Did not find the button which opens the popover"
		});

		Then.waitFor({
			controlType: "sap.m.Popover",
			matchers: new Properties({
				title: "My Popover"
			}),
			success: function () {
				Opa5.assert.ok(true, "The popover is open");
			},
			errorMessage: "Did not find the popover"
		});

		Then.waitFor({
			controlType: "sap.m.Popover",
			success: function (aPopovers) {
				return this.waitFor({
					check: function () {
						var aPopoverContent = aPopovers[0].getContent();
						var aButtons = aPopoverContent.filter(function (oChild) {
							return oChild.isA("sap.m.Button") && oChild.getText() === "Another text";
						});
						return !aButtons || !aButtons.length;
					},
					success: function () {
						Opa5.assert.ok(true, "The popover button is missing");
					},
					errorMessage: "The popover button is present"
				});
			}
		});

		When.waitFor({
			viewName: "Main",
			id: "togglePopoverButton",
			actions: new Press(),
			errorMessage: "Did not find the button which closes the popover"
		});

		Then.iTeardownMyAppFrame();
	});

	opaTest("Should find buttons using declarative matchers", function(Given, When, Then) {

		Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

		When.waitFor({
			viewName : "Main",
			controlType : "sap.m.Button",
			matchers : {
				properties : {
					text: "Changed text"
				},
				ancestor: {
					viewName : "Main",
					controlType : "sap.m.Bar"
				}
			},
			success : function (aButtons) {
				Opa5.assert.ok(true, "Found the button: " + aButtons[0]);
			},
			errorMessage : "Did not find the button with a text 'Changed text' in an ancestor 'internal header'"
		});

		When.waitFor({
			viewName : "Main",
			controlType: "sap.m.Button",
			matchers : {
				propertyStrictEquals : {
					name : "text",
					value : "Changed text"
				}
			},
			success : function (aButtons) {
				Opa5.assert.ok(true, "Found the button: " + aButtons[0]);
			},
			errorMessage : "Did not find the button with the property Text equal to Changed text"
		});

		Then.iTeardownMyAppFrame();
	});

	opaTest("Should find buttons using sibling matcher", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

		When.waitFor({
			viewName : "Main",
			controlType : "sap.m.Button",
			matchers : {
				sibling : {
					controlType : "sap.m.Button",
					properties: {
						text: "Button in a Page"
					}
				}
			},
			success : function (aButtons) {
				Opa5.assert.strictEqual(aButtons.length, 5, "Found 5 siblings");
				Opa5.assert.ok(true, "Found the button: " + aButtons[0]);
			},
			errorMessage : "Did not find the buttons with a sibling"
		});

		Then.iTeardownMyAppFrame();
	});

	QUnit.start();
});
