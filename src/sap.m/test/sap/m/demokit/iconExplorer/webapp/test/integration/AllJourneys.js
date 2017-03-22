jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"sap/ui/demo/iconexplorer/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"sap/ui/demo/iconexplorer/test/integration/pages/Overview",
		"sap/ui/demo/iconexplorer/test/integration/pages/Preview",
		"sap/ui/demo/iconexplorer/test/integration/pages/NotFound",
		"sap/ui/demo/iconexplorer/test/integration/pages/Browser",
		"sap/ui/demo/iconexplorer/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "sap.ui.demo.iconexplorer.view."
	});

	sap.ui.require([
		"sap/ui/demo/iconexplorer/test/integration/NavigationJourney",
		"sap/ui/demo/iconexplorer/test/integration/OverviewJourney",
		"sap/ui/demo/iconexplorer/test/integration/PreviewJourney",
		"sap/ui/demo/iconexplorer/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});