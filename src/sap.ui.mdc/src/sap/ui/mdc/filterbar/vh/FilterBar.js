/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/valuehelp/FilterBar",
	"sap/ui/mdc/filterbar/FilterBarBaseRenderer"
], (ValueHelpFilterBar, FilterBarBaseRenderer) => {
	"use strict";
		/**
		 * Modules for value help dialog {@link sap.ui.mdc.filterbar.vh.FilterBar FilterBar}
		 * @namespace
		 * @name sap.ui.mdc.filterbar.vh
		 * @since 1.84.0
		 * @public
		 */

		/**
		 * Constructor for a new <code>FilterBar</code> for a value help dialog.
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] initial settings for the new control
		 * @class The <code>FilterBar</code> control is used to display filter properties in a user-friendly manner to populate values for a query.
		 * The filters are arranged in a logical row that is divided depending on the space available and the width of the filters.
		 * The Go button triggers the search event, and the Show Filters button shows the additional filter field.<br>
		 * The <code>FilterBar</code> control creates and handles the filters based on the provided metadata information.
		 * The metadata information is provided via the {@link module:sap/ui/mdc/FilterBarDelegate FilterBarDelegate} implementation. This implementation has to be provided by the application.<br>
		 * <b>Note:</b> The <code>FilterBar</code> can only be used for a {@link sap.ui.mdc.valuehelp.Dialog Dialog} and not on its own.
		 * @extends sap.ui.mdc.filterbar.FilterBarBase
		 * @author SAP SE
		 * @version ${version}
		 * @constructor
		 * @public
		 * @since 1.84.0
		 * @alias sap.ui.mdc.filterbar.vh.FilterBar
		 * @deprecated since 1.124.0 - Please use the <code>sap.ui.mdc.valuehelp.FilterBar</code> control instead.
		 */
		const FilterBar = ValueHelpFilterBar.extend("sap.ui.mdc.filterbar.vh.FilterBar",{
			renderer: FilterBarBaseRenderer
		});

		return FilterBar;
	}
);