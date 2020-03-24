/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/security/encodeURL",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/ODataUtils"
], function (encodeURL, MessageBox, MessageToast, Core, Element, Controller, Filter, FilterOperator,
		ODataUtils) {
	"use strict";

	return Controller.extend("sap.ui.core.internal.samples.odata.v2.SalesOrders.Main", {
		defaultErrorHandler : function (oError) {
			var sCode = "unknown",
				oErrorDetails,
				sMessage = "unknown";

			try {
				oErrorDetails = JSON.parse(oError.responseText);
				sCode = oErrorDetails.error.code;
				sMessage = oErrorDetails.error.message.value;
			} catch (error) {/*ignore errors while parsing the response*/}
			MessageBox.error("Service request failed: " + sMessage + " (" + sCode + ").");
		},

		onCloseProductDetails : function () {
			this.byId("productDetailsDialog").close();
		},

		onFixAllQuantities : function (oEvent) {
			var oView = this.getView(),
				oModel = oView.getModel(),
				sSalesOrderID = oEvent.getSource().getBindingContext().getProperty("SalesOrderID");

			oModel.callFunction("/SalesOrderItem_FixAllQuantities", {
				error : this.defaultErrorHandler,
				groupId : "FixQuantity",
				method : "POST",
				success : function () {
					MessageToast.show("Successfully fixed all quantities for sales order "
						+ sSalesOrderID);
				},
				urlParameters : {
					SalesOrderID : encodeURL(sSalesOrderID)
				}
			});
			// read requests for side-effects
			// use refresh instead of ODataModel#read to read only items needed by the table
			oView.byId("ToLineItems").getBinding("rows").refresh(undefined, "FixQuantity");
			this.readSalesOrder("FixQuantity");

			oModel.submitChanges({
				error : this.defaultErrorHandler,
				groupId : "FixQuantity"
			});
		},

		onFixQuantity : function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext(),
				sItemPosition = oBindingContext.getProperty("ItemPosition"),
				oModel = this.getView().getModel(),
				sSalesOrderID = oBindingContext.getProperty("SalesOrderID");

			oModel.callFunction("/SalesOrderItem_FixQuantity", {
				error : this.defaultErrorHandler,
				groupId : "FixQuantity",
				method : "POST",
				refreshAfterChange : false,
				success : function () {
					MessageToast.show("Successfully fixed the quantity for item " + sItemPosition);
				},
				urlParameters : {
					ItemPosition : encodeURL(sItemPosition),
					SalesOrderID : encodeURL(sSalesOrderID)
				}
			});
			// read requests for side-effects
			this.readSalesOrder("FixQuantity");

			oModel.submitChanges({
				error : this.defaultErrorHandler,
				groupId : "FixQuantity"
			});
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

		onMessagePopoverClosed : function () {
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
			if (!oEvent.getParameter("success")) {
				this.defaultErrorHandler(oEvent.getParameter("response"));
			}
		},

		onResetChanges : function () {
			this.getView().getModel().resetChanges();
		},

		onSaveSalesOrder : function () {
			var oView = this.getView(),
				sSalesOrder = oView.getModel("ui").getProperty("/salesOrderID");

			// ensure that the read request is in the same batch
			this.readSalesOrder("changes");
			oView.getModel().submitChanges({
				error : this.defaultErrorHandler,
				success : function () {
					MessageToast.show("Successfully saved the sales order '" + sSalesOrder + "'");
				}
			});
		},

		onSelectSalesOrder : function () {
			var oView = this.getView(),
				sSalesOrder = ODataUtils.formatValue(
					encodeURL(oView.getModel("ui").getProperty("/salesOrderID")), "Edm.String"),
				sContextPath = "/SalesOrderSet(" +  sSalesOrder + ")";

			// do unbind first to ensure that the sales order is read again even if sales order ID
			// did not change
			oView.byId("objectPage").unbindElement();
			oView.byId("objectPage").bindElement(sContextPath);
			oView.byId("messagePopover").getBinding("items")
				.filter(new Filter("fullTarget", FilterOperator.StartsWith, sContextPath));
		},

		onShowProductDetails : function (oEvent) {
			var oDialog = this.byId("productDetailsDialog");

			oDialog.setBindingContext(oEvent.getParameter("row").getBindingContext());
			oDialog.open();
		},

		onTransitionMessagesOnly : function (oEvent) {
			var oView = this.getView();

			// first unbind element to ensure request order; header data need to be read before
			// item data to show different behaviour based on transitionMessagesOnly
			oView.byId("objectPage").unbindElement();
			oView.byId("ToLineItems").bindRows({
				parameters : {
					transitionMessagesOnly : oEvent.getSource().getPressed()
				},
				path : "ToLineItems"
			});
			this.onSelectSalesOrder();
		},

		readSalesOrder : function (sGroupId) {
			var oView = this.getView();

			oView.getModel().read("", {
				context : oView.byId("objectPage").getBindingContext(),
				groupId : sGroupId,
				updateAggregatedMessages : true,
				urlParameters : {
					// key property and properties that might be affected by side effects
					$select : ["ChangedAt", "GrossAmount", "SalesOrderID"]
				}
			});
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
		},

		updateMessageCount : function () {
			var oView = this.getView(),
				oMessagePopoverBinding = oView.byId("messagePopover").getBinding("items");

			oView.getModel("ui").setProperty("/messageCount", oMessagePopoverBinding.getLength());
		}
	});
});