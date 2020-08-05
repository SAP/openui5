sap.ui.define([
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/m/library'
	], function(Fragment, Controller, mLibrary) {
	"use strict";

	return Controller.extend("sap.m.sample.ViewSettingsDialogCustomFilterDetails.C", {

		_getDialog : function () {
			if (!this._oDialog) {
				return Fragment.load({
					type: "XML",
					name: "sap.m.sample.ViewSettingsDialogCustomFilterDetails.Dialog",
					controller: this
				});
			} else {
				return this._oDialog;
			}
		},
		handleOpenDialogSearchContains: function () {
			var oDialogFragment = this._getDialog();

			if (oDialogFragment instanceof Promise) {
				oDialogFragment.then(function(oDialog) {
					this.getView().addDependent(this._oPopover);
					oDialog
						.setFilterSearchCallback(null)
						.setFilterSearchOperator(mLibrary.StringFilterOperator.Contains)
						.open();
				}.bind(this));
			} else {
				oDialogFragment
					.setFilterSearchCallback(null)
					.setFilterSearchOperator(mLibrary.StringFilterOperator.Contains)
					.open();
			}
		},
		handleOpenDialogCustomSearch: function() {
			var oDialogFragment = this._getDialog();

			if (oDialogFragment instanceof Promise) {
				oDialogFragment.then(function(oDialog) {
					this.getView().addDependent(this._oPopover);
					oDialog
						.setFilterSearchCallback(this.caseSensitiveStringContains)
						.open();
				}.bind(this));
			} else {
				oDialogFragment
					.setFilterSearchCallback(this.caseSensitiveStringContains)
					.open();
			}
		},
		handleOpenDialogSearchWordsStartWith: function() {
			var oDialogFragment = this._getDialog();

			if (oDialogFragment instanceof Promise) {
				oDialogFragment.then(function(oDialog) {
					this.getView().addDependent(this._oPopover);
					oDialog
						.setFilterSearchCallback(null)
						.setFilterSearchOperator(mLibrary.StringFilterOperator.AnyWordStartsWith)
						.open();
				}.bind(this));
			} else {
				oDialogFragment
					.setFilterSearchCallback(null)
					.setFilterSearchOperator(mLibrary.StringFilterOperator.AnyWordStartsWith)
					.open();
			}
		},
		caseSensitiveStringContains: function (sQuery, sItemText) {
			return sItemText.indexOf(sQuery) > -1;
		}
	});

});
