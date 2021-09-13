sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'sap/ui/v4demo/test/TestObjects'
], function (Opa5, opaTest) {
	'use strict';

	Opa5.extendConfig({
		timeout: 60
	});

	var MTABLEMULTIPLETABS = "M.Table";

	opaTest("Filter Suggest", function (Given, When, Then) {

		Given.iStartMyAppInAFrame({
			source: "test-resources/sap/ui/mdc/integration/valuehelp/index.html",
			autoWait: true
		});

		When.onThePage.iEnterTextOnFilterField(MTABLEMULTIPLETABS, "aus", {keepFocus: true});
		When.onThePage.iPressKeyOnFilterField(MTABLEMULTIPLETABS, "ARROW_DOWN");
		When.onThePage.iPressKeyOnFilterField(MTABLEMULTIPLETABS, "ARROW_DOWN");

		Then.iTeardownMyAppFrame();
	});

});



