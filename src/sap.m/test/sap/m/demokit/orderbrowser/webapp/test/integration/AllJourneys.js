jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 Orders in the list
// * All 3 Orders have at least one Order_Details

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/demo/orderbrowser/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"sap/ui/demo/orderbrowser/test/integration/pages/App",
	"sap/ui/demo/orderbrowser/test/integration/pages/Browser",
	"sap/ui/demo/orderbrowser/test/integration/pages/Master",
	"sap/ui/demo/orderbrowser/test/integration/pages/Detail",
	"sap/ui/demo/orderbrowser/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "sap.ui.demo.orderbrowser.view."
	});

	sap.ui.require([
		"sap/ui/demo/orderbrowser/test/integration/MasterJourney",
		"sap/ui/demo/orderbrowser/test/integration/NavigationJourney",
		"sap/ui/demo/orderbrowser/test/integration/NotFoundJourney",
		"sap/ui/demo/orderbrowser/test/integration/BusyJourney"
	], function () {
		QUnit.start();
	});
});