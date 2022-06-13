/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"./waitForField",
	"./waitForFieldValueHelpButton"
], function(
	Opa5,
	EnterText,
	Press,
	waitForField,
	waitForFieldValueHelpButton
) {
    "use strict";

    return {
		iEnterTextOnTheField: function(sId, sValue) {
			return waitForField.call(this, {
				properties: {
					id: sId
				},
				actions: new EnterText({
					text: sValue
				}),
				success: function(oFilterField) {
					Opa5.assert.ok(true, 'The text "' + sValue + '" was entered into the field');
				},
				errorMessage: 'The text "' + sValue + '" could not be entered into the field'
			});
		},

		//TODO
		iPressOnTheFieldValueHelpButton: function(sId) {
			return waitForFieldValueHelpButton.call(this, {
				properties: {
					id: sId
				},
				actions: new Press(),
				success: function(oValueHelpIconButton) {
					Opa5.assert.ok(oValueHelpIconButton, "The field value help button was pressed");
				},
				errorMessage: "The field value help button could not be press"
			});
		}
	};
});
