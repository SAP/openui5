/*!
 * ${copyright}
 */

sap.ui.define([
	"./waitForAdaptFiltersDialog"
], function(
	waitForAdaptFiltersDialog
) {
	"use strict";

	return {

		iShouldSeeTheAdaptFiltersP13nDialog: function() {
			return waitForAdaptFiltersDialog.call(this);
		}
    };
});
