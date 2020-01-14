/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the
 *   zui5_epm_sample OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/base/Log",
	"sap/m/HBox",
	"sap/ui/core/library",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/View",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (Log, HBox, library, UIComponent, View, JSONModel, TestUtils) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = library.mvc.ViewType;

	return UIComponent.extend("sap.ui.core.sample.odata.v4.SalesOrders.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var oLayout = new HBox({
					renderType : "Bare"
				}),
				oModel = this.getModel();

			// the same model can be accessed via two names to allow for different binding contexts
			this.setModel(oModel, "headerContext");
			this.setModel(oModel, "parameterContext");

			// simulate a Fiori Elements app, where the view is only created after
			// $metadata has been loaded
			oModel.getMetaModel().requestObject("/SalesOrderList/").then(function () {
				var oLastModified = oModel.getMetaModel().getLastModified();

				Log.debug("Last-Modified: " + oLastModified,
					oLastModified && oLastModified.toISOString(),
					"sap.ui.core.sample.odata.v4.SalesOrders.Component");

				View.create({
					id : "sap.ui.core.sample.odata.v4.SalesOrders.Main",
					models : {
						undefined : oModel,
						ui : new JSONModel({
							bCreateItemPending : false,
							filterProductID : "",
							filterValue : "",
							bLineItemSelected : false,
							iMessages : 0,
							bRealOData : TestUtils.isRealOData(),
							bSalesOrderSelected : false,
							bScheduleSelected : false,
							bSelectedSalesOrderItemTransient : false,
							bSelectedSalesOrderTransient : false,
							bSortGrossAmountDescending : undefined,
							bSortSalesOrderIDDescending : undefined,
							sSortGrossAmountIcon : "",
							sSortSalesOrderIDIcon : ""
						}
					)},
					type : ViewType.XML,
					viewName : "sap.ui.core.sample.odata.v4.SalesOrders.Main"
				}).then(function (oView) {
					oLayout.addItem(oView);
				});
			});
			return oLayout;
			// TODO: enhance sample application after features are supported
			// - Error Handling; not yet implemented in model
		}
	});
});
