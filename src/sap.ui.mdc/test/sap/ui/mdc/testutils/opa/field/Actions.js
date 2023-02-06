/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"./waitForField",
	"../Utils",
	"sap/ui/events/KeyCodes",
	"../actions/TriggerEvent",
	'sap/ui/test/actions/Press'
], function(
	Opa5,
	EnterText,
	waitForField,
	Utils,
	KeyCodes,
	TriggerEvent,
	Press
) {
    "use strict";

    var oActions =  {
		iEnterTextOnTheField: function(vIdentifier, sValue) {
			return waitForField.call(this, Utils.enhanceWaitFor(vIdentifier, {
				actions: new EnterText({
					text: sValue
				}),
				success: function() {
					Opa5.assert.ok(true, 'The text "' + sValue + '" was entered into the field');
				},
				errorMessage: 'The text "' + sValue + '" could not be entered into the field'
			}));
		},
		iPressKeyOnTheField: function(vIdentifier, keyCode) {
			return waitForField.call(this, Utils.enhanceWaitFor(vIdentifier, {
				success:function(oField) {
					oField.focus();
					new TriggerEvent({event: "keydown", payload: {which: keyCode, keyCode: keyCode}}).executeOn(oField._getContent()[0]); // doesnt work with focusdomref
					Opa5.assert.ok(oField, "Key '" + keyCode + "' pressed on FilterField '" + oField.getId() + "'");
				}
			}));
		},
		iOpenTheValueHelpForField: function (vIdentifier) {
            return oActions.iPressKeyOnTheField.call(this, vIdentifier, KeyCodes.F4);
        }
	};

	return oActions;
});
