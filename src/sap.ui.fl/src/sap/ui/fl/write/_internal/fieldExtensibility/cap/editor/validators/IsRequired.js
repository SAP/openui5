/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	return {
		async: false,
		errorMessage: "CAP_ERR_REQUIRED",
		validate(vValue) {
			return (
				vValue === false
				|| vValue === 0
				|| !!vValue
			);
		}
	};
});
