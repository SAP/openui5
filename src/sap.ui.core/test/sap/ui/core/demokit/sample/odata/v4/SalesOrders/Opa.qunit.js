/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/SalesOrders/pages/Main",
	"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderAdditionalTargets.qunit",
	"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderMessageHandling.qunit",
	"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderTypeDeterminationAndDelete.qunit",
	"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderChangeContext.qunit",
	"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderCreate.qunit",
	"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderCreateMultiple.qunit",
	"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderCreateRelative.qunit",
	"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderWriteNonDeferredGroup.qunit",
	"sap/ui/core/sample/odata/v4/SalesOrders/SandboxModel" // preload only
], function (Core) {
	"use strict";

	Core.ready().then(function () {
		QUnit.start();
	});
});
