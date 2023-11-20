sap.ui.define([
		'patternApp/model/Pattern',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/routing/HashChanger',
		'sap/ui/core/routing/Router',
		'sap/ui/model/Filter',
		'sap/ui/model/FilterOperator'
	], function(Pattern, Fragment, Controller, HashChanger, Router, Filter, FilterOperator) {
	"use strict";

	var PatternTableController = Controller.extend("patternApp.controller.PatternTable", {

		onInit : function () {
			var oRouter = new Router();
			this._oModel = new Pattern(oRouter);

			this.getView().setModel(this._oModel);
			oRouter.initialize();
		},

		onSetHash : function () {
			var sNewHash = this.byId("hash").getValue();

			// Don't reset the list if the hash is the same
			if (sNewHash === this._sHash) {
				return;
			}

			this._oModel.resetMatched();
			this._sHash = sNewHash;

			// Call replace hash here since setHash add history entries.
			HashChanger.getInstance().replaceHash(sNewHash);
		},

		onAddPattern : function () {
			this._oModel.addPattern(this.byId("pattern").getValue());
		},

		handleValueHelp : function () {
			var oView = this.getView();

			// create value help dialog
			if (!this._pValueHelpDialog) {
				this._pValueHelpDialog = Fragment.load({
					name: "patternApp.view.Dialog",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			// open value help dialog
			this._pValueHelpDialog.then(function (oDialog) {
				oDialog.open();
			});
		},

		handleValueHelpSearch : function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("pattern", FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		handleValueHelpClose : function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var oPatternInput = this.byId("hash");
				oPatternInput.setValue(oSelectedItem.getTitle());
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		formatMatched : function (bValue) {
			if (bValue) {
				// Green color for matched patterns
				return "Success";
			}

			// Red color for unmatched ones
			return "Error";
		},

		formatHash : function (sValue) {
			if (!sValue) {
				return "empty";
			}

			return sValue;
		}

	});

	return PatternTableController;

});
