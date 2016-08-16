sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller'
	], function(jQuery, Fragment, Controller) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.ViewSettingsDialogCustomFilterDetails.C", {

		_getDialog : function () {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("sap.m.sample.ViewSettingsDialogCustomFilterDetails.Dialog", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},
		handleOpenDialogSearchContains: function () {
			this._getDialog()
				.setFilterSearchCallback(null)
				.setFilterSearchOperator(sap.m.StringFilterOperator.Contains)
				.open();
		},
		handleOpenDialogCustomSearch: function() {
			this._getDialog()
				.setFilterSearchCallback(this.caseSensitiveStringContains)
				.open();
		},
		handleOpenDialogSearchWordsStartWith: function() {
			this._getDialog()
				.setFilterSearchCallback(null)
				.setFilterSearchOperator(sap.m.StringFilterOperator.AnyWordStartsWith)
				.open();
		},
		caseSensitiveStringContains: function (sQuery, sItemText) {
			return sItemText.indexOf(sQuery) > -1;
		}
	});


	return CController;
});
