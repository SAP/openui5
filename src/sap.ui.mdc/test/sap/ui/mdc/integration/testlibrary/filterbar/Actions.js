/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"./waitForAdaptFiltersButton"
], function(
	Opa5,
	Press,
	waitForAdaptFiltersButton
) {
    "use strict";

    return {

		iPressOnTheAdaptFiltersButton: function() {
			return waitForAdaptFiltersButton.call(this, {
				actions: new Press(),
				success: function onAdaptFiltersButtonFound(oAdaptFiltersButton) {
					Opa5.assert.ok(true, 'The "Adapt Filters" button was pressed');
				}
			});
		}
    };
});
