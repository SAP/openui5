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
		onCloseProductDetails : function () {
			this.byId("productDetailsDialog").close();
		},

		onInit : function () {
			var oRowSettings = this.byId("rowsettings"),
				oView = this.getView();

			oView.setModel(Core.getMessageManager().getMessageModel(), "messages");
			oView.getModel().attachRequestCompleted(this.onRequestComplete.bind(this));

			// adding the formatter dynamically is a prerequisite that it is called with the control
			// as 'this'
			oRowSettings.bindProperty("highlight", {
				parts : [
					'messageModel>/',
					'' // ensure formatter is called on scrolling
				],
				formatter: this.rowHighlight
			});
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

		onShowProductDetails : function (oEvent) {
			var oDialog = this.byId("productDetailsDialog");

			oDialog.setBindingContext(oEvent.getParameter("row").getBindingContext());
			oDialog.open();
		},

		onSelectSalesOrder : function () {
			var oView = this.getView(),
				sSalesOrder = oView.getModel("ui").getProperty("/salesOrderID");

			oView.byId("objectPage").bindElement("/SalesOrderSet('" + sSalesOrder + "')");
		},

		/**
		 * Formatter for the row highlight property.
		 * The parts of the corresponding composite binding just give the point in time when to
		 * update the row highlight. The formatter function parameters for messages resp. row data
		 * are not needed to compute the highlight property.
		 *
		 * @returns {sap.ui.core.MessageType} The message type for the row highlight or undefined in
		 *   case the formatter is called when the row has no binding context yet.
		 */
		rowHighlight : function (/*aMessages, oRowData*/) {
			var aMessages,
				//formatter MUST be defined in a way that this is the control!
				oRowContext = this.getBindingContext();

			if (oRowContext) { // formatter is called with oRowContext null initially
				aMessages = oRowContext.getMessages();
				return aMessages.length ? aMessages[0].type : sap.ui.core.MessageType.None;
			}
		}
	});
});