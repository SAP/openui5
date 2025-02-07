/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.mdc.enums.FilterBarValidationStatus
sap.ui.define(() => {
	"use strict";

	/**
	 * Enumeration of the possible validation types.
	 *
	 * @enum {int}
	 * @public
	 * @since 1.115
	 * @alias sap.ui.mdc.enums.FilterBarValidationStatus
	 */
	const FilterBarValidationStatus = {

		/**
		 * No errors detected.
		 * @public
		 */
		NoError: "NoError",

		/**
		 * Required filter field without a value.
		 * @public
		 */
		RequiredHasNoValue: "RequiredHasNoValue",

		/**
		 * Filter field in error state.
		 * @public
		 */
		FieldInErrorState: "FieldInErrorState",

		/**
		 * Ongoing asynchronous validation.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		AsyncValidation: "AsyncValidation",

		/**
		 * Change is being applied.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		OngoingChangeAppliance: "OngoingChangeAppliance"
	};

	return FilterBarValidationStatus;

}, /* bExport= */ true);