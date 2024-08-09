/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Defines in which mode the content of a {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.FilterField FilterField} or {@link sap.ui.mdc.MultiValueField MultiValueField} is rendered.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.115
	 * @alias sap.ui.mdc.enums.ContentMode
	 */
	const ContentMode = {
		/**
		 * Display mode for single value
		 * @public
		 */
		Display: "Display",
		/**
		 * Display mode for multiple values
		 * @public
		 */
		DisplayMultiValue: "DisplayMultiValue",
		/**
		 * Display mode for multiline single value
		 * @public
		 */
		DisplayMultiLine: "DisplayMultiLine",
		/**
		 * Edit mode for single value
		 * @public
		 */
		Edit: "Edit",
		/**
		 * Edit mode for multiple values
		 * @public
		 */
		EditMultiValue: "EditMultiValue",
		/**
		 * Edit mode for multiple lines single value
		 * @public
		 */
		EditMultiLine: "EditMultiLine",
		/**
		 * Edit mode for operator dependent controls
		 * This is used for single value and only one operator.
		 * @public
		 */
		EditOperator: "EditOperator",
		/**
		 * Edit mode for single value field if a field help is assigned
		 * To support field help, in some cases a different control needs to be rendered.
		 * @public
		 */
		EditForHelp: "EditForHelp"
	};

	DataType.registerEnum("sap.ui.mdc.enums.ContentMode", ContentMode);

	return ContentMode;

});