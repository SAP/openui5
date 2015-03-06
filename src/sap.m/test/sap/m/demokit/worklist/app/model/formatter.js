sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * Rounds the number unit value to 2 digits
		 *
		 * @public
		 * @param sValue
		 * @returns {string}
		 */
		numberUnit : function (sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		}
	};

}, /* bExport= */ true);
