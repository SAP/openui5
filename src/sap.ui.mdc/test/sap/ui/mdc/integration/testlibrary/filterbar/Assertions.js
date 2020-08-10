/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"./waitForFilterBar",
	"sap/ui/test/matchers/Ancestor",
	"./waitForAdaptFiltersButton"
], function(
	Opa5,
	waitForFilterBar,
	Ancestor,
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
				searchOpenDialogs: false,
				controlType: "sap.ui.mdc.FilterBar",
				matchers: {
					properties: {
						showAdaptFiltersButton: true
					}
				},
				success: function(aFilterBar){
					Opa5.assert.strictEqual(aFilterBar.length, 1, "Only one FilterBar is present");
					this.waitFor({
						controlType: "sap.ui.mdc.FilterField",
						matchers: new Ancestor(aFilterBar[0], true),
						success: function(aFilterFields) {
							onFilterFieldsFound(aFilterFields);
						}
					});
				},
				errorMessage: "The filter fields could not be found"
			});
		},

		iShouldSeeTheAdaptFiltersButton: function() {
			return waitForAdaptFiltersButton.call(this);
		}
    };
});
