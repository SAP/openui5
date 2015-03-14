sap.ui.define(function() {
	"use strict";

	var Formatter = {

		status :  function (sStatus) {
			if (sStatus === "Available") {
				return "Success";
			} else if (sStatus === "Out of Stock") {
				return "Warning";
			} else if (sStatus === "Discontinued"){
				return "Error";
			} else {
				return "None";
			}
		},
		intBoolRandomizer: function(iRandom) {
			return iRandom % 2 === 0;
		},
		favorite: function(sStatus) {
			return sStatus.length % 2 === 0;
		}
	};


	return Formatter;

}, /* bExport= */ true);
