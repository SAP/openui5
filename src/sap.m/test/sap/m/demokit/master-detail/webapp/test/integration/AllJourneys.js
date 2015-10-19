jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 Objects in the list
// * All 3 Objects have at least one LineItems

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/demo/masterdetail/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"sap/ui/demo/masterdetail/test/integration/pages/App",
	"sap/ui/demo/masterdetail/test/integration/pages/Browser",
	"sap/ui/demo/masterdetail/test/integration/pages/Master",
	"sap/ui/demo/masterdetail/test/integration/pages/Detail",
	"sap/ui/demo/masterdetail/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "sap.ui.demo.masterdetail.view."
	});

	sap.ui.require([
		"sap/ui/demo/masterdetail/test/integration/MasterJourney",
		"sap/ui/demo/masterdetail/test/integration/NavigationJourney",
		"sap/ui/demo/masterdetail/test/integration/NotFoundJourney",
		"sap/ui/demo/masterdetail/test/integration/BusyJourney"
	], function () {
		QUnit.start();
	});
});

