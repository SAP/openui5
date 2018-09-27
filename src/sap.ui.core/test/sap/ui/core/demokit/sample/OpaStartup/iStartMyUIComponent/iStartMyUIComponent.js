/* global QUnit */

QUnit.config.autostart = false;

// To avoid error reports because of QUnit's noglobals check,
// predefine some global variables that the embedded component writes (most of them introduced by the CAJA HTML sanitizer)
["CSS_PROP_BIT_QUANTITY", "CSS_PROP_BIT_HASH_VALUE", "CSS_PROP_BIT_NEGATIVE_QUANTITY", "CSS_PROP_BIT_QSTRING_CONTENT", "CSS_PROP_BIT_QSTRING_URL", "CSS_PROP_BIT_HISTORY_INSENSITIVE",
	"CSS_PROP_BIT_Z_INDEX", "CSS_PROP_BIT_ALLOWED_IN_LINK", "cssSchema", "lexCss", "decodeCss", "sanitizeCssProperty",
	"sanitizeCssSelectors", "sanitizeStylesheet", "parseCssStylesheet", "parseCssDeclarations", "html4", "html",
	"html_sanitize"].forEach(function(s) {
	"use strict";
	window[s] = undefined;
});

sap.ui.require([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'sap/ui/test/matchers/AggregationFilled'
], function (Opa5, opaTest, AggregationFilled) {
	"use strict";

	QUnit.module("iStartMyUIComponent");

	opaTest("Should start and teardown a component", function (Given, When, Then) {
		Opa5.extendConfig({
			viewNamespace: "sap.ui.sample.appUnderTest.view.",
			autoWait: true
		});

		// Loads the component with the given name
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "sap.ui.sample.appUnderTest"
			},
			// testing deeplinks is possible by setting a hash
			hash: ""
		});

		// execute your tests
		Then.waitFor({
			viewName: "Main",
			id: "productList",
			matchers: new AggregationFilled({ name: "items" }),
			success: function () {
				Opa5.assert.ok(true, "The component was removed");
			}
		}).
		// Removes the component again
		and.iTeardownMyApp();

	});

	opaTest("Should start a UIComponent and wait for it to load fully", function (Given, When, Then) {
		Opa5.extendConfig({
			viewNamespace: "sap.ui.sample.appUnderTest.view.",
			autoWait: false
		});

		// wait for the application to fully load, including all onInit process
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "sap.ui.sample.appUnderTest"
			},
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

	QUnit.start();

});
