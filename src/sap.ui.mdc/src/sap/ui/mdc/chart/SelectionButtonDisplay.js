/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Defines the Icon and Text display behavior of a {@link sap.ui.mdc.chart.SelectionButtton SelectionButton} control.
	 *
	 * For the {@link sap.ui.mdc.chart.SelectionButtton SelectionButton} control, this enumeration defines how the <code>Icon</code> and <code>Text</code> on a button are displayed when the <code>SelectionButton</code> is not inside the overflow.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.123
	 * @alias sap.ui.mdc.enums.SelectionButtonDisplay
	 */
	const SelectionButtonDisplay = {
		/**
		 * Only the Icon is displayed. Text and Icon when in OverflowMenu
		 * @public
		 */
		Icon: "Icon",
		/**
		 * Only the description is displayed
		 * @public
		 */
		Text: "Text",
		/**
		 * Icon and Text are displayed on the button.
		 * @public
		 */
		Both: "Both"
	};

	DataType.registerEnum("sap.ui.mdc.enums.SelectionButtonDisplay", SelectionButtonDisplay);

	return SelectionButtonDisplay;

}, /* bExport= */ true);