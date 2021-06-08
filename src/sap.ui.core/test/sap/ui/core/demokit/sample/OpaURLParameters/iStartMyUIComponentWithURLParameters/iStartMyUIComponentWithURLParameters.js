/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'sap/ui/thirdparty/URI'
], function (Opa5, opaTest, URI) {
	"use strict";

	var oAppParams = {
		"key": "value"
	};

	Opa5.extendConfig({
		viewNamespace : "sap.ui.sample.appUnderTest.view.",
		autoWait : true,
		appParams: oAppParams
	});

	QUnit.module("iStartMyUIComponent");

	opaTest("Should start with URL parameter and teardown a component", function (Given, When, Then) {

		// Loads the component with the given name
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "sap.ui.sample.appUnderTest"
			}
		});

		// Check that application parameters are passed to the URL
		Then.waitFor({
			success: function () {
				Opa5.assert.ok(new URI(window.location.href).search(true)["key"],
					oAppParams["key"], "Component was started with app params");
			}
		}).
		// Removes the component
		and.iTeardownMyApp();

	});
	QUnit.start();

});
