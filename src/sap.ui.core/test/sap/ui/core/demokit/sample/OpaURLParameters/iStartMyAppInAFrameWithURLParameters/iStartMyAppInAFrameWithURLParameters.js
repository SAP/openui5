/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/test/opaQunit',
	'sap/ui/test/Opa5',
	'sap/ui/thirdparty/URI'
], function (opaTest, Opa5, URI) {
	"use strict";

	var oAppParams = {
		"key": "value"
	};

	Opa5.extendConfig({
		viewNamespace : "view.",
		autoWait : true,
		appParams: oAppParams
	});

	QUnit.module("iStartMyAppInAFrame");

	opaTest("Should start and teardown an app in a frame", function (Given, When, Then) {

		// Arrangements
		Given.iStartMyAppInAFrame("applicationUnderTest/index.html").done(function(){
			Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame was loaded");
		});

		// check that parameter is passed to the IFrame
		Then.waitFor({
			success: function () {
				Opa5.assert.equal(new URI(document.getElementById("OpaFrame").contentWindow.location.href)
					.search(true)["key"], oAppParams["key"],
					"iFrame was started with app params");

			}
		}).
		// Removes the component again
		and.iTeardownMyApp();

	});

	QUnit.start();

});
