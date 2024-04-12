/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"./waitForMultiValueField",
	"../Utils"
], function(
	Opa5,
	EnterText,
	waitForMultiValueField,
	Utils
) {
    "use strict";

    var oActions =  {
		iEnterTextOnTheMultiValueField: function(vIdentifier, sValue) {
			return waitForMultiValueField.call(this, Utils.enhanceWaitFor(vIdentifier, {
				actions: new EnterText({
					text: sValue,
					clearTextFirst: false,
					pressEnterKey: true,
					keepFocus: true
				}),
				success: function() {
					Opa5.assert.ok(true, 'The text "' + sValue + '" was entered into the field');
				},
				errorMessage: 'The text "' + sValue + '" could not be entered into the field'
			}));
		}
	};

	return oActions;
});
