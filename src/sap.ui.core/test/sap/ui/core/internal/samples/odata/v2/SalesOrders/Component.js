/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the
 *   ZUI5_GWSAMPLE_BASIC OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/ui/core/Messaging",
	"sap/ui/core/UIComponent",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/MessageScope"
], function (Messaging, UIComponent, MessageType, XMLView, JSONModel, MessageScope) {
	"use strict";
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
		}];

	return UIComponent.extend("sap.ui.core.internal.samples.odata.v2.SalesOrders.Component", {
		constructor : function(mParameters) {
			var sInlineCreationRows =
					new URLSearchParams(window.location.search).get("inlineCreationRows");

			UIComponent.apply(this, arguments);
			if (sInlineCreationRows) { // overwrite component configuration if URL parameter is used
				this.setInlineCreationRows(parseInt(sInlineCreationRows) || 0);
			}

			this.setModel(new JSONModel({
				inlineCreationRows : this.getInlineCreationRows(),
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
			this.setModel(Messaging.getMessageModel(), "messages");
		},

		metadata : {
			interfaces : ["sap.ui.core.IAsyncContentCreation"],
			manifest : "json",
			properties : {
				inlineCreationRows : {type : "int", defaultValue : 0}
			},
			version : "1.0"
		},

		createContent : function () {
			const oModel = this.getModel();
			return oModel.ready.then(() => { // only create view when component model's mock data is loaded
				oModel.setDeferredGroups(["changes", "FixQuantity"]);
				oModel.setMessageScope(MessageScope.BusinessObject);
				return XMLView.create({
					viewName : "sap.ui.core.internal.samples.odata.v2.SalesOrders.Main"
				});
			});
		},

		exit : function () {
			this.getModel().restoreSandbox();
		}
	});
});
