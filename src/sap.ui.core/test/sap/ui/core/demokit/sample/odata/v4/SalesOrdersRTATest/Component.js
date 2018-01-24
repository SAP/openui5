/*!
 * ${copyright}
 */

/**
 * @fileOverview Extension of the sales orders app to test suspend/resume with UI adaptation at
 *   runtime.
 * @version @version@
 */
sap.ui.define([
	"sap/ui/core/sample/odata/v4/SalesOrders/Component"
], function (SalesOrdersComponent) {
	"use strict";

	return SalesOrdersComponent.extend("sap.ui.core.sample.odata.v4.SalesOrdersRTATest.Component", {
		metadata : {
			manifest : "json"
		}
	});
});

