jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

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
		"sap/ui/demo/masterdetail/test/integration/NavigationJourneyPhone",
		"sap/ui/demo/masterdetail/test/integration/NotFoundJourneyPhone",
		"sap/ui/demo/masterdetail/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});

