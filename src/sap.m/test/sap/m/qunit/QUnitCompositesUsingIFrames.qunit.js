/*global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["sap/ui/Device"], function(Device) {
	"use strict";
	if (Device.browser.chrome) {
		// IFrame QUnits currently only work under Chrome!
		QUnit.testSuites('ResponsiveMargins',[
			"./ResponsiveMarginCssClasses.qunit.html?sap-ui-width=320px&sap-ui-height=460px&sap-ui-expect=0px 0px 16px",
			"./ResponsiveMarginCssClasses.qunit.html?sap-ui-width=599px&sap-ui-height=460px&sap-ui-expect=0px 0px 16px",
			"./ResponsiveMarginCssClasses.qunit.html?sap-ui-width=600px&sap-ui-height=460px&sap-ui-expect=16px",
			"./ResponsiveMarginCssClasses.qunit.html?sap-ui-width=1023px&sap-ui-height=460px&sap-ui-expect=16px",
			"./ResponsiveMarginCssClasses.qunit.html?sap-ui-width=1024px&sap-ui-height=460px&sap-ui-expect=16px 32px"
		]);

	} else {
		// Write a comment into the test protocol that responsive
		// tests cannot be executed.
		QUnit.test("Test responsive margin classes", function(assert) {
			assert.ok(true, "Responsive test not available yet for browser '" + Device.browser.name + "'");
		});
	}

	QUnit.start();
});
