sap.ui.define([
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/m/library'
	], function(Fragment, Controller, mLibrary) {
	"use strict";

	return Controller.extend("sap.m.sample.ViewSettingsDialogCustomFilterDetails.C", {

		_getDialog : function () {
			var oView = this.getView();

			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.ViewSettingsDialogCustomFilterDetails.Dialog",
					controller: this
				}).then(function(oDialog){
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			return this._pDialog;
		},

		handleOpenDialogSearchContains: function () {
			this._getDialog().then(function(oDialog) {
			oDialog
				.setFilterSearchCallback(null)
				.setFilterSearchOperator(mLibrary.StringFilterOperator.Contains)
				.open();
			});
		},

		handleOpenDialogCustomSearch: function() {
			this._getDialog().then(function(oDialog) {
				oDialog
					.setFilterSearchCallback(this.caseSensitiveStringContains)
					.open();
			}.bind(this));
		},


		handleOpenDialogSearchWordsStartWith: function() {
			this._getDialog().then(function(oDialog) {
				oDialog
					.setFilterSearchCallback(null)
					.setFilterSearchOperator(mLibrary.StringFilterOperator.AnyWordStartsWith)
					.open();
			});
		},

		caseSensitiveStringContains: function (sQuery, sItemText) {
			return sItemText.indexOf(sQuery) > -1;
		}
	});

});
