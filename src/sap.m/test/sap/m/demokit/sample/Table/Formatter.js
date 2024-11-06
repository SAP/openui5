sap.ui.define([
	"sap/ui/core/library"
], function(coreLibrary) {
	"use strict";

	const {ValueState} = coreLibrary;

	const Formatter = {
		weightState(fMeasure, sUnit) {

			// Threshold values for different status of weight (in KG)
			var fMaxWeightSuccess = 1;
			var fMaxWeightWarning = 5;
			var fAdjustedMeasure = parseFloat(fMeasure);

			// if the value of fMeasure is not a number, no status will be set
			if (isNaN(fAdjustedMeasure)) {
				return ValueState.None;
			} else {

				if (sUnit === "G") {
					// convert to KG
					fAdjustedMeasure = fMeasure / 1000;
				}

				if (fAdjustedMeasure < 0) {
					return ValueState.None;
				} else if (fAdjustedMeasure < fMaxWeightSuccess) {
					return ValueState.Success;
				} else if (fAdjustedMeasure < fMaxWeightWarning) {
					return ValueState.Warning;
				} else {
					return ValueState.Error;
				}
			}
		}
	};

	return Formatter;
});
