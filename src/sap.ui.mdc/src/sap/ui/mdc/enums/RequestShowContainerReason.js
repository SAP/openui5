/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.mdc.enums.RequestShowContainerReason
sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";


	/**
	 * Enumeration of the possible triggers for {@link sap.ui.mdc.ValueHelp ValueHelp}
	 *
	 * @enum {string}
	 * @public
	 * @since 1.136
	 * @alias sap.ui.mdc.enums.RequestShowContainerReason
	 */
	const RequestShowContainerReason = {
		/**
		 * Text was entered or modified in a connected control.
		 * @public
		 */
		Typing: "Typing",
		/**
		 * Content may have been filtered during it's {@link sap.ui.mdc.valuehelp.base.FilterableListContent#onBeforeShow onBeforeShow} phase or a <code>filterValue</code> change occured while the <code>ValueHelp</code> was already open.
		 * @public
		 */
		Filter: "Filter",
		/**
		 * A connected control was activated through a click or tap action.
		 * @public
		 */
		Tap: "Tap",
		/**
		 * A connected control was focused using the Tab key.
		 * @public
		 */
		Tab: "Tab",
		/**
		 * A connected control fired a {@link sap.m.Input.valueHelpRequest valueHelpRequest}.
		 * @public
		 */
		ValueHelpRequest: "ValueHelpRequest",
		/**
		 * A connected control receives focus.
		 * @public
		 */
		Focus: "Focus",
		/**
		 * {@link sap.ui.mdc.ValueHelp#navigate ValueHelp arrow-navigation} was triggered.
		 * @public
		 */
		Navigate: "Navigate"
	};

	DataType.registerEnum("sap.ui.mdc.enums.RequestShowContainerReason", RequestShowContainerReason);

	return RequestShowContainerReason;

});