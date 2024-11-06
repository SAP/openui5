sap.ui.define([
	"sap/ui/core/library"
], function(coreLibrary) {
	"use strict";

	const {ValueState} = coreLibrary;

	const Formatter = {
		weightState(fValue) {
			try {
				fValue = parseFloat(fValue);
				if (fValue < 0) {
					return ValueState.None;
				} else if (fValue < 10) {
					return ValueState.Success;
				} else if (fValue < 20) {
					return ValueState.Warning;
				} else {
					return ValueState.Error;
				}
			} catch (err) {
				return ValueState.None;
			}
		}
	};

	return Formatter;
});
