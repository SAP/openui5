/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"./waitForFilterField",
	"./waitForFilterFieldValueHelpButton"
], function(
	Opa5,
	EnterText,
	Press,
	waitForFilterField,
	waitForFilterFieldValueHelpButton
) {
    "use strict";

    return {
		iEnterTextOnTheFilterField: function(sLabelName, sValue) {
			return waitForFilterField.call(this, {
				properties: {
					label: sLabelName
				},
				actions: new EnterText({
					text: sValue
				}),
				success: function(oFilterField) {
					Opa5.assert.ok(true, 'The text "' + sValue + '" was entered into the filter field');
				},
				errorMessage: 'The text "' + sValue + '" could not be entered into the filter field'
			});
		},

		iPressOnTheFilterFieldValueHelpButton: function(sLabelName) {
			return waitForFilterFieldValueHelpButton.call(this, {
				properties: {
					label: sLabelName
				},
				actions: new Press(),
				success: function(oValueHelpIconButton) {
					Opa5.assert.ok(oValueHelpIconButton, "The filter field value help button was pressed");
				},
				errorMessage: "The filter field value help button could not be press"
			});
		}
	};
});
