/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"./waitForFilterField",
	"sap/ui/events/KeyCodes",
	"../Utils",
	"../actions/TriggerEvent"
], function(
	Opa5,
	EnterText,
	waitForFilterField,
	KeyCodes,
	Utils,
	TriggerEvent
) {
    "use strict";

    return {
		iEnterTextOnTheFilterField: function(vIdentifier, sValue, oConfig) {
			return waitForFilterField.call(this, Utils.enhanceWaitFor(vIdentifier, {
				actions: new EnterText(oConfig ? Object.assign({
					text: sValue
				}, oConfig) : {
					text: sValue
				}),
				success: function(oFilterField) {
					Opa5.assert.ok(true, 'The text "' + sValue + '" was entered into the filter field');
				},
				errorMessage: 'The text "' + sValue + '" could not be entered into the filter field'
			}));
		},

		iPressKeyOnTheFilterField: function(vIdentifier, keyCode) {
			return waitForFilterField.call(this,  Utils.enhanceWaitFor(vIdentifier, {
				success:function(oFilterField) {
					oFilterField.focus();
					new TriggerEvent({event: "keydown", payload: {which: keyCode, keyCode: keyCode}}).executeOn(oFilterField._getContent()[0]); // doesnt work with focusdomref
					Opa5.assert.ok(oFilterField, "Key '" + keyCode + "' pressed on FilterField '" + oFilterField.getId() + "'");
				}
			}));
		},
		iOpenTheValueHelpForFilterField: function (vIdentifier) {
            return this.iPressKeyOnTheFilterField(vIdentifier, KeyCodes.F4);
        }
	};
});
