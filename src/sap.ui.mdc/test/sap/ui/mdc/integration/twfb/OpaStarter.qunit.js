/*!
 * ${copyright}
 */
/* global QUnit */
sap.ui.define([
	"sap/ui/test/Opa5",
	"mdc/qunit/util/V4ServerHelper",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary",
	"test-resources/sap/ui/mdc/testutils/opa/Util"
], function(
	Opa5,
	ODataV4ServerHelper,
	P13nArrangement
) {
	"use strict";

	Opa5.extendConfig({
		autoWait: true,
		async: true,
		appParams: {
			"sap-ui-animation": false,
			"sap-ui-xx-filterQueryPanel": true,
			"service": "tenant"
		},
		testLibs: {
			mdcTestLibrary: {
				viewName: "sap.ui.v4.demo.view.App"
			}
		}
	});

	ODataV4ServerHelper.checkWhetherServerExists().then(onODataV4ServerChecked);

	// this is where we decide to ONLY execute the test if the OData V4 server is available
	function onODataV4ServerChecked(bServerAvailable) {

		if (bServerAvailable) {

			sap.ui.require([
				"local/test/" + QUnit.urlParams.test
			], function() {
				new P13nArrangement().enableAndDeleteLrepLocalStorage();
				QUnit.start();
			});

		} else {

			QUnit.test("V4 NOT AVAILABLE - v4server.integration TESTS SKIPPED", function(assert) {
				assert.ok(true, "Tests are not executed when V4 Test Server is not available");
			});

			QUnit.start();
		}
	}
});
