/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"mycompany/myapp/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"mycompany/myapp/test/integration/pages/Worklist",
	"mycompany/myapp/test/integration/pages/Object",
	"mycompany/myapp/test/integration/pages/NotFound",
	"mycompany/myapp/test/integration/pages/Browser",
	"mycompany/myapp/test/integration/pages/App"
], function(Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "mycompany.myapp.view."
	});

	sap.ui.require([
		"mycompany/myapp/test/integration/WorklistJourney",
		"mycompany/myapp/test/integration/ObjectJourney",
		"mycompany/myapp/test/integration/NavigationJourney",
		"mycompany/myapp/test/integration/NotFoundJourney"
	], function() {
		QUnit.start();
	});
});