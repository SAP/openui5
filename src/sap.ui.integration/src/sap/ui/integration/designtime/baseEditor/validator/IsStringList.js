/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/validator/IsValidBinding"
], function (
	IsValidBinding
) {
	"use strict";

	/**
	 * Validates if none of the provided values is an invalid binding.
	 *
	 * @namespace sap.ui.integration.designtime.baseEditor.validator.IsStringList
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
		errorMessage: IsValidBinding.errorMessage,
		/**
		 * Validator function
		 *
		 * @param {string[]} aValue - Strings to validate
		 * @returns {boolean} Validation result
		 *
		 * @public
		 * @function
		 * @name sap.ui.integration.designtime.baseEditor.validator.IsStringList.validate
		 */
		validate: function (aValue) {
			return aValue === undefined
				|| aValue.every(function (sItem) {
					return IsValidBinding.validate(sItem);
				});
		}
	};
});
