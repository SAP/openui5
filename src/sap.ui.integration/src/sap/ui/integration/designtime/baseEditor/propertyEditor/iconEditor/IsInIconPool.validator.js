/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/validator/IsValidBinding",
	"sap/base/util/restricted/_isNil",
	"sap/ui/core/IconPool"
], function (
	IsValidBinding,
	_isNil,
	IconPool
) {
	"use strict";

	/**
	 * Validates if the provided value belongs to the icon pool.
	 *
	 * @namespace sap.ui.integration.designtime.baseEditor.propertyEditor.iconEditor.IsInIconPool
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
		errorMessage: "BASE_EDITOR.VALIDATOR.NOT_AN_ICON",
		/**
		 * Validator function
		 *
		 * @param {boolean|string} vValue - Value to validate
		 * @returns {boolean} Validation result
		 *
		 * @public
		 * @function
		 * @name sap.ui.integration.designtime.baseEditor.propertyEditor.iconEditor.IsInIconPool.validate
		 */
		validate: function (vValue) {
			return _isNil(vValue)
				|| (
					typeof vValue === "string"
					&& IconPool.isIconURI(vValue)
					&& !!IconPool.getIconInfo(vValue)
				)
				|| IsValidBinding.validate(vValue, { allowPlainStrings: false });
		}
	};
});
