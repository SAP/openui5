/* global QUnit */
QUnit.config.autostart = false;

globalThis.fnInit = () => {
	"use strict";

	sap.ui.require([
		"sap/ui/test/opaQunit",
		"sap/ui/test/Opa5",
		"sap/ui/test/matchers/AggregationFilled",
		"sap/ui/test/matchers/Ancestor"
	], function (opaTest, Opa5, AggregationFilled, Ancestor) {
		QUnit.module("iStartMyAppInAFrame");

		var sTestNameExt = "";

		if (window["sap-ui-debug"]) {
			sTestNameExt = " when sap-ui-debug=true";
		}

		opaTest("Should start and teardown an app in a frame" + sTestNameExt, function (Given, When, Then) {
			Opa5.extendConfig({
				viewNamespace: "appUnderTest.view.",
				autoWait: true
			});

			// Arrangements
			Given.iStartMyAppInAFrame("applicationUnderTest/index.html").done(function(){
				Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame was loaded");
			});

			// execute your tests
			Then.waitFor({
				viewName: "Main",
				id: "productList",
				matchers: new AggregationFilled({ name: "items" }),
				success: function () {
					Opa5.assert.ok(true, "The List was visible");
				}
			}).
			// Removes the component again
			and.iTeardownMyApp();

		});

		opaTest("Should start an application in a frame and wait for it to load fully", function (Given, When, Then) {
			Opa5.extendConfig({
				viewNamespace: "appUnderTest.view.",
				autoWait: false
			});

			// wait for the application to fully load, including all onInit process
			Given.iStartMyAppInAFrame({
				source: "applicationUnderTest/index.html",
				autoWait: true
			});

			// should wait for the table to fully load
			// because the app and the table is fully loaded, there is no need to poll and it matches already at the first check.
			Then.waitFor({
				viewName: "Main",
				id: "productList",
				timeout: 3,
				matchers: new AggregationFilled({ name: "items" }),
				success: function () {
					Opa5.assert.ok(true, "The application was loaded before subsequent test steps");
				},
				errorMessage: "The application was not loaded and OPA timeout was reached"
			});

			Then.iTeardownMyApp();

		});

		opaTest("Should start an application in an iFrame with a fixed size", function (Given, When, Then) {
			Opa5.extendConfig({
				viewNamespace: "appUnderTest.view.",
				autoWait: true
			});

			// change the frame size to see the application's visual response
			// the header toolbar overflows when the viewport width is less than 560px
			Given.iStartMyAppInAFrame({
				source: "applicationUnderTest/index.html",
				width: 550,
				height: 500
			});

			Then.waitFor({
				viewName: "Main",
				controlType: "sap.m.OverflowToolbar",
				success: function (aToolbar) {
					return this.waitFor({
						controlType: "sap.m.ToggleButton",
						matchers: new Ancestor(aToolbar[0]),
						success: function () {
							Opa5.assert.ok(true, "The application was loaded in a small frame and an overflow button appeared");
						},
						errorMessage: "The application was loaded in a frame big enough to not render an overflow button"
					});
				},
				errorMessage: "The application did not have an overflow toolbar"
			});

			Then.iTeardownMyApp();
		});
		QUnit.start();
	});
};