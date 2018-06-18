/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"mycompany/myapp/MyWorklistApp/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"mycompany/myapp/MyWorklistApp/test/integration/pages/Worklist",
	"mycompany/myapp/MyWorklistApp/test/integration/pages/Object",
	"mycompany/myapp/MyWorklistApp/test/integration/pages/NotFound",
	"mycompany/myapp/MyWorklistApp/test/integration/pages/Browser",
	"mycompany/myapp/MyWorklistApp/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "mycompany.myapp.MyWorklistApp.view."
	});

	sap.ui.require([
		"mycompany/myapp/MyWorklistApp/test/integration/WorklistJourney",
		"mycompany/myapp/MyWorklistApp/test/integration/ObjectJourney",
		"mycompany/myapp/MyWorklistApp/test/integration/NavigationJourney",
		"mycompany/myapp/MyWorklistApp/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});