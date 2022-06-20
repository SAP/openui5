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
		onTheMDCField: {
			actions: {
                iEnterTextOnTheField: function(sId, oValue) {
                    return fieldActions.iEnterTextOnTheField.apply(this, arguments);
                }
            },
            assertions: {
                iShouldSeeTheFieldWithValues: function(sId, oValues) {
                    return fieldAssertions.iShouldSeeTheFieldWithValues.apply(this, arguments);
                }

			}
        }
    });

});
