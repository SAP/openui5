/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/util/isValidBindingString"
], function (
	isValidBindingString
) {
	"use strict";

	/**
	 * Validates if the provided value is a valid binding.
	 *
	 * @namespace sap.ui.integration.designtime.baseEditor.validator.IsValidBinding
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
		errorMessage: "BASE_EDITOR.VALIDATOR.INVALID_BINDING",
		/**
		 * Validator function
		 *
		 * @param {string} sValue - Value to validate
		 * @returns {boolean} Validation result
		 * @param {object} oConfig - Validator config
		 * @param {boolean} oConfig.allowPlainStrings - Whether strings which don't contain a binding are allowed, default is false
		 * @public
		 * @function
		 * @name sap.ui.integration.designtime.baseEditor.validator.IsValidBinding.validate
		 */
		validate: function (sValue, oConfig) {
			var bAllowPlainStrings = (oConfig || {}).allowPlainStrings !== false;
			return sValue === undefined
				|| sValue === ""
				// Convert to string first to allow custom value types of different editors
				|| isValidBindingString(sValue.toString(), bAllowPlainStrings);
		}
	};
});
