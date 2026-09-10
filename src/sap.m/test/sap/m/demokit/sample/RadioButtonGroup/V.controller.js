sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/library"
], function (Controller, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	return Controller.extend("sap.m.sample.RadioButtonGroup.V", {

		// Clears the error value state of the required group once a radio button is selected
		onRequiredGroupSelect: function (oEvent) {
			var oGroup = oEvent.getSource();

			oGroup.setValueState(oGroup.getSelectedIndex() < 0 ? ValueState.Error : ValueState.None);
		}

	});
});
