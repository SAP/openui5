/*global QUnit*/
jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
jQuery.sap.require("sap.ui.qunit.qunit-coverage");
if (window.blanket) {
	window.blanket.options("sap-ui-cover-only", "[sap/ui/rta/dttool]");
	window.blanket.options("sap-ui-cover-never", "[sap/ui/rta/dttool/integration]");
}
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/rta/dttool/integration/pages/Common",
	"sap/ui/rta/dttool/integration/pages/App"
], function(Opa5, Common, App) {

	"use strict";

	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "sap.ui.rta.dttool.view."
	});

	sap.ui.require([
		"sap/ui/rta/dttool/integration/TheJourney"
	], function () {
		QUnit.start();
	});
});