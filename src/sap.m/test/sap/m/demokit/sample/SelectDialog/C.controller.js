sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/core/syncStyleClass",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"
], function (Controller, Fragment, syncStyleClass, JSONModel, Filter, FilterOperator, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.SelectDialog.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		onSelectDialogPress: function (oEvent) {
			var oButton = oEvent.getSource();

			if (!this._oDialog) {
				Fragment.load({
					name: "sap.m.sample.SelectDialog.Dialog",
					controller: this
				}).then(function (oDialog){
					this._oDialog = oDialog;
					this._oDialog.setModel(this.getView().getModel());
					// this.getView().addDependent(this._oDialog);
					this._configDialog(oButton);
					this._oDialog.open();
				}.bind(this));
			} else {
				this._configDialog(oButton);
				this._oDialog.open();
			}
		},

		_configDialog: function (oButton) {
			// Multi-select if required
			var bMultiSelect = !!oButton.data("multi");
			this._oDialog.setMultiSelect(bMultiSelect);

			var sCustomConfirmButtonText = oButton.data("confirmButtonText");
			this._oDialog.setConfirmButtonText(sCustomConfirmButtonText);

			// Remember selections if required
			var bRemember = !!oButton.data("remember");
			this._oDialog.setRememberSelections(bRemember);

			//add Clear button if needed
			var bShowClearButton = !!oButton.data("showClearButton");
			this._oDialog.setShowClearButton(bShowClearButton);

			// Set growing property
			var bGrowing = oButton.data("growing");
			this._oDialog.setGrowing(bGrowing == "true");

			// Set growing threshold
			var sGrowingThreshold = oButton.data("threshold");
			if (sGrowingThreshold) {
				this._oDialog.setGrowingThreshold(parseInt(sGrowingThreshold));
			}

			// Set draggable property
			var bDraggable = !!oButton.data("draggable");
			this._oDialog.setDraggable(bDraggable);

			// Set draggable property
			var bResizable = !!oButton.data("resizable");
			this._oDialog.setResizable(bResizable);

			// Set style classes
			var sResponsiveStyleClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";
			var bResponsivePadding = !!oButton.data("responsivePadding");
			this._oDialog.toggleStyleClass(sResponsiveStyleClasses, bResponsivePadding);

			// clear the old search filter
			this._oDialog.getBinding("items").filter([]);

			// toggle compact style
			syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
		},

		onSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		},

		onDialogClose: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				MessageToast.show("You have chosen " + aContexts.map(function (oContext) { return oContext.getObject().Name; }).join(", "));
			} else {
				MessageToast.show("No new item was selected.");
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		onValueHelpRequest: function () {
			if (!this._oValueHelpDialog) {
				Fragment.load({
					name: "sap.m.sample.SelectDialog.ValueHelpDialog",
					controller: this
				}).then(function (oValueHelpDialog){
					this._oValueHelpDialog = oValueHelpDialog;
					this.getView().addDependent(this._oValueHelpDialog);
					this._configValueHelpDialog();
					this._oValueHelpDialog.open();
				}.bind(this));
			} else {
				this._configValueHelpDialog();
				this._oValueHelpDialog.open();
			}
		},

		_configValueHelpDialog: function () {
			var sInputValue = this.byId("productInput").getValue(),
				oModel = this.getView().getModel(),
				aProducts = oModel.getProperty("/ProductCollection");

			aProducts.forEach(function (oProduct) {
				oProduct.selected = (oProduct.Name === sInputValue);
			});
			oModel.setProperty("/ProductCollection", aProducts);
		},

		onValueHelpDialogClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem"),
				oInput = this.byId("productInput");

			if (!oSelectedItem) {
				oInput.resetProperty("value");
				return;
			}

			oInput.setValue(oSelectedItem.getTitle());
		}

	});
});