/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter"
], function (MessageToast, Messaging, Message, MessageType, Controller, Filter, FilterOperator,
		JSONModel, Sorter) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.CreateInline.Main", {
		onInit : function () {
			this.oUIModel = new JSONModel({
				bDescending : undefined
			});
			this.getView().setModel(this.oUIModel, "ui");
		},

		_getActivateMessage : function (oContext) {
			const sTarget = oContext.getPath() + "/BuyerID";

			return Messaging.getMessageModel().getData().find(function (oMessage) {
				return oMessage.getTargets().includes(sTarget);
			});
		},

		onBeforeRendering : function () {
			const oBinding = this.byId("salesOrderList").getBinding("items");

			// Guard against duplicate initialization: skip re-attaching the listeners and
			// re-creating the inactive row if the view re-renders. This is a best practice; a
			// re-render does not actually occur in this sample app, but the guard is required for
			// controllers whose view can re-render.
			if (!this._isFirstRow(oBinding)) {
				return;
			}

			this.byId("salesOrdersTitle").setBindingContext(oBinding.getHeaderContext());
			oBinding.attachCreateActivate(this.onActivate, this);
			oBinding.attachEventOnce("dataReceived", function (oEvent) {
				this._createInactiveRow(oEvent.getSource());
			}, this);
		},

		_isFirstRow : function (oBinding) {
			return oBinding.isFirstCreateAtEnd() === undefined;
		},

		_createInactiveRow : function (oBinding) {
			const oContext = oBinding.create(
				{CurrencyCode : "EUR"},
				/*bSkipRefresh*/ true,
				/*bAtEnd*/ !this._isFirstRow(oBinding),
				/*bInactive*/ true
			);

			oContext.created().then(function () {
				MessageToast.show("Sales Order " + oContext.getProperty("SalesOrderID")
					+ " created");
			}, function (oError) {
				if (!oError.canceled) {
					throw oError; // unexpected error
				}
			});
		},

		onActivate : function (oEvent) {
			const oContext = oEvent.getParameter("context");
			const sBuyerID = oContext.getProperty("BuyerID");
			let oMessage = this._getActivateMessage(oContext);

			if (oContext.isInactive() === true) {
				this._createInactiveRow(oEvent.getSource());
			}

			if (!sBuyerID) {
				oEvent.preventDefault();
				if (!oMessage) {
					oMessage = new Message({
						message : "Buyer ID must not be empty",
						type : MessageType.Error,
						technical : true,
						processor : oContext.getModel(),
						target : oContext.getPath() + "/BuyerID"
					});
					Messaging.addMessages(oMessage);
				}
			} else if (oMessage) {
				Messaging.removeMessages(oMessage);
			}
		},

		onRefresh : function () {
			this.byId("salesOrderList").getBinding("items").refresh();
		},

		onFilter : function (oEvent) {
			const sQuery = oEvent.getParameter("query");
			const oBinding = this.byId("salesOrderList").getBinding("items");

			oBinding.filter(sQuery ? [new Filter("BuyerID", FilterOperator.EQ, sQuery)] : []);
		},

		onDelete : function (oEvent) {
			const oContext = oEvent.getSource().getBindingContext();
			const oMessage = this._getActivateMessage(oContext);

			if (oMessage) {
				Messaging.removeMessages(oMessage);
			}
			oContext.delete();
		},

		onSort : function () {
			const oBinding = this.byId("salesOrderList").getBinding("items");
			let bDescending = this.oUIModel.getProperty("/bDescending");

			if (bDescending === undefined) {
				bDescending = false;
			} else if (!bDescending) {
				bDescending = true;
			} else {
				bDescending = undefined;
			}
			this.oUIModel.setProperty("/bDescending", bDescending);
			oBinding.sort(
				bDescending !== undefined ? new Sorter("SalesOrderID", bDescending) : undefined
			);
		},

		onExit : function () {
			if (this.oUIModel) {
				this.oUIModel.destroy();
			}
		}
	});
});
