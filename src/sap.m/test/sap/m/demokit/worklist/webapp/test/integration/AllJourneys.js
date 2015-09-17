jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"sap/ui/demo/worklist/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"sap/ui/demo/worklist/test/integration/pages/Worklist",
		"sap/ui/demo/worklist/test/integration/pages/Object",
		"sap/ui/demo/worklist/test/integration/pages/NotFound",
		"sap/ui/demo/worklist/test/integration/pages/Browser",
		"sap/ui/demo/worklist/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "sap.ui.demo.worklist.view."
	});

	sap.ui.require([
		"sap/ui/demo/worklist/test/integration/WorklistJourney",
		"sap/ui/demo/worklist/test/integration/ObjectJourney",
		"sap/ui/demo/worklist/test/integration/NavigationJourney",
		"sap/ui/demo/worklist/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});