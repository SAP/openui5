sap.ui.define([
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller'
	], function(MessageToast, Fragment, Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.ViewSettingsDialogCustom.C", {

		filterResetValue: 50,
		filterPreviousValue: 50,

		onExit : function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		handleViewSettingsDialogPress: function () {
			if (!this._oDialog) {
				Fragment.load({
					name: "sap.m.sample.ViewSettingsDialogCustom.Dialog",
					controller: this
				}).then(function(oDialog){
					this._oDialog = oDialog;
					// Set initial and reset value for Slider in custom control
					var oSlider = this._oDialog.getFilterItems()[0].getCustomControl();
					oSlider.setValue(this.filterResetValue);
					this._oDialog.setModel(this.getView().getModel());
					this._oDialog.open();
				}.bind(this));
			} else {
				this._oDialog.setModel(this.getView().getModel());
				this._oDialog.open();
			}
		},

		handleSliderChange: function (oEvent) {
			var oNewValue = oEvent.getParameter("value"),
				oCustomFilter = this._oDialog.getFilterItems()[0];

			// Set the custom filter's count and selected properties
			// if the value has changed
			if (oNewValue !== this.filterPreviousValue) {
				oCustomFilter.setFilterCount(1);
				oCustomFilter.setSelected(true);
			} else {
				oCustomFilter.setFilterCount(0);
				oCustomFilter.setSelected(false);
			}
		},

		handleConfirm: function (oEvent) {
			var oSlider = this._oDialog.getFilterItems()[0].getCustomControl();
			this.filterPreviousValue = oSlider.getValue();
			if (oEvent.getParameters().filterString) {
				MessageToast.show(oEvent.getParameters().filterString + " Value is " + oSlider.getValue());
			}
		},

		handleCancel: function () {
			var oCustomFilter = this._oDialog.getFilterItems()[0],
				oSlider = oCustomFilter.getCustomControl();

			oSlider.setValue(this.filterPreviousValue);

			if (this.filterPreviousValue !== this.filterResetValue) {
				oCustomFilter.setFilterCount(1);
				oCustomFilter.setSelected(true);
			} else {
				oCustomFilter.setFilterCount(0);
				oCustomFilter.setSelected(false);
			}
		},

		handleResetFilters: function () {
			var oCustomFilter = this._oDialog.getFilterItems()[0],
				oSlider = oCustomFilter.getCustomControl();
			oSlider.setValue(this.filterResetValue);
			oCustomFilter.setFilterCount(0);
			oCustomFilter.setSelected(false);
		}
	});

});
