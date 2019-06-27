sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/Filter',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, Fragment, Controller, Filter, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.SelectDialog.C", {

		onInit : function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		onExit : function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		handleSelectDialogPress: function (oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("sap.m.sample.SelectDialog.Dialog", this);
				this._oDialog.setModel(this.getView().getModel());
			}

			// Multi-select if required
			var bMultiSelect = !!oEvent.getSource().data("multi");
			this._oDialog.setMultiSelect(bMultiSelect);

			var sCustomConfirmButtonText = oEvent.getSource().data("confirmButtonText");
			this._oDialog.setConfirmButtonText(sCustomConfirmButtonText);

			// Remember selections if required
			var bRemember = !!oEvent.getSource().data("remember");
			this._oDialog.setRememberSelections(bRemember);

			//add Clear button if needed
			var bShowClearButton = !!oEvent.getSource().data("showClearButton");
			this._oDialog.setShowClearButton(bShowClearButton);

			// Set growing property
			var bGrowing = oEvent.getSource().data("growing");
			this._oDialog.setGrowing(bGrowing == "true");

			// Set growing threshold
			var sGrowingThreshold = oEvent.getSource().data("threshold");
			if (sGrowingThreshold) {
				this._oDialog.setGrowingThreshold(parseInt(sGrowingThreshold));
			}

			// clear the old search filter
			this._oDialog.getBinding("items").filter([]);

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		handleSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Name", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		handleClose: function(oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				MessageToast.show("You have chosen " + aContexts.map(function(oContext) { return oContext.getObject().Name; }).join(", "));
			} else {
				MessageToast.show("No new item was selected.");
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		handleValueHelp : function() {
			var sInputValue = this.byId("productInput").getValue(),
				oModel = this.getView().getModel(),
				aProducts = oModel.getProperty("/ProductCollection");

			if (!this._oValueHelpDialog) {
				this._oValueHelpDialog = sap.ui.xmlfragment("sap.m.sample.SelectDialog.ValueHelp",this);
				this.getView().addDependent(this._oValueHelpDialog);
			}

			aProducts.forEach(function (oProduct) {
				oProduct.selected = (oProduct.Name === sInputValue);
			});
			oModel.setProperty("/ProductCollection", aProducts);

			this._oValueHelpDialog.open();
		},

		handleValueHelpClose : function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem"),
				oInput = this.byId("productInput");

			if (oSelectedItem) {
				this.byId("productInput").setValue(oSelectedItem.getTitle());
			}

			if (!oSelectedItem) {
				oInput.resetProperty("value");
			}
		}
	});

	return CController;

});