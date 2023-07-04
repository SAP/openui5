/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/odata/v4/SalesOrders/pages/Main",
		"sap/ui/core/sample/odata/v4/SalesOrdersRTATest/pages/MainRTA",
		"sap/ui/core/sample/odata/v4/SalesOrdersRTATest/Opa.SalesOrderRTATestAdaptUI.qunit",
		"sap/ui/core/sample/odata/v4/SalesOrdersRTATest/SandboxModel" // preload only
	], function () {
		QUnit.start();
	});
});
