/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Matcher",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function(
	Opa5,
	Matcher,
	Properties,
	Ancestor,
	Descendant,
	PropertyStrictEquals
) {
	"use strict";

	//var oMDCBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

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
                new Ancestor(oFilterBarInstance, true),
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
        }
    };

});