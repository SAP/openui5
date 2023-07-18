/*!
 * ${copyright}
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * Defines what data type is used for parse or format the condition values on a {@link sap.ui.mdc.condition.Operator Operator}.
	 *
	 * @enum {string}
	 * @since 1.75
	 * @alias sap.ui.mdc.enum.OperatorValueType
	 * @private
	 * @ui5-restricted sap.fe
	 * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums.OperatorValueType}
	 */
	var OperatorValueType = {
		/**
		 * The <code>Type</code> of the <code>Field</code> or <code>FilterField</code> using the <code>Operator</code> is used.
		 *
		 * @public
		 */
		Self: "self",

		/**
		 * A simple string type is used to display static text.
		 *
		 * @public
		 */
		Static: "static",

		/**
		 * The <code>Type</code> of the <code>Field</code> or <code>FilterField</code> using the <code>Operator</code> is used
		 * for validation, but the user input is used as value.
		 *
		 * @public
		 * @since 1.86
		 */
		SelfNoParse: "selfNoParse"
	};

	return OperatorValueType;

}, /* bExport= */ true);
