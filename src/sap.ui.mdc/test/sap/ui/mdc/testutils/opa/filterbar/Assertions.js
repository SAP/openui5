/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Matcher",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/PropertyStrictEquals",
    "./waitForFilterBar",
    "./waitForAdaptFiltersButton"
], function(
	Opa5,
	Matcher,
	Properties,
	Ancestor,
	PropertyStrictEquals,
    waitForFilterBar,
    waitForAdaptFiltersButton
) {
	"use strict";

    var iShouldSeeFilterField = function(oFilterBarInstance, sLabel, aExpectedConditions) {
        var vMatchers;

        if (aExpectedConditions) {
            vMatchers = function(oFilterField) {
                var bLabelCorrect = oFilterField.getLabel() === sLabel;
                var bAncestor = new Ancestor(oFilterBarInstance, true)(oFilterField);
                var aFilterFieldConditions = oFilterField.getConditions();
                var bConditionsCorrect = aFilterFieldConditions.length === aExpectedConditions.length;

                if (bConditionsCorrect) {
                    bConditionsCorrect = aFilterFieldConditions.every(function(oFilterFieldCondition) {
                        return aExpectedConditions.some(function(oExpectedCondition) {
                            var bOperator = oFilterFieldCondition.operator === oExpectedCondition.operator;
                            var bValues;

                            bValues = oFilterFieldCondition.values.every(function(oFilterFieldConditionValue) {
                                return oExpectedCondition.values.includes(oFilterFieldConditionValue);
                            });

                            return bOperator && bValues;
                        });
                    });
                }

                return bLabelCorrect && bAncestor && bConditionsCorrect;
            };
        } else {
            vMatchers = [
                new Ancestor(oFilterBarInstance, false),
                new PropertyStrictEquals({
                    name: "label",
                    value: sLabel
                })
            ];
        }


        this.waitFor({
            controlType: "sap.ui.mdc.FilterField",
            matchers: vMatchers,
            success: function(aFilterFields) {
                Opa5.assert.ok(aFilterFields.length === 1, "The FilterField labeled as '" + sLabel + "' found");
            }
        });
    };

    return {
        iShouldSeeFilters: function(oFilterBar, vSettings) {
            var sFilterBarId = typeof oFilterBar === "string" ? oFilterBar : oFilterBar.getId();
			return this.waitFor({
				id: sFilterBarId,
				success: function(oFilterBarInstance) {
                    if (Array.isArray(vSettings)) {
                        vSettings.forEach(function(sLabel) {
                            iShouldSeeFilterField.call(this, oFilterBarInstance, sLabel);
                        }.bind(this));
                    } else {
                        for (var sLabel in vSettings) {
                            iShouldSeeFilterField.call(this, oFilterBarInstance, sLabel, vSettings[sLabel]);
                        }
                    }
                }
            });
        },

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