/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
	"use strict";

	/**
	 * Defines in what mode a {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField} or {@link sap.ui.mdc.MultiValueField MultiValueField} is rendered.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.115
	 * @alias sap.ui.mdc.enums.FieldEditMode
	 */
	const FieldEditMode = {
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
		 * @public
		 */
		EditableReadOnly: "EditableReadOnly",
		/**
		 * If more than one control is rendered by the {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField} or {@link sap.ui.mdc.MultiValueField MultiValueField} control,
		 * the first part is editable, and the other parts are in display mode.
		 * @public
		 */
		EditableDisplay: "EditableDisplay"
	};

	DataType.registerEnum("sap.ui.mdc.enums.FieldEditMode", FieldEditMode);

	return FieldEditMode;

}, /* bExport= */ true);
