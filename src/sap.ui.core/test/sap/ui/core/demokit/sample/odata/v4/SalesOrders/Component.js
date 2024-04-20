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
	"sap/ui/core/Messaging",
	"sap/ui/core/UIComponent",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/mvc/View",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (Log, HBox, library, Messaging, UIComponent, MessageType, View, JSONModel, TestUtils) {
	"use strict";

	var ViewType = library.mvc.ViewType; // shortcut for sap.ui.core.mvc.ViewType

	return UIComponent.extend("sap.ui.core.sample.odata.v4.SalesOrders.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var oLayout = new HBox({
					renderType : "Bare"
				}),
				oModel = this.getModel();

			oModel.attachPropertyChange(function (oEvent) {
				var mParameters = oEvent.getParameters();

				Object.keys(mParameters).forEach(function (sProperty) {
					mParameters[sProperty] = "" + mParameters[sProperty];
				});
				Log.debug("propertyChange", JSON.stringify(mParameters),
					"sap.ui.core.sample.odata.v4.SalesOrders.Component");
			});

			// the same model can be accessed via two names to allow for different binding contexts
			this.setModel(oModel, "headerContext");
			this.setModel(oModel, "parameterContext");
			this.setModel(Messaging.getMessageModel(), "messageModel");

			// simulate a Fiori Elements app, where the view is only created after
			// $metadata has been loaded
			oModel.getMetaModel().requestObject("/SalesOrderList/").then(function () {
				var aItemFilter = [{
						icon : "",
						text : "Show All",
						type : "Show All"
					}, {
						icon : "",
						text : "With Any Message",
						type : "With Any Message"
					}, {
						icon : "sap-icon://message-error",
						text : "With Error Messages",
						type : MessageType.Error
					}, {
						icon : "sap-icon://message-warning",
						text : "With Warning Messages",
						type : MessageType.Warning
					}, {
						icon : "sap-icon://message-success",
						text : "With Success Messages",
						type : MessageType.Success
					}, {
						icon : "sap-icon://message-information",
						text : "With Information Messages",
						type : MessageType.Information
					}];

				Log.debug("ETags: " + JSON.stringify(oModel.getMetaModel().getETags()),
					"sap.ui.core.sample.odata.v4.SalesOrders.Component");

				this.runAsOwner(function () {
					View.create({
						id : "sap.ui.core.sample.odata.v4.SalesOrders.Main",
						models : {undefined : oModel,
							ui : new JSONModel({
								bCreateItemPending : false,
								filterProductID : "",
								filterValue : "",
								itemFilter : aItemFilter,
								bLineItemSelected : false,
								iMessages : 0,
								bRealOData : TestUtils.isRealOData(),
								bSalesOrderDeleted : false,
								bSalesOrderSelected : false,
								bScheduleSelected : false,
								bSelectedSalesOrderItemTransient : false,
								bSelectedSalesOrderTransient : false,
								bSortGrossAmountDescending : undefined,
								bSortSalesOrderIDDescending : undefined,
								sSortGrossAmountIcon : "",
								sSortSalesOrderIDIcon : "",
								aStrictMessages : []
							}
						)},
						type : ViewType.XML,
						viewName : "sap.ui.core.sample.odata.v4.SalesOrders.Main"
					}).then(function (oView) {
						oLayout.addItem(oView);
					});
				});
			}.bind(this));
			return oLayout;
			// TODO: enhance sample application after features are supported
			// - Error Handling; not yet implemented in model
		}
	});
});
