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

    var oActions =  {
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
					new TriggerEvent({event: "keydown", payload: {which: keyCode, keyCode: keyCode}}).executeOn(oFilterField.getCurrentContent()[0]); // doesnt work with focusdomref
					Opa5.assert.ok(oFilterField, "Key '" + keyCode + "' pressed on FilterField '" + oFilterField.getId() + "'");
				}
			}));
		},
		iPressOnTheFilterField: function(vIdentifier) {
			return waitForFilterField.call(this, Utils.enhanceWaitFor(vIdentifier, {
				success:function(oField) {
					var oTarget = oField.getCurrentContent()[0];
					oField.focus();
					new TriggerEvent({event: "tap"}).executeOn(oTarget); // doesnt work with focusdomref
					Opa5.assert.ok(oField, "tap event on Field '" + oField.getId() + "' triggered.");
				}
			}));
		},
		iOpenTheValueHelpForFilterField: function (vIdentifier) {
            return oActions.iPressKeyOnTheFilterField.call(this, vIdentifier, KeyCodes.F4);
		},

		iNavigateOnTheFilterField: function(vIdentifier, keyCode) { // TODO: use key code or some step to define arrow key, pageUp....
			return waitForFilterField.call(this,  Utils.enhanceWaitFor(vIdentifier, {
				actions: (oFilterField) => {
					oFilterField._oOldNavigateCondition = oFilterField._oNavigateCondition;
					oFilterField.focus();
					new TriggerEvent({event: "keydown", payload: {which: keyCode, keyCode: keyCode}}).executeOn(oFilterField.getCurrentContent()[0]); // doesnt work with focusdomref
				},
				success: (oFilterField) => {
					waitForFilterField.call(this, Utils.enhanceWaitFor(oFilterField.getId(), {
						matchers: (oFilterField) => {
							if (oFilterField._oOldNavigateCondition !== oFilterField._oNavigateCondition) { // TODO: what about if end reached?
								return true;
							}
							return false;
						},
						success:(oFilterField) => {
							Opa5.assert.ok(oFilterField, "Keyboard navigation on Field '" + oFilterField.getId() + "' executed.");
						}
					}));
				}
			}));
        }
	};

	return oActions;
});
