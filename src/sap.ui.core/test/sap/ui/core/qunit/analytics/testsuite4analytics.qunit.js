/*!
 * ${copyright}
 */
/*global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/qunit/analytics/AnalyticalBinding.qunit",
		"sap/ui/core/qunit/analytics/odata4analytics.qunit",
		"sap/ui/table/qunit/AnalyticalTable.qunit"
	], function () {
		QUnit.start();
	});
});
