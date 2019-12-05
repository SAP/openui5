sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/Filter',
		'sap/ui/model/FilterOperator',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, Fragment, Controller, Filter, FilterOperator, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.SelectDialog.controller.SelectDialog", {

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
			var oButton = oEvent.getSource();
			if (!this._oDialog) {
				Fragment.load({
					name: "sap.m.sample.SelectDialog.view.Dialog",
					controller: this
				}).then(function(oDialog){
					this._oDialog = oDialog;
					this._oDialog.setModel(this.getView().getModel());
					this._configDialog(oButton);
					this._oDialog.open();
				}.bind(this));
			} else {
				this._configDialog(oButton);
				this._oDialog.open();
			}
		},

		_configDialog: function(oButton) {
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
			var bDraggable = oButton.data("draggable");
			this._oDialog.setDraggable(bDraggable == "true");

			// Set draggable property
			var bResizable = oButton.data("resizable");
			this._oDialog.setResizable(bResizable == "true");

			// Set style classes
			var sResponsiveStyleClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";
			var sResponsivePadding = oButton.data("responsivePadding");
			if (sResponsivePadding) {
				this._oDialog.addStyleClass(sResponsiveStyleClasses);
			} else {
				this._oDialog.removeStyleClass(sResponsiveStyleClasses);
			}

			// clear the old search filter
			this._oDialog.getBinding("items").filter([]);

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
		},

		handleSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
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

		handleValueHelp: function() {
			if (!this._oValueHelpDialog) {
				Fragment.load({
					name: "sap.m.sample.SelectDialog.view.ValueHelp",
					controller: this
				}).then(function(oValueHelpDialog){
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

		_configValueHelpDialog: function() {
			var sInputValue = this.byId("productInput").getValue(),
				oModel = this.getView().getModel(),
				aProducts = oModel.getProperty("/ProductCollection");

			aProducts.forEach(function (oProduct) {
				oProduct.selected = (oProduct.Name === sInputValue);
			});
			oModel.setProperty("/ProductCollection", aProducts);
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
});