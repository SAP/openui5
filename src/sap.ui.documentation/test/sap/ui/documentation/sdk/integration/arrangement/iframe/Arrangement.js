sap.ui.define(['sap/ui/test/Opa5'], function (Opa5) {
	"use strict";

	return Opa5.extend("sap.ui.documentation.sdk.test.arrangement.WellcomeJourneyArrangement", {
		iStartMyApp : function (sAdditionalUrlParameters) {
			var appRootURL = "../../../../../../../../../testsuite/documentation.html";

			// if configuration file is used, appRootURL can be changed
			// for local testing purposes. See opaTestsWithIFrame.qunit.html
			if (typeof window["sap-ui-documentation-test-config"] === "object") {
				appRootURL = window["sap-ui-documentation-test-config"].appRootURL;
			}
			sAdditionalUrlParameters = sAdditionalUrlParameters || "";
			return this.iStartMyAppInAFrame(appRootURL + "?sap-ui-language=en&sap-ui-animation=false&serverDelay=0" + sAdditionalUrlParameters);
		}
	});
});