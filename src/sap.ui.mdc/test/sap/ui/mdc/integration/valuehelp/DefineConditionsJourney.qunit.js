/*!
 * ${copyright}
 */

/* global QUnit */
sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/integration/opaTestWithV4Server",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary",
	"test-resources/sap/ui/mdc/integration/valuehelp/test/DefineConditionsJourney"
], async function(
	Opa5,
	opaTestWithV4Server,
	TestLibrary,
	fnDefineConditionsJourney
) {
	"use strict";


	Opa5.extendConfig({
		autoWait: true,
		async: true,
		appParams: {
			"sap-ui-animation": false
		},
		testLibs: {
			mdcTestLibrary: {
				viewName: 'module:sap/ui/v4demo/view/App'
			}
		}
	});

	fnDefineConditionsJourney(await opaTestWithV4Server);
	QUnit.start();
});
