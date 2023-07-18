/*!
 * ${copyright}
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * Defines in what mode a {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField} or {@link sap.ui.mdc.MultiValueField MultiValueField} is rendered.
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.fe
	 * @since 1.48.1
	 * @alias sap.ui.mdc.enum.EditMode
 	 * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums.FieldEditMode}
	 */
	var EditMode = {
		/**
		 * {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField} or {@link sap.ui.mdc.MultiValueField MultiValueField} is rendered in display mode
		 * @public
		 */
		Display: "Display",
		/**
		 * {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField} or {@link sap.ui.mdc.MultiValueField MultiValueField} is rendered in editable mode
		 * @public
		 */
		Editable: "Editable",
		/**
		 * {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField} or {@link sap.ui.mdc.MultiValueField MultiValueField} is rendered in read-only mode
		 * @public
		 */
		ReadOnly: "ReadOnly",
		/**
		 * {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField} or {@link sap.ui.mdc.MultiValueField MultiValueField} is rendered in disabled mode
		 * @public
		 */
		Disabled: "Disabled",
		/**
		 * If more than one control is rendered by the {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField} or {@link sap.ui.mdc.MultiValueField MultiValueField} control,
		 * the first part is editable, and the other parts are read-only.
		 * @since 1.72.0
		 * @public
		 */
		EditableReadOnly: "EditableReadOnly",
		/**
		 * If more than one control is rendered by the {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField} or {@link sap.ui.mdc.MultiValueField MultiValueField} control,
		 * the first part is editable, and the other parts are in display mode.
		 * @since 1.72.0
		 * @public
		 */
		EditableDisplay: "EditableDisplay"
	};

	return EditMode;

}, /* bExport= */ true);
