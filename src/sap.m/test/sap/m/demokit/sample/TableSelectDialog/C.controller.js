sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'./Formatter',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/Filter',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, Formatter, Fragment, Controller, Filter, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.TableSelectDialog.C", {

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

		handleTableSelectDialogPress: function(oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("sap.m.sample.TableSelectDialog.Dialog", this);
			}

			// Set draggable property
			var bDraggable = oEvent.getSource().data("draggable");
			this._oDialog.setDraggable(bDraggable == "true");

			// Set draggable property
			var bResizable = oEvent.getSource().data("resizable");
			this._oDialog.setResizable(bResizable == "true");

			// Multi-select if required
			var bMultiSelect = !!oEvent.getSource().data("multi");
			this._oDialog.setMultiSelect(bMultiSelect);

			// Remember selections if required
			var bRemember = !!oEvent.getSource().data("remember");
			this._oDialog.setRememberSelections(bRemember);

			// Set custom text for the confirmation button
			var sCustomConfirmButtonText = oEvent.getSource().data("confirmButtonText");
			this._oDialog.setConfirmButtonText(sCustomConfirmButtonText);

			this.getView().addDependent(this._oDialog);

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

			// reset the filter
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);

			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				MessageToast.show("You have chosen " + aContexts.map(function(oContext) { return oContext.getObject().Name; }).join(", "));
			}
		},

		handleValueHelp : function() {
			var sInputValue = this.byId("productInput").getValue(),
				oModel = this.getView().getModel(),
				aProducts = oModel.getProperty("/ProductCollection");

			if (!this._oValueHelpDialog) {
				this._oValueHelpDialog = sap.ui.xmlfragment(
					"sap.m.sample.TableSelectDialog.ValueHelp",
					this
				);
				this.getView().addDependent(this._oValueHelpDialog);
			}

			aProducts.forEach(function (oProduct) {
				oProduct.selected = (oProduct.Name === sInputValue);
			});
			oModel.setProperty("/ProductCollection", aProducts);

			this._oValueHelpDialog.open();
		},

		handleValueHelpClose : function() {
			var oModel = this.getView().getModel(),
				aProducts = oModel.getProperty("/ProductCollection"),
				oInput = this.byId("productInput");

			var bHasSelected = aProducts.some(function(oProduct) {
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


	return CController;

});