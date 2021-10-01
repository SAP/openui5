/*!
 * ${copyright}
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * Defines in which mode the content of a <code>Field</code>, <code>FilterField</code> or <code>MultiValueField</code> is rendered.
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.87
	 * @alias sap.ui.mdc.enum.ContentMode
	 */
	var ContentMode = {
		/**
		 * Display mode for single value
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Display: "Display",
		/**
		 * Display mode for multiple values
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 * @since 1.96
		 */
		DisplayMultiValue: "DisplayMultiValue",
		/**
		 * Display mode for multiline single value
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 * @since 1.91
		 */
		DisplayMultiLine: "DisplayMultiLine",
		/**
		 * Edit mode for single value
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Edit: "Edit",
		/**
		 * Edit mode for multiple values
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		EditMultiValue: "EditMultiValue",
		/**
		 * Edit mode for multiple lines single value
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		EditMultiLine: "EditMultiLine",
		/**
		 * Edit mode for operator dependent controls
		 * This is used for single value and only one operator.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		EditOperator: "EditOperator"
	};

	return ContentMode;

}, /* bExport= */ true);
