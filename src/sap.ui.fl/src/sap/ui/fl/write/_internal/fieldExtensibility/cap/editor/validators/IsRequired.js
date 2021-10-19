/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	return {
		async: false,
		errorMessage: "CAP_ERR_REQUIRED",
		validate: function (vValue) {
			return (
				vValue === false
				|| vValue === 0
				|| !!vValue
			);
		}
	};
});
