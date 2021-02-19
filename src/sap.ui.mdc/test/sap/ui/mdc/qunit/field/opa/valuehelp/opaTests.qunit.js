/*!
 * ${copyright}
 */

/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"mdc/qunit/util/V4ServerHelper"
], function(
	Opa5,
	opaQunit,
	ODataV4ServerHelper
) {
	"use strict";


	Opa5.extendConfig({
		autoWait: true,
		async: true,
		appParams: {
			"sap-ui-animation": false
		}
	});

	ODataV4ServerHelper.checkWhetherServerExists().then(onODataV4ServerChecked);

	// this is where we decide to ONLY execute the test if the OData V4 server is available
	function onODataV4ServerChecked(bServerAvailable) {

		if (bServerAvailable) {

			sap.ui.require([
				"test-resources/sap/ui/mdc/qunit/field/opa/valuehelp/test/FieldValueHelpTableJourney"
			], function() {
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
