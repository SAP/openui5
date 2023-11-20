/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/validator/IsValidBinding",
	"sap/base/util/restricted/_isNil"
], function (
	IsValidBinding,
	_isNil
) {
	"use strict";

	/**
	 * Validates if the provided value doesn't exceed the maximum length.
	 *
	 * @namespace sap.ui.integration.designtime.baseEditor.validator.MaxLength
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
		errorMessage: {
			message: "BASE_EDITOR.VALIDATOR.MAX_LENGTH",
			placeholders: function (oConfig) {
				return [
					oConfig.maxLength
				];
			}
		},
		/**
		 * Validator function
		 *
		 * @param {boolean|string} vValue - Value to validate
		 * @returns {boolean} Validation result
		 *
		 * @public
		 * @function
		 * @name sap.ui.integration.designtime.baseEditor.validator.MaxLength.validate
		 */
		validate: function (vValue, oConfig) {
			return _isNil(vValue)
				|| (typeof vValue === "string" && vValue.length <= oConfig.maxLength)
				|| IsValidBinding.validate(vValue, { allowPlainStrings: false });
		}
	};
});
