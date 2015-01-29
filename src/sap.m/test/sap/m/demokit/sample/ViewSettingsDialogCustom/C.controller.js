sap.ui.controller("sap.m.sample.ViewSettingsDialogCustom.C", {

	filterResetValue: 50,
	filterPreviousValue: 50,

	onExit : function () {
		if (this._oDialog) {
			this._oDialog.destroy();
		}
	},

	handleViewSettingsDialogPress: function (oEvent) {
		if (! this._oDialog) {
			this._oDialog = sap.ui.xmlfragment("sap.m.sample.ViewSettingsDialogCustom.Dialog", this);
			// Set initial and reset value for Slider in custom control
			var oSlider = this._oDialog.getFilterItems()[0].getCustomControl();
			oSlider.setValue(this.filterResetValue);
		}

		this._oDialog.setModel(this.getView().getModel());
		// toggle compact style
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
		this._oDialog.open();
	},

	handleSliderChange: function (oEvent) {

		var oNewValue = oEvent.getParameter("value");
		var oCustomFilter = this._oDialog.getFilterItems()[0];

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
			sap.m.MessageToast.show(oEvent.getParameters().filterString + " Value is " + oSlider.getValue());
		}
	},

	handleCancel: function (oEvent) {

		var oCustomFilter = this._oDialog.getFilterItems()[0];
		var oSlider = oCustomFilter.getCustomControl();

		oSlider.setValue(this.filterPreviousValue);

		if (this.filterPreviousValue !== this.filterResetValue) {
			oCustomFilter.setFilterCount(1);
			oCustomFilter.setSelected(true);
		} else {
			oCustomFilter.setFilterCount(0);
			oCustomFilter.setSelected(false);
		}

	},

	handleResetFilters: function (oEvent) {

		var oCustomFilter = this._oDialog.getFilterItems()[0];
		var oSlider = oCustomFilter.getCustomControl();
		oSlider.setValue(this.filterResetValue);
		oCustomFilter.setFilterCount(0);
		oCustomFilter.setSelected(false);

	}
});
