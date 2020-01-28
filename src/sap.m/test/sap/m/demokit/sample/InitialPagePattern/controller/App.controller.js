sap.ui.define([
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel'
], function(
	Fragment,
	Controller,
	Filter,
	FilterOperator,
	JSONModel,
	ResourceModel
) {
	'use strict';

	return Controller.extend('sap.m.sample.InitialPagePattern.controller.App', {

		onInit: function () {
			var oView = this.getView();

			this._oModel = new JSONModel("./test-resources/sap/m/demokit/sample/InitialPagePattern/model/Purchases.json");
			// the default limit of the model is set to 100. We want to show all the entries.
			this._oModel.setSizeLimit(1000000);
			oView.setModel(this._oModel);

			// set i18n model on view
			var i18nModel = new ResourceModel({
				bundleName: "sap.m.sample.InitialPagePattern.i18n.i18n"
			});
			oView.setModel(i18nModel, "i18n");

			this._oPurchaseInput = this.byId("purchaseInput");

			this._oPurchaseInput.setFilterFunction(function(sValue, oItem){
				sValue.toLowerCase();
				// A case-insensitive 'string contains' filter
				return oItem.getKey().toLowerCase().indexOf(sValue) !== -1 ||
						oItem.getText().toLowerCase().indexOf(sValue) !== -1;
			});
		},

		/*********************** Public handlers **************************/

		// By UX Design, if the focus is moved out of the _oPurchaseInput, while
		// there is no input value, the "Enter ID" MessagePage should be shown.
		handleInputChange: function () {
			var bInputEmpty = this._oPurchaseInput.getValue() === "";

			if (bInputEmpty) {
				this._oModel.setProperty("/inputPopulated", !bInputEmpty);
			}
		},

		handleInputSubmit: function() {
			var sValue = this._oPurchaseInput.getValue(),
				bInputPopulated = sValue !== "";

			this._oModel.setProperty("/inputPopulated", bInputPopulated);

			if (bInputPopulated) {
				this._setSelectedPurchaseAndUpdateInput(sValue);
			}
		},

		handleInputSuggestionItemSelected: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			this._setSelectedPurchaseAndUpdateInput(oSelectedItem && oSelectedItem.getKey());
		},

		handleInputValueHelpOpen : function () {
			var sInputValue = this._oPurchaseInput.getValue();

			// create value help dialog
			if (!this._oValueHelpDialog) {
				Fragment.load({
					name: "sap.m.sample.InitialPagePattern.view.fragments.Dialog",
					controller: this
				}).then(function (oDialog) {
					this._oValueHelpDialog = oDialog;

					this.getView().addDependent(this._oValueHelpDialog);

					this._filterAndOpenValueHelpDialog(sInputValue);
				}.bind(this));
			} else {
				this._filterAndOpenValueHelpDialog(sInputValue);
			}
		},

		handleValueHelpConfirm : function (oEvent) {
			var oSelectedPurchase = oEvent.getParameter("selectedItem"), sKey;

			if (oSelectedPurchase) {
				sKey = oSelectedPurchase.getDescription();
				this._setSelectedPurchaseAndUpdateInput(sKey);
			}
		},

		handleValueHelpSearch : function (oEvent) {
			this._filterValueHelpDialog(oEvent.getParameter("value"));
		},

		/*********************** Private methods **************************/

		_filterAndOpenValueHelpDialog: function (sInputValue) {
			// create a filter for the binding
			this._filterValueHelpDialog(sInputValue);

			// open value help dialog filtered by the input value
			this._oValueHelpDialog.open(sInputValue);
		},

		_filterValueHelpDialog: function(sInputValue) {
			this._oValueHelpDialog.getBinding("items")
				.filter(this._getCombinedFilter(sInputValue));
		},

		_getCombinedFilter: function (sValue) {

			return new Filter({
				and: false,
				filters: [
					new Filter(
						"PurchaseID",
						FilterOperator.Contains, sValue
					),
					new Filter(
						"SupplierName",
						FilterOperator.Contains, sValue
					)
				]
			});
		},

		_setSelectedPurchaseAndUpdateInput: function (sKey) {
			// If purchase with the given sKey is found from the collection
			// in the model, we select it in the _oPurchaseInput and update
			// the /selectedPurchase object in the model.
			var bSuccess = this._oModel.getData().Purchases.some(function (oPurchase) {
					return oPurchase.PurchaseID === sKey &&
						this._oPurchaseInput.setSelectedKey(sKey) &&
						this._oModel.setProperty("/selectedPurchase", oPurchase);
				}, this);

			// If no purchase is found with the given sKey, we force the value
			// of the /selectedPurchase object in the model to "null".
			// Doing this, we notify the correspond fragments to show.
			if (!bSuccess) {
				this._oModel.setProperty("/selectedPurchase", null);
			}
		}
	});
}, true);