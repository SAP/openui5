/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the
 *   zui5_epm_sample OData service.
 * @version @version@
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/HBox",
	"sap/ui/core/mvc/View", // sap.ui.view()
	"sap/ui/core/mvc/ViewType",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/URI",
	"./SalesOrdersSandbox"
], function (jQuery, HBox, View, ViewType, UIComponent, JSONModel, OperationMode, ODataModel,
		TestUtils, URI, SalesOrdersSandbox) {
	"use strict";

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

			// simulate a Fiori Elements app, where the view is only created after
			// $metadata has been loaded
			oModel.getMetaModel().requestObject("/SalesOrderList/").then(function () {
				var oLastModified = oModel.getMetaModel().getLastModified();

				jQuery.sap.log.debug("Last-Modified: " + oLastModified,
					oLastModified && oLastModified.toISOString(),
					"sap.ui.core.sample.odata.v4.SalesOrders.Component");

				oLayout.addItem(sap.ui.view({
					async : true,
					id : "sap.ui.core.sample.odata.v4.SalesOrders.Main",
					models : { undefined : oModel,
						ui : new JSONModel({
								bCreateItemPending : false,
								filterProductID : "",
								filterValue : "",
								bLineItemSelected : false,
								bRealOData : TestUtils.isRealOData(),
								bSalesOrderSelected : false,
								bScheduleSelected : false,
								bSelectedSalesOrderTransient : false,
								bSortGrossAmountDescending : undefined,
								bSortSalesOrderIDDescending : undefined,
								sSortGrossAmountIcon : "",
								sSortSalesOrderIDIcon : ""
							}
					)},
					type : ViewType.XML,
					viewName : "sap.ui.core.sample.odata.v4.SalesOrders.Main"
				}));
			});
			return oLayout;
			// TODO: enhance sample application after features are supported
			// - Error Handling; not yet implemented in model
		},

		exit : function () {
			TestUtils.retrieveData("sap.ui.core.sample.odata.v4.SalesOrders.sandbox").restore();
			// ensure the sandbox module is reloaded so that sandbox initialization takes place
			// again the next time the component used
			jQuery.sap.unloadResources(
				"sap/ui/core/sample/odata/v4/SalesOrders/SalesOrdersSandbox.js",
				false /*bPreloadGroup*/, true /*bUnloadAll*/, true /*bDeleteExports*/);
		}
	});
});
