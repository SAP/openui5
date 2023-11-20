/*!
 * ${copyright}
 */

/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5"
], function(
	Opa5) {
	"use strict";

	Opa5.extendConfig({
		autoWait: true,
		async: true,
		appParams: {
			"sap-ui-animation": false
		}
	});

	sap.ui.require([
		"test-resources/sap/ui/mdc/qunit/table/OpaTests/appUnderTestMDCTable/test/TableJourney"
	], function() {
		QUnit.start();
	});
});