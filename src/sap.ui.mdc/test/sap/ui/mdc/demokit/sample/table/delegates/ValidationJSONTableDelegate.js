/* eslint-disable require-await */
sap.ui.define([
	"mdc/sample/delegate/JSONTableDelegate",
	"sap/m/MessageBox"
], function(
	JSONTableDelegate,
	MessageBox
) {
	"use strict";

	// Sample delegate demonstrating the validateP13nState hook:
	// sorting by "Range" is only allowed when the rows are also sorted by "Name",
	// so mountains within the same range stay in a stable, alphabetical order.
	// Open Settings > Sort, sort by "Range" without "Name", press OK.
	const ValidationJSONTableDelegate = {
		...JSONTableDelegate,

		async validateP13nState(oTable, oState) {
			const aSorters = oState.sorters || [];
			const bSortsByRange = aSorters.some((oSorter) => oSorter.key === "range" && oSorter.sorted !== false);
			const bSortsByName = aSorters.some((oSorter) => oSorter.key === "name" && oSorter.sorted !== false);

			if (bSortsByRange && !bSortsByName) {
				return new Promise((resolve) => {
					MessageBox.error('You must also sort by "Name" when sorting by "Range".', {
						title: "Invalid sorting",
						onClose: () => resolve(false)
					});
				});
			}

			return JSONTableDelegate.validateP13nState(oTable, oState);
		}
	};

	return ValidationJSONTableDelegate;
}, /* bExport= */false);
