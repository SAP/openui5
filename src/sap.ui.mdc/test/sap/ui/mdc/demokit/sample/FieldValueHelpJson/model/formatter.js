sap.ui.define(function() {
	"use strict";
	return {
		formatValue: (value) => {
			// Rounds the currency value to 2 digits
			if (!value) {
				return "";
			}
			try {
				return parseFloat(value).toFixed(2);
			} catch (error) {
				return value;
			}
		}
	};
});
