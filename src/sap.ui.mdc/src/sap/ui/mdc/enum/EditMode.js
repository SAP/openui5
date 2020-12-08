/*!
 * ${copyright}
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * Defines in what mode a <code>Field</code> or <code>FilterField</code> is rendered.
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.48.1
	 * @alias sap.ui.mdc.enum.EditMode
	 */
	var EditMode = {
		/**
		 * <code>Field</code> or <code>FilterField</code> is rendered in display mode
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		Display: "Display",
		/**
		 * <code>Field</code> or <code>FilterField</code> is rendered in editable mode
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		Editable: "Editable",
		/**
		 * <code>Field</code> or <code>FilterField</code> is rendered in read-only mode
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		ReadOnly: "ReadOnly",
		/**
		 * <code>Field</code> or <code>FilterField</code> is rendered in disabled mode
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		Disabled: "Disabled",
		/**
		 * If more then one control is rendered by the <code>Field</code> or <code>FilterField</code> control,
		 * the first part is editable, and the other parts are read-only.
		 * @since 1.72.0
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		EditableReadOnly: "EditableReadOnly",
		/**
		 * If more then one control is rendered by the <code>Field</code> or <code>FilterField</code> control,
		 * the first part is editable, and the other parts are in display mode.
		 * @since 1.72.0
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		EditableDisplay: "EditableDisplay"
	};

	return EditMode;

}, /* bExport= */ true);
