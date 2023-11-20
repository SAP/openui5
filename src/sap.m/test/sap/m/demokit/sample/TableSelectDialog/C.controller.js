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

		formatter: Formatter,

		handleTableSelectDialogPress: function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView();

			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.TableSelectDialog.Dialog",
					controller: this
				}).then(function(oDialog){
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			this._pDialog.then(function(oDialog){
				this._configDialog(oButton, oDialog);
				oDialog.open();
			}.bind(this));
		},

		_configDialog: function (oButton, oDialog) {
			// Set draggable property
			var bDraggable = oButton.data("draggable");
			oDialog.setDraggable(bDraggable == "true");

			// Set resizable property
			var bResizable = oButton.data("resizable");
			oDialog.setResizable(bResizable == "true");

			// Multi-select if required
			var bMultiSelect = !!oButton.data("multi");
			oDialog.setMultiSelect(bMultiSelect);

			// Remember selections if required
			var bRemember = !!oButton.data("remember");
			oDialog.setRememberSelections(bRemember);

			var sResponsivePadding = oButton.data("responsivePadding");
			var sResponsiveStyleClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";

			if (sResponsivePadding) {
				oDialog.addStyleClass(sResponsiveStyleClasses);
			} else {
				oDialog.removeStyleClass(sResponsiveStyleClasses);
			}

			// Set custom text for the confirmation button
			var sCustomConfirmButtonText = oButton.data("confirmButtonText");
			oDialog.setConfirmButtonText(sCustomConfirmButtonText);

			// toggle compact style
			syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
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
			var oView = this.getView();

			if (!this._pValueHelpDialog) {
				this._pValueHelpDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.TableSelectDialog.ValueHelp",
					controller: this
				}).then(function (oValueHelpDialog) {
					oView.addDependent(oValueHelpDialog);
					return oValueHelpDialog;
				});
			}
			this._pValueHelpDialog.then(function(oValueHelpDialog) {
				this._configValueHelpDialog();
				oValueHelpDialog.open();
			}.bind(this));
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

		handleValueHelpClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem"),
			oInput = this.byId("productInput");

			if (!oSelectedItem) {
				oInput.resetProperty("value");
				return;
			}

			oInput.setValue(oSelectedItem.getCells()[0].getTitle());
		}

	});
});