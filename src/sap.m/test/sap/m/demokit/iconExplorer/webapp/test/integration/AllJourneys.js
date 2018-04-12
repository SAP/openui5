/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.define([
		"sap/ui/test/Opa5",
		"sap/ui/demo/iconexplorer/test/integration/pages/Common",
		"sap/ui/demo/iconexplorer/localService/mockserver",
		"sap/ui/test/opaQunit",
		"sap/ui/demo/iconexplorer/test/integration/pages/Overview",
		"sap/ui/demo/iconexplorer/test/integration/pages/Preview",
		"sap/ui/demo/iconexplorer/test/integration/pages/NotFound",
		"sap/ui/demo/iconexplorer/test/integration/pages/Browser",
		"sap/ui/demo/iconexplorer/test/integration/pages/App",
		"sap/ui/demo/iconexplorer/test/integration/pages/Home"
	], function (Opa5, Common, mockserver) {
	"use strict";

	mockserver.init();

	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "sap.ui.demo.iconexplorer.view."
	});

	sap.ui.define([
		"sap/ui/demo/iconexplorer/test/integration/HomeJourney",
		"sap/ui/demo/iconexplorer/test/integration/NavigationJourney",
		"sap/ui/demo/iconexplorer/test/integration/OverviewJourney",
		"sap/ui/demo/iconexplorer/test/integration/PreviewJourney",
		"sap/ui/demo/iconexplorer/test/integration/NotFoundJourney",
		"sap/ui/demo/iconexplorer/test/integration/FavoriteJourney",
		"sap/ui/demo/iconexplorer/test/integration/SearchJourney"
	], function () {
		QUnit.start();
	});
});