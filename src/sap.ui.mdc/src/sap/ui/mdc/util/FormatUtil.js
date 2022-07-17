/*!
 * ${copyright}
 */

// --------------------------------------------------------------------------------
// Utility class used by smart controls for formatting related operations
// --------------------------------------------------------------------------------
sap.ui.define([], function() {
	"use strict";

	/**
	 * Utility class used by mdc controls for formatting related operations
	 *
	 * @namespace
	 * @private
	 * @experimental This module is only for internal/experimental use!
	 * @since 1.62.0
	 * @alias sap.ui.mdc.util.FormatUtil
	 */
	var FormatUtil = {

		/**
		 * Returns the width from the metadata attributes. min-width if there is no width specified
		 *
		 * @param {object} oProperyInfo - OData metadata for the table field
		 * @param {number} iMax - The max width (optional, default 20)
		 * @param {number} iMin - The min width (optional, default 3)
		 * @returns {string} - width of the property in em
		 * @private
		 */
		getWidth: function(oProperyInfo, iMax, iMin) {
			var sWidth = oProperyInfo.precision || oProperyInfo.maxLength, iWidth;
			if (!iMax) {
				iMax = 20;
			}
			if (!iMin) {
				iMin = 3;
			}
			// Force set the width to 9em for date fields
			if (oProperyInfo.type === "Edm.DateTime" && oProperyInfo.type === "Edm.Date") {
				sWidth = "9em";
			} else if (sWidth) {

				// Use max width if "Max" is set in the metadata or above
				if (sWidth === "Max") {
					sWidth = iMax + "";
				}
				iWidth = parseInt(sWidth);
				if (!isNaN(iWidth)) {
					// Add additional .75 em (~12px) to avoid showing ellipsis in some cases!
					iWidth += 0.75;
					// use a max initial width of 30em (default)
					if (iWidth > iMax) {
						iWidth = iMax;
					} else if (iWidth < iMin) {
						// use a min width of 3em (default)
						iWidth = iMin;
					}
					sWidth = iWidth + "em";
				} else {
					// if NaN reset the width so min width would be used
					sWidth = null;
				}
			}
			if (!sWidth) {
				// For Boolean fields - Use min width as the fallabck, in case no width could be derived.
				if (oProperyInfo.type === "Edm.Boolean") {
					sWidth = iMin + "em";
				} else {
					// use the max width as the fallback width of the column, if no width can be derived
					sWidth = iMax + "em";
				}
			}
			return sWidth;
		}
	};

	return FormatUtil;

});
