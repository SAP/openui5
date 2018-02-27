jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/demo/HeapOfShards/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"sap/ui/demo/HeapOfShards/test/integration/pages/App",
	"sap/ui/demo/HeapOfShards/test/integration/CheckJourney"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "sap.ui.demo.HeapOfShards.view."
	});
	// configuration has been applied and the tests in the journeys have been loaded - start QUnit
	QUnit.start();
});

