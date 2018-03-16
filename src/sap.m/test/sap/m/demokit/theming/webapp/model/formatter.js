sap.ui.define(function() {
	"use strict";

	var Formatter = {

		weightState :  function (fMeasure, sUnit) {
			var fMaxWeightSuccess = 3;
			var fMaxWeightWarning = 4;
			var fAdjustedMeasure = parseFloat(fMeasure);
			if (isNaN(fAdjustedMeasure)) {
				return "None";
			} else {
				if (fAdjustedMeasure < 0) {
					return "None";
				} else if (fAdjustedMeasure < fMaxWeightSuccess) {
					return "Success";
				} else if (fAdjustedMeasure < fMaxWeightWarning) {
					return "Warning";
				} else {
					return "Error";
				}
			}
		},
		addClass: function (sValue) {
			switch (sValue) {
			case "1":
				return ("Class: 1");
			case "2":
				return ("Class: 2");
			case "3":
				return ("Class: 3");
			case "4":
				return ("Class: 4");
			default:
				return ("");
			}
			return ("");
		}
	};

	return Formatter;

}, /* bExport= */ true);