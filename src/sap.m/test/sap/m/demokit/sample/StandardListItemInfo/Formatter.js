sap.ui.define([
	"sap/ui/core/library"
], function(coreLibrary) {
	"use strict";

	const {ValueState} = coreLibrary;

	const Formatter = {
		status(sStatus) {
			if (sStatus === "Available") {
				return ValueState.Success;
			} else if (sStatus === "Out of Stock") {
				return ValueState.Warning;
			} else if (sStatus === "Discontinued"){
				return ValueState.Error;
			} else {
				return ValueState.None;
			}
		}
	};

	return Formatter;
});
