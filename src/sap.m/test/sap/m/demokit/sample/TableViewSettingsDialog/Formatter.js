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
				} else if (fValue < 1000) {
					return ValueState.Success;
				} else if (fValue < 2000) {
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
