sap.ui.define([
	'sap/m/MessageToast',
	'./Formatter',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/syncStyleClass"
], function (MessageToast, Formatter, Fragment, Controller, Filter, FilterOperator, JSONModel, syncStyleClass) {
	"use strict";

	return Controller.extend("sap.m.sample.TableSelectDialog.C", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		onExit: function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		formatter: Formatter,

		handleTableSelectDialogPress: function (oEvent) {
			var oButton = oEvent.getSource();
			if (!this._oDialog) {
				Fragment.load({
					name: "sap.m.sample.TableSelectDialog.Dialog",
					controller: this
				}).then(function (oDialog) {
					this._oDialog = oDialog;
					this._configDialog(oButton);
					this._oDialog.open();
				}.bind(this));
			} else {
				this._configDialog(oButton);
				this._oDialog.open();
			}
		},

		_configDialog: function (oButton) {
			// Set draggable property
			var bDraggable = oButton.data("draggable");
			this._oDialog.setDraggable(bDraggable == "true");

			// Set resizable property
			var bResizable = oButton.data("resizable");
			this._oDialog.setResizable(bResizable == "true");

			// Multi-select if required
			var bMultiSelect = !!oButton.data("multi");
			this._oDialog.setMultiSelect(bMultiSelect);

			// Remember selections if required
			var bRemember = !!oButton.data("remember");
			this._oDialog.setRememberSelections(bRemember);

			var sResponsivePadding = oButton.data("responsivePadding");
			var sResponsiveStyleClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";

			if (sResponsivePadding) {
				this._oDialog.addStyleClass(sResponsiveStyleClasses);
			} else {
				this._oDialog.removeStyleClass(sResponsiveStyleClasses);
			}

			// Set custom text for the confirmation button
			var sCustomConfirmButtonText = oButton.data("confirmButtonText");
			this._oDialog.setConfirmButtonText(sCustomConfirmButtonText);

			this.getView().addDependent(this._oDialog);

			// toggle compact style
			syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
		},

		handleSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		handleClose: function (oEvent) {
			// reset the filter
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);

			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				MessageToast.show("You have chosen " + aContexts.map(function (oContext) { return oContext.getObject().Name; }).join(", "));
			}

		},

		handleValueHelp: function () {
			if (!this._oValueHelpDialog) {
				Fragment.load({
					name: "sap.m.sample.TableSelectDialog.ValueHelp",
					controller: this
				}).then(function (oValueHelpDialog) {
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

		handleValueHelpClose: function () {
			var oModel = this.getView().getModel(),
				aProducts = oModel.getProperty("/ProductCollection"),
				oInput = this.byId("productInput");

			var bHasSelected = aProducts.some(function (oProduct) {
				if (oProduct.selected) {
					oInput.setValue(oProduct.Name);
					return true;
				}
			});

			if (!bHasSelected) {
				oInput.setValue(null);
			}
		}

	});
});