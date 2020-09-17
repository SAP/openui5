/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"./waitForValueHelpConditionsColumnListItem",
	"./waitForValueHelpOKButton"
], function(
	Opa5,
	Press,
	waitForValueHelpConditionsColumnListItem,
	waitForValueHelpOKButton
) {
    "use strict";

    return {

		iSelectTheValueHelpCondition: function(aValues) {
			return waitForValueHelpConditionsColumnListItem.call(this, {
				values: aValues,
				actions: new Press(),
				success: function(oConditionColumnListItem) {
					Opa5.assert.ok(true, "The column list item condition inside the value help dialog was pressed");
				}
			});
		},

		iPressOnTheValueHelpOKButton: function() {
			return waitForValueHelpOKButton.call(this, {
				actions: new Press(),
				success: function(oOKButton) {
					Opa5.assert.ok(true, "The OK button inside the value help dialog was pressed");
				}
			});
		}
	};
});
