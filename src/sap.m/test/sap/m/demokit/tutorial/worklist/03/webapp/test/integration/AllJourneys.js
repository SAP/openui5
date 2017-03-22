jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"myCompany/myApp/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"myCompany/myApp/test/integration/pages/Worklist",
	"myCompany/myApp/test/integration/pages/Object",
	"myCompany/myApp/test/integration/pages/NotFound",
	"myCompany/myApp/test/integration/pages/Browser",
	"myCompany/myApp/test/integration/pages/App"
], function(Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "myCompany.myApp.view."
	});

	sap.ui.require([
		"myCompany/myApp/test/integration/WorklistJourney",
		"myCompany/myApp/test/integration/ObjectJourney",
		"myCompany/myApp/test/integration/NavigationJourney",
		"myCompany/myApp/test/integration/NotFoundJourney"
	], function() {
		QUnit.start();
	});
});