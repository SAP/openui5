/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"./Actions",
	"./Assertions"
], function(
	Opa5,
	fieldActions,
	fieldAssertions
) {
	"use strict";

	Opa5.createPageObjects({
		onTheMDCFilterField: {
			actions: {
				iEnterTextOnTheFilterField: function(sLabelName, sValue, oConfig) {
					return fieldActions.iEnterTextOnTheFilterField.apply(this, arguments);
				},
				iPressKeyOnFilterFieldWithLabel: function(sLabelName, sValue) {
					return fieldActions.iPressKeyOnFilterFieldWithLabel.apply(this, arguments);
				},
				iPressOnTheFilterFieldValueHelpButton: function(sLabelName) {
					return fieldActions.iPressOnTheFilterFieldValueHelpButton.apply(this, arguments);
				}
            },
            assertions: {
				iShouldSeeTheFilterFieldWithValues: function(sLabelName, oValues) {
					return fieldAssertions.iShouldSeeTheFilterFieldWithValues.call(this, sLabelName, oValues);
				}
			}
        }
    });

});
