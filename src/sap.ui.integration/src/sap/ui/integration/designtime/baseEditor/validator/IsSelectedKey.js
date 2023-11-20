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
	 * Validates if the provided value is one of the given keys.
	 *
	 * @namespace sap.ui.integration.designtime.baseEditor.validator.IsSelectedKey
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
		errorMessage: "BASE_EDITOR.VALIDATOR.FORBIDDEN_CUSTOM_VALUE",
		/**
		 * Validator function
		 *
		 * @param {string} sValue - Key to validate
		 * @param {object} oConfig - Validator config
		 * @param {string[]} oConfig.keys - Available keys
		 * @returns {boolean} Validation result
		 *
		 * @public
		 * @function
		 * @name sap.ui.integration.designtime.baseEditor.validator.IsSelectedKey.validate
		 */
		validate: function (sValue, oConfig) {
			if (Array.isArray(sValue)) {
				var isValid = true;
				if (sValue.length > 0) {
					for (var i = 0; i < sValue.length; i++) {
						if (!(sValue[i] === undefined
							|| (oConfig.keys || []).includes(sValue[i])
							|| IsValidBinding.validate(sValue[i], { allowPlainStrings: false }))) {
								isValid = false;
								break;
							}
					}
				}
				return isValid;
			} else {
				return sValue === undefined
				|| (oConfig.keys || []).includes(sValue)
				|| IsValidBinding.validate(sValue, { allowPlainStrings: false });
			}
		}
	};
});
