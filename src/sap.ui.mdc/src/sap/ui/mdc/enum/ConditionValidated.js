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
	 * @since 1.78.0
	 * @alias sap.ui.mdc.enum.ConditionValidated
	 */
	var ConditionValidated = {
		/**
		 * Condition is not validated
		 * @public
		 */
		NotValidated: "NotValidated",

		/**
		 * Condition is validated
		 * @public
		 */
		Validated: "Validated"

	};

	return ConditionValidated;

}, /* bExport= */ true);
