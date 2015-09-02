jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;


sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/demo/bulletinboard/test/integration/pages/Common",
	"sap/ui/demo/bulletinboard/test/integration/pages/Worklist",
	"sap/ui/demo/bulletinboard/test/integration/pages/Browser",
	"sap/ui/demo/bulletinboard/test/integration/pages/Post"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "sap.ui.demo.bulletinboard.view."
	});

	sap.ui.require([
		"sap/ui/demo/bulletinboard/test/integration/WorklistJourney",
		"sap/ui/demo/bulletinboard/test/integration/PostJourney"
	], function () {
		QUnit.start();
	});
});
