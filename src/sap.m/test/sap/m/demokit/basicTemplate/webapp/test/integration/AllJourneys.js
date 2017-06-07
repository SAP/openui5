/* global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/demo/basicTemplate/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"sap/ui/demo/basicTemplate/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "sap.ui.demo.basicTemplate.view."
	});

	sap.ui.require([
		"sap/ui/demo/basicTemplate/test/integration/navigationJourney"
	], function () {
		QUnit.start();
	});
});