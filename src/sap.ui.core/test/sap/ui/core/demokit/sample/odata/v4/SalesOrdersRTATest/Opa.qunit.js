/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.define([
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/SalesOrders/pages/Main",
	"sap/ui/core/sample/odata/v4/SalesOrdersRTATest/pages/MainRTA",
	"sap/ui/core/sample/odata/v4/SalesOrdersRTATest/Opa.SalesOrderRTATestTypeDeterminationAndDelete.qunit",
	"sap/ui/core/sample/odata/v4/SalesOrdersRTATest/Opa.SalesOrderRTATestChangeContext.qunit",
	"sap/ui/core/sample/odata/v4/SalesOrdersRTATest/Opa.SalesOrderRTATestCreate.qunit",
	"sap/ui/core/sample/odata/v4/SalesOrdersRTATest/Opa.SalesOrderRTATestCreateRelative.qunit",
	"sap/ui/core/sample/odata/v4/SalesOrdersRTATest/Opa.SalesOrderRTATestWriteNonDeferredGroup.qunit"
], function () {
	"use strict";

	// looks like this test needs to run _after_ the others; maybe because resume() is async.?
	// TODO make it more robust! applyDialog() might have to wait...???
	sap.ui.require([
		"sap/ui/core/sample/odata/v4/SalesOrdersRTATest/Opa.SalesOrderRTATestAdaptUI.qunit"
	], function () {
		QUnit.start();
	});
});
