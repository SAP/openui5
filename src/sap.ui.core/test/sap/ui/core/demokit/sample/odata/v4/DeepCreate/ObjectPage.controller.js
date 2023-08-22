/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/Messaging",
	"sap/ui/core/UIComponent",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/sample/common/Controller"
], function (MessageToast, Messaging, UIComponent, UI5Date, Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.DeepCreate.ObjectPage", {
		navTo : function (oContext) {
			UIComponent.getRouterFor(this)
				.navTo("objectPage", {id : oContext.getProperty("SalesOrderID")}, true);
		},

		newLineItem : function () {
			var oDeliveryDate = UI5Date.getInstance(),
				oType = this.getView().getModel().getMetaModel()
					.getUI5Type("/SalesOrderList/SO_2_SOITEM/DeliveryDate");

			oDeliveryDate.setFullYear(oDeliveryDate.getFullYear() + 1);

			return {
				CurrencyCode : "EUR",
				DeliveryDate : oType.getModelValue(oDeliveryDate),
				GrossAmount : "42.0",
				ProductID : "HT-1000",
				Quantity : "2.000",
				QuantityUnit : "EA"
			};
		},

		onCreateLineItem : function () {
			this.byId("SO_2_SOITEM").getBinding("items")
				.create(this.newLineItem("manual created note")).created()
					.catch(function (oError) {
						if (!oError.canceled) {
							throw oError; // unexpected error
						}
					});
		},

		onDeleteLineItem : function () {
			var aItems = this.byId("SO_2_SOITEM").getSelectedItems();

			if (!aItems.length) {
				MessageToast.show("nothing selected");
				return;
			}
			aItems.forEach(function (oItem) {
				oItem.getBindingContext().delete().catch(function (oError) {
					if (!oError.canceled) {
						// error was already reported to message model
					}
				});
			});
		},

		onInit : function () {
			var oRouter = UIComponent.getRouterFor(this);

			this.initMessagePopover("showMessages");
			this.getView().setModel(Messaging.getMessageModel(),
				"messages");
			oRouter.getRoute("create").attachPatternMatched(this.onPatternMatched, this);
			oRouter.getRoute("objectPage").attachPatternMatched(this.onPatternMatched, this);
		},

		onPatternMatched : function (oEvent) {
			var oContext,
				sPath = "/SalesOrderList('" + oEvent.getParameter("arguments").id + "')",
				oView = this.getView();

			oContext = oView.getBindingContext();
			if (oContext && !oContext.isTransient()) {
				oContext.setKeepAlive(false);
			}
			if (oEvent.getParameter("name") === "create") {
				oContext = this.getView().getModel("ui").getProperty("/oContext");
				if (!oContext) {
					UIComponent.getRouterFor(this).navTo("listReport");
					return;
				}
				this.getView().getModel("ui").setProperty("/oContext", null);
				oView.setBindingContext(oContext);
			} else {
				oContext = oView.getModel().getKeepAliveContext(sPath, /*bRequestMessages*/ true,
					{$$patchWithoutSideEffects : true});
				oView.setBindingContext(oContext);
				oView.setBusy(true);
				oContext.requestProperty("SalesOrderID").catch(function () {
					// ignore; it's logged anyway
				}).finally(function () {
					oView.setBusy(false);
				});
			}
			this.getView().setModel(this.getView().getModel(), "headerContext");
			this.byId("lineItemsTitle").setBindingContext(
				this.byId("SO_2_SOITEM").getBinding("items").getHeaderContext(),
				"headerContext");
		},

		onResetChanges : function () {
			var oModel = this.getView().getModel();

			oModel.resetChanges(oModel.getUpdateGroupId());
		},

		onSave : function () {
			var oContext = this.getView().getBindingContext(),
				oModel = this.getView().getModel();

			if (!oContext.isTransient()) {
				oContext.requestSideEffects(["GrossAmount", "Messages"])
					.catch(function () { /*may fail because of previous request*/ });
			}

			oModel.submitBatch(oModel.getUpdateGroupId());
		}
	});
});
