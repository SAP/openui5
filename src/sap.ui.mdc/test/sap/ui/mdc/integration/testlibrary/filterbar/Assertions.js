/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"./waitForFilterBar",
	"./waitForAdaptFiltersButton"
], function(
	Opa5,
	waitForFilterBar,
	waitForAdaptFiltersButton
) {
	"use strict";

	return {

		iShouldSeeTheFilterBar: function() {
			return waitForFilterBar.call(this);
		},

		iShouldSeeTheFilterFieldsWithLabels: function(aLabelNames) {

			function onFilterFieldsFound(aFilterFields) {
				Opa5.assert.strictEqual(aFilterFields.length, aLabelNames.length, "The exact number of filter fields were found");

				var oFilterBar = aFilterFields[0].getParent(),
					aFilterFieldsReOrdered = oFilterBar.getFilterItems();

				if (aFilterFieldsReOrdered.length === aLabelNames.length) {
					aLabelNames.forEach(function(sLabel, iIndex) {
						var oFilterField = aFilterFieldsReOrdered[iIndex];
						Opa5.assert.strictEqual(oFilterField.getLabel(), sLabel, 'The filter field labeled as "' + sLabel + '" found');
					});
				}
			}

			return this.waitFor({
				controlType: "sap.ui.mdc.FilterField",
				matchers: {
					ancestor: {
						controlType: "sap.ui.mdc.FilterBar"
					}
				},
				success: onFilterFieldsFound,
				errorMessage: "The filter fields could not be found"
			});
		},

		iShouldSeeTheAdaptFiltersButton: function() {
			return waitForAdaptFiltersButton.call(this);
		}
    };
});
