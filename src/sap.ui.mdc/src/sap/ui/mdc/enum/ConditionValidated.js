/*!
 * ${copyright}
 */

sap.ui.define(function() {
	"use strict";


	/**
	 * Enumeration of the validated state of conditions
	 *
	 * If a <code>Condition</code> is chosen from a field help or validated against a field help
	 * it is set to be validated. In this case the corresponding item in the field help is
	 * shown as selected.
	 *
	 * If the validated state of the <code>Condition</code> is undefined this means
	 * it is not defined if it is validated or not.
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.fe
	 * @since 1.78.0
	 * @alias sap.ui.mdc.enum.ConditionValidated
	 */
	var ConditionValidated = {
		/**
		 * Condition is not validated
		 * @private
		 * @ui5-restricted sap.fe
		 */
		NotValidated: "NotValidated",

		/**
		 * Condition is validated
		 * @private
		 * @ui5-restricted sap.fe
		 */
		Validated: "Validated"

	};

	return ConditionValidated;

}, /* bExport= */ true);
