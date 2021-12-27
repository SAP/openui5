/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the
 *   ZUI5_GWSAMPLE_BASIC OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/core/library",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/MessageScope"
], function (UriParameters, coreLibrary, UIComponent, JSONModel, MessageScope) {
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
				sInlineCreationRows = UriParameters.fromQuery(window.location.search)
					.get("inlineCreationRows"),
				iInlineCreationRows = parseInt(sInlineCreationRows),
				oModel;

			UIComponent.prototype.init.apply(this, arguments);

			oModel = this.getModel();
			oModel.setDeferredGroups(["changes", "FixQuantity"]);
			oModel.setMessageScope(MessageScope.BusinessObject);

			this.setModel(new JSONModel({
				inlineCreationRows : isNaN(iInlineCreationRows) ? 0 : iInlineCreationRows,
				itemFilter : aItemFilter,
				itemSelected : false,
				messageCount : 0,
				salesOrderID : "0500000005",
				salesOrderItemsCount : 0,
				salesOrdersCount : 0,
				salesOrderSelected : false,
				salesOrdersFilter : "",
				useTable : false
			}), "ui");
			this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "messages");
		}
	});
});
