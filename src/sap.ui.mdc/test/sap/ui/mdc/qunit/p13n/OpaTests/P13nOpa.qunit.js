/*!
 * ${copyright}
 */

/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/qunit/util/V4ServerHelper",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function(
	Opa5,
	ODataV4ServerHelper,
	TestLibrary
) {
	"use strict";

	Opa5.extendConfig({
		autoWait: true,
		timeout: 45,
		appParams: {
			"sap-ui-animation": false,
			"sap-ui-xx-mdcTableP13n": "Table"
		}
	});

	ODataV4ServerHelper.checkWhetherServerExists().then(onODataV4ServerChecked);

	// this is where we decide to ONLY execute the test if the OData V4 server is available
	function onODataV4ServerChecked(bServerAvailable) {

		if (bServerAvailable) {

			sap.ui.require([
				"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/" + QUnit.urlParams.test
			], function(P13nOpaTest) {
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
