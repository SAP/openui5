/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/restricted/_uniq"
], function (
	_uniq
) {
	"use strict";

	/**
	 * Validates if the provided list contains no duplicates.
	 *
	 * @namespace sap.ui.integration.designtime.baseEditor.validator.IsUniqueList
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
		errorMessage: "BASE_EDITOR.VALIDATOR.DUPLICATE_ENTRY",
		/**
		 * Validator function
		 *
		 * @param {string} aValue - List to validate
		 * @returns {boolean} Validation result
		 *
		 * @public
		 * @function
		 * @name sap.ui.integration.designtime.baseEditor.validator.IsUniqueList.validate
		 */
		validate: function (aValue) {
			return aValue === undefined
				|| aValue.length === _uniq(aValue).length;
		}
	};
});
