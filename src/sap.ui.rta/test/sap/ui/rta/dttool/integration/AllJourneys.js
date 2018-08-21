/*global QUnit*/
sap.ui.requireSync("sap/ui/qunit/qunit-2-css");
sap.ui.requireSync("sap/ui/thirdparty/qunit-2");
sap.ui.requireSync("sap/ui/qunit/qunit-junit");
sap.ui.requireSync("sap/ui/qunit/qunit-coverage");

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
		viewNamespace: "sap.ui.rta.dttool.view.",
		timeout: 25
	});

	sap.ui.require([
		"sap/ui/rta/dttool/integration/BaseJourney",
		"sap/ui/rta/dttool/integration/PaletteJourney",
		"sap/ui/rta/dttool/integration/PropertyPanelJourney"
	], function () {
		QUnit.start();
	});
});