/*global QUnit*/
if (window.blanket) {
	window.blanket.options("sap-ui-cover-only", "[sap/ui/rta/dttool]");
	window.blanket.options("sap-ui-cover-never", "[sap/ui/rta/dttool/integration]");
}

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/rta/dttool/integration/pages/Common",
	"sap/ui/qunit/qunit-2-css",
	"sap/ui/thirdparty/qunit-2",
	"sap/ui/qunit/qunit-junit",
	"sap/ui/qunit/qunit-coverage"
], function(Opa5, Common) {
	"use strict";

	QUnit.config.autostart = false;

	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "sap.ui.rta.dttool.view.",
		timeout: 50
	});

	sap.ui.require([
		"sap/ui/rta/dttool/integration/BaseJourney",
		"sap/ui/rta/dttool/integration/PaletteJourney",
		"sap/ui/rta/dttool/integration/PropertyPanelJourney",
		"sap/ui/rta/dttool/integration/DragDropJourney",
		"sap/ui/rta/dttool/integration/EndJourney"
	], function () {
		QUnit.start();
	});
});