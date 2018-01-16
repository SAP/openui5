sap.ui.define(function () {
	"use strict";

	var Formatter = {

		availableState: function (sStateValue) {
			var sStateValueToLower = sStateValue.toLowerCase();

			switch (sStateValueToLower) {
				case "available":
					return 8;
				case "sold out":
					return 3;
				case "delivery expected":
					return 5;
				default:
					return 9;
			}
		}
	};

	return Formatter;

}, /* bExport= */ true);
