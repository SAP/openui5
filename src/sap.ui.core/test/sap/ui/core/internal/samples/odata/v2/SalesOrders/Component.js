/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the
 *   ZUI5_GWSAMPLE_BASIC OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/MessageScope"
], function (UIComponent, JSONModel, MessageScope) {
	"use strict";

	return UIComponent.extend("sap.ui.core.internal.samples.odata.v2.SalesOrders.Component", {
		metadata : {
			manifest : "json"
		},

		init: function () {
			var oModel;

			UIComponent.prototype.init.apply(this, arguments);

			oModel = this.getModel();
			oModel.setDeferredGroups(["changes", "FixQuantity"]);
			oModel.setMessageScope(MessageScope.BusinessObject);

			this.setModel(new JSONModel({
				messageCount : 0,
				salesOrderID : "0500000005"
			}), "ui");
			this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "messageModel");
		}
	});
});
