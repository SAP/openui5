/*!
 * ${copyright}
 */

// Provides control sap.ui.mdc.filterbar.vh.FilterItemLayout.
sap.ui.define([
	"sap/ui/mdc/valuehelp/FilterContainer"
], (ValueHelpFilterContainer) => {
	"use strict";
		/**
		 * Constructor for a new filterBar/vh/FilterContainer.
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @class The FilterContainer is a IFilterContainer implementation for <code>AlignedFlowLayout</code>
		 * @extends sap.ui.mdc.filterbar.IFilterContainer
		 * @constructor
		 * @private
		 * @since 1.84.0
		 * @alias sap.ui.mdc.filterbar.vh.FilterContainer
		 * @deprecated since 1.124.0 - Please use the <code>sap.ui.mdc.valuehelp.FilterContainer</code> control instead.
		 */
		const FilterContainer = ValueHelpFilterContainer.extend("sap.ui.mdc.filterbar.vh.FilterContainer");

		return FilterContainer;
	}
);