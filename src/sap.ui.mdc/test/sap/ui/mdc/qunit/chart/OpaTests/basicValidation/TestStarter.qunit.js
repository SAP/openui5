/*!
 * ${copyright}
 */

/* global QUnit */
QUnit.config.autostart = false;

sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/integration/opaTestWithV4Server",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary",
	"test-resources/sap/ui/mdc/qunit/chart/OpaTests/basicValidation/ChartJourney"
], async function(
	Opa5,
	opaTestWithV4Server,
	TestLibrary,
	fnChartJourney
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

	fnChartJourney(await opaTestWithV4Server);
	QUnit.start();
});
