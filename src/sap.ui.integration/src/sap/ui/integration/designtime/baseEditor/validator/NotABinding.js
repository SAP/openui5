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
	 * Validates if the provided value doesn't contain a binding.
	 *
	 * @namespace sap.ui.integration.designtime.baseEditor.validator.NotABinding
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
		errorMessage: "BASE_EDITOR.VALIDATOR.FORBIDDEN_BINDING",
		/**
		 * Validator function
		 *
		 * @param {string} sValue - Value to validate
		 * @returns {boolean} Validation result
		 *
		 * @public
		 * @function
		 * @name sap.ui.integration.designtime.baseEditor.validator.NotABinding.validate
		 */
		validate: function (sValue) {
			return !isValidBindingString(sValue, false);
		}
	};
});
