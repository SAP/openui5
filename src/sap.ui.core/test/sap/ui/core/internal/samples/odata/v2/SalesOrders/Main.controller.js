/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/core/mvc/Controller"
], function (Core, Element, Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.internal.samples.odata.v2.SalesOrders.Main", {
		onInit : function () {
			var oView = this.getView();

			oView.setModel(Core.getMessageManager().getMessageModel(), "messages");
			oView.getModel().attachRequestCompleted(this.onRequestComplete.bind(this));
		},

		onMessagePopoverClosed : function (oEvent) {
			var aMessages = this.getView().getModel("messages").getObject("/");

			Core.getMessageManager().removeMessages(aMessages.filter(function (oMessage) {
				return oMessage.technical || oMessage.persistent;
			}));
		},

		onMessagePopoverPress : function (oEvent) {
			this.getView().byId("messagePopover").toggle(oEvent.getSource());
		},

		onMessageSelected : function (oEvent) {
			var oMessage = oEvent.getParameter("item").getBindingContext("messages").getObject(),
				oControl = Element.registry.get(oMessage.getControlId());

			if (oControl) {
				this.getView().byId("page").scrollToElement(oControl.getDomRef(), 200, [0, -100]);
				setTimeout(function(){
					oControl.focus();
				}, 300);
			}
		},

		onRequestComplete : function (oEvent) {
			var oView = this.getView();

			if (!oEvent.getParameter("success")) {
				oView.byId("messagePopover").toggle(oView.byId("messagePopoverButton"));
			}
		},

		onResetChanges : function () {
			this.getView().getModel().resetChanges();
		},

		onSaveSalesOrder : function () {
			this.getView().getModel().submitChanges();
		},

		onSelectSalesOrder : function () {
			var oView = this.getView(),
				sSalesOrder = oView.getModel("ui").getProperty("/salesOrderID");

			oView.byId("objectPage").bindElement("/SalesOrderSet('" + sSalesOrder + "')");
		}
	});
});