/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/core/Messaging",
	"sap/ui/core/UIComponent"
], function (MessageBox, Controller, Messaging, UIComponent) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.Draft.ListReport", {
		hasPendingChanges : function (vBindingOrContext, sVerb, bIgnoreKeptAlive) {
			if (vBindingOrContext.hasPendingChanges(bIgnoreKeptAlive)) {
				MessageBox.error(
					"There are unsaved changes which will be lost; save or reset changes before "
					+ sVerb);

				return true;
			}
			return false;
		},

		onInit : function () {
			var oRouter = UIComponent.getRouterFor(this);

			this.initMessagePopover("showMessages");
			this.getView().setModel(Messaging.getMessageModel(),
				"messages");
			oRouter.getRoute("objectPage").attachPatternMatched(this.onPatternMatched, this);
			oRouter.getRoute("objectPageNoList").attachPatternMatched(this.onPatternMatched, this);

			// The view does not have the default model yet, so wait for it
			this.getView().attachModelContextChange(this.onModelContextChange, this);
		},

		onModelContextChange : function () {
			var oProductsTable = this.byId("Products"),
				oListBinding = oProductsTable.getBinding("items");

			this.getView().setModel(this.getView().getModel(), "headerContext");
			this.byId("productsTitle").setBindingContext(
				oListBinding.getHeaderContext(),
				"headerContext");
		},

		onPatternMatched : function (oEvent) {
			var sPath = "/Products" + oEvent.getParameter("arguments").key,
				oTable = this.byId("Products"),
				oSelectedItem = oTable.getItems().find(function (oItem) {
					return oItem.getBindingContext().getPath() === sPath;
				});

			if (oSelectedItem) {
				oTable.setSelectedItem(oSelectedItem);
			}
		},

		onProductSelect : function (oEvent) {
			var oContext = oEvent.getParameters().listItem.getBindingContext(),
				sPath = oContext.getPath(),
				sKey = sPath.slice(sPath.lastIndexOf("("));

			UIComponent.getRouterFor(this).navTo("objectPage", {key : sKey});
		}
	});
});
