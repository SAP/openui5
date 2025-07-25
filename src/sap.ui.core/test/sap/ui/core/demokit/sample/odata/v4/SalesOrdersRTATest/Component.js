/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/odata/v4/SalesOrders/Component"
], function (SalesOrdersComponent) {
	"use strict";

	return SalesOrdersComponent.extend("sap.ui.core.sample.odata.v4.SalesOrdersRTATest.Component", {
		metadata : {
			interfaces : ["sap.ui.core.IAsyncContentCreation"],
			manifest : "json"
		}
	});
});
