/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"./waitForFilterField",
	"./waitForFilterFieldValueHelpButton",
	"sap/ui/events/KeyCodes"
], function(
	Opa5,
	EnterText,
	Press,
	waitForFilterField,
	waitForFilterFieldValueHelpButton,
	KeyCodes
) {
    "use strict";


	var Opa5Utils = Opa5.getUtils();

    return {
		iEnterTextOnTheFilterField: function(sLabelName, sValue, oConfig) {
			return waitForFilterField.call(this, {
				properties: {
					label: sLabelName
				},
				actions: new EnterText(oConfig ? {
					text: sValue
				} : Object.assign({
					text: sValue
				}), oConfig ),
				success: function(oFilterField) {
					Opa5.assert.ok(true, 'The text "' + sValue + '" was entered into the filter field');
				},
				errorMessage: 'The text "' + sValue + '" could not be entered into the filter field'
			});
		},

		iPressKeyOnFilterFieldWithLabel: function(sLabelName, sValue) {
			return waitForFilterField.call(this, {
				properties: {
					label: sLabelName
				},
				success: function(oFilterField) {
					var oContent = oFilterField.getAggregation("_content")[0];
					Opa5Utils.triggerKeydown(oContent.getDomRef(), KeyCodes[sValue]);
					Opa5.assert.ok(oContent, "Key '" + sValue + "' pressed on FilterField with label '" + sLabelName + "'");
				},
				errorMessage: 'The key "' + sValue + " could not be pressed on the FilterField with label '" + sLabelName + "'"
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
