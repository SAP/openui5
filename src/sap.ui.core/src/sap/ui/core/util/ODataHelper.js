/*!
 * ${copyright}
 */

// Provides object sap.ui.core.util.ODataHelper
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
		'use strict';
		/**
		 * The OData helper which can act as a formatter in XML template views.
		 *
		 * @name sap.ui.core.util.ODataHelper
		 * @private
		 */
		return {
			/**
			 * A very simple formatter helping to interpret OData v4 annotations during template
			 * processing.
			 *
			 * @param {object} oRawValue
			 *    the raw value from the meta model
			 * @returns {string}
			 *    the resulting string value to write into the processed XML
			 */
			format: function (oRawValue) {
				// string constant
				if (typeof oRawValue === "string") {
					return sap.ui.base.BindingParser.complexParser.escape(oRawValue);
				}

				// Edm.Path
				if (oRawValue && oRawValue["@odata.type"] === "Edm.Path") {
					if (typeof oRawValue.value === "string") {
						return "{path: " + JSON.stringify(oRawValue.value) + "}";
					}
					jQuery.sap.log.warning("Illegal value for Edm.Path: " + oRawValue.value,
						null, "sap.ui.core.util.ODataHelper");
				}

				// anything else: convert to string, prefer JSON
				if (typeof oRawValue === "object") {
					try {
						return JSON.stringify(oRawValue);
					} catch (ex) {
						// "Converting circular structure to JSON" --> fall back to default below
					}
				}
				return String(oRawValue);
			}
		};
	}, /* bExport= */ true);
