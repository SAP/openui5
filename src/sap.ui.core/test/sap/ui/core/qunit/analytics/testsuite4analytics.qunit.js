/*!
 * ${copyright}
 */
/*global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/qunit/analytics/AnalyticalBinding.qunit",
		"sap/ui/core/qunit/analytics/odata4analytics.qunit"
		// AnalyticalTable.qunit requires sinon 4; run testsuite.models.qunit.js instead
		// "sap/ui/table/qunit/AnalyticalTable.qunit"
	], function () {
		QUnit.start();
	});
});
