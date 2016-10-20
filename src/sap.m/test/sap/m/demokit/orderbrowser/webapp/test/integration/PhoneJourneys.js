jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

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
		"sap/ui/demo/orderbrowser/test/integration/NavigationJourneyPhone",
		"sap/ui/demo/orderbrowser/test/integration/NotFoundJourneyPhone",
		"sap/ui/demo/orderbrowser/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});