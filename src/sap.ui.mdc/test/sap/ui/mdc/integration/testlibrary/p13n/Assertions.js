/*!
 * ${copyright}
 */

sap.ui.define([
	"./waitForAdaptFiltersPopover"
], function(
	waitForAdaptFiltersPopover
) {
	"use strict";

	return {

		iShouldSeeTheAdaptFiltersP13nPopover: function() {
			return waitForAdaptFiltersPopover.call(this);
		}
    };
});
