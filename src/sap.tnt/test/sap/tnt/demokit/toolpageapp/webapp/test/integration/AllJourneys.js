/* global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/demo/toolpageapp/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"sap/ui/demo/toolpageapp/test/integration/pages/App",
	"sap/ui/demo/toolpageapp/test/integration/pages/Settings",
	"sap/ui/demo/toolpageapp/test/integration/pages/Statistics",
	"sap/ui/demo/toolpageapp/test/integration/pages/Home"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "sap.ui.demo.toolpageapp.view."
	});

	sap.ui.require([
		"sap/ui/demo/toolpageapp/test/integration/NavigationJourney"
	], function () {
		QUnit.start();
	});
});