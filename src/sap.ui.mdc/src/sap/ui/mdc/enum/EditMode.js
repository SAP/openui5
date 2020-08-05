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
	 * @since 1.48.1
	 * @alias sap.ui.mdc.enum.EditMode
	 */
	var EditMode = {
		/**
		 * <code>Field</code> or <code>FilterField</code> is rendered in display mode
		 * @public
		 */
		Display: "Display",
		/**
		 * <code>Field</code> or <code>FilterField</code> is rendered in editable mode
		 * @public
		 */
		Editable: "Editable",
		/**
		 * <code>Field</code> or <code>FilterField</code> is rendered in read-only mode
		 * @public
		 */
		ReadOnly: "ReadOnly",
		/**
		 * <code>Field</code> or <code>FilterField</code> is rendered in disabled mode
		 * @public
		 */
		Disabled: "Disabled",
		/**
		 * If more then one control is rendered by the <code>Field</code> or <code>FilterField</code> control,
		 * the first part is editable, and the other parts are read-only.
		 * @since 1.72.0
		 * @public
		 */
		EditableReadOnly: "EditableReadOnly",
		/**
		 * If more then one control is rendered by the <code>Field</code> or <code>FilterField</code> control,
		 * the first part is editable, and the other parts are in display mode.
		 * @since 1.72.0
		 * @public
		 */
		EditableDisplay: "EditableDisplay"
	};

	return EditMode;

}, /* bExport= */ true);
