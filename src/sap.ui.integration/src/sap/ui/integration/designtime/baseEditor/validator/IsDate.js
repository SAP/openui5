/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/validator/IsValidBinding",
	"sap/ui/core/date/UI5Date"
], function (
	IsValidBinding,
	UI5Date
) {
	"use strict";

	/**
	 * Validates if the provided value can be parsed to a valid date.
	 *
	 * @namespace sap.ui.integration.designtime.baseEditor.validator.IsDate
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @static
	 * @since 1.81
	 * @public
	 * @experimental 1.81
	 */
	return {
		async: false,
		errorMessage: "BASE_EDITOR.VALIDATOR.INVALID_DATE",
		/**
		 * Validator function
		 *
		 * @param {string} sDateString - Date string to validate
		 * @returns {boolean} Validation result
		 *
		 * @public
		 * @function
		 * @name sap.ui.integration.designtime.baseEditor.validator.IsDate.validate
		 */
		validate: function (sDateString, oConfig) {
			var formatterInstance = oConfig.formatterInstance;
			var oDate = (formatterInstance && formatterInstance.parse(sDateString)) || UI5Date.getInstance(sDateString);
			return sDateString === undefined
				|| IsValidBinding.validate(sDateString, { allowPlainStrings: false })
				|| (oDate && !isNaN(UI5Date.getInstance(oDate).getTime()));
		}
	};
});
