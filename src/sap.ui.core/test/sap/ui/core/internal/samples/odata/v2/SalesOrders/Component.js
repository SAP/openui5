/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the
 *   ZUI5_GWSAMPLE_BASIC OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/MessageScope"
], function (coreLibrary, UIComponent, JSONModel, MessageScope) {
	"use strict";
	var MessageType = coreLibrary.MessageType;

	return UIComponent.extend("sap.ui.core.internal.samples.odata.v2.SalesOrders.Component", {
		metadata : {
			manifest : "json"
		},

		init : function () {
			var aItemFilter = [{
					icon : "",
					text : "Show all",
					type : "Show all"
				}, {
					icon : "",
					text : "With any message",
					type : "With any message"
				}, {
					icon : "sap-icon://message-error",
					text : "With error messages",
					type : MessageType.Error
				}, {
					icon : "sap-icon://message-warning",
					text : "With warning messages",
					type : MessageType.Warning
				}, {
					icon : "sap-icon://message-success",
					text : "With success messages",
					type : MessageType.Success
				}, {
					icon : "sap-icon://message-information",
					text : "With information messages",
					type : MessageType.Information
				}],
				oModel;

			UIComponent.prototype.init.apply(this, arguments);

			oModel = this.getModel();
			oModel.setDeferredGroups(["changes", "FixQuantity", "create"]);
			oModel.setMessageScope(MessageScope.BusinessObject);

			this.setModel(new JSONModel({
				itemFilter : aItemFilter,
				itemSelected : false,
				messageCount : 0,
				salesOrderID : "0500000005"
			}), "ui");
			this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "messageModel");
		}
	});
});
