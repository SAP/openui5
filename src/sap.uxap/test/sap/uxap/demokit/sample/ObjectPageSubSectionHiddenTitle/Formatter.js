sap.ui.define(function() {
	"use strict";

	var Formatter = {

		weightState :  function (fValue) {

				var parsedValue = parseFloat(fValue);

				if (Number.isNaN(parsedValue) || parsedValue < 0 ) {
					return "None";
				} else if (parsedValue < 1000) {
					return "Success";
				} else if (parsedValue < 2000) {
					return "Warning";
				} else {
					return "Error";
				}
		}
	};

	return Formatter;

}, /* bExport= */ true);
