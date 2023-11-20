/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/SalesOrders/pages/Main",
	"sap/ui/core/sample/odata/v4/SalesOrdersRTATest/pages/MainRTA",
	"sap/ui/core/sample/odata/v4/SalesOrdersRTATest/Opa.SalesOrderRTATestAdaptUI.qunit",
	"sap/ui/core/sample/odata/v4/SalesOrdersRTATest/SandboxModel" // preload only
], function (Core) {
	"use strict";

	Core.ready().then(function () {
		QUnit.start();
	});
});
