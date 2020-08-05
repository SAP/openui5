sap.ui.define(function() {
	"use strict";

	var Formatter = {
		weightState :  function (fMeasure, sUnit) {
			// Boarder values for different status of weight
			var fMaxWeightSuccess = 1;
			var fMaxWeightWarning = 5;
			var fAdjustedMeasure = parseFloat(fMeasure);

			// if the value of fMeasure is not a number, no status will be set
			if (isNaN(fAdjustedMeasure)) {
				return "None";
			}

			if (sUnit === "G") {
				fAdjustedMeasure = fMeasure / 1000;
			}

			if (fAdjustedMeasure < 0) {
				return "None";
			} else if (fAdjustedMeasure < fMaxWeightSuccess) {
				return "Success";
			} else if (fAdjustedMeasure < fMaxWeightWarning) {
				return "Warning";
			}

			return "Error";
		}
	};

	return Formatter;
}, /* bExport= */ true);
