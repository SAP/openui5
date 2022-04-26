sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/matchers/Ancestor",
    "sap/ui/test/matchers/PropertyStrictEquals",
    "sap/ui/test/actions/Press",
    "./Util"
], function (Opa5, Ancestor, PropertyStrictEquals, Press, Util) {
	"use strict";

    return {
        iOpenTheValueHelpForField: function(oField) {
            var sControlId = typeof oField === "string" ? oField : oField.getId();
            return this.waitFor({
                id: sControlId,
                success: function(oField) {
                    this.waitFor({
                        controlType: "sap.ui.core.Icon",
                        matchers: new Ancestor(oField, false),
                        success: function(aIcons) {
                            Opa5.assert.equal(aIcons.length, 1, "ValueHelp icon found.");
                            new Press().executeOn(aIcons[0]);
                        }
                    });
                }
            });
        },
        iCloseTheValueHelpDialog: function(bCancel) {
            return this.waitFor({
                controlType: "sap.ui.mdc.ValueHelp",
                success: function(aFieldValueHelps) {
                    Opa5.assert.equal(aFieldValueHelps.length, 1, "sap.ui.mdc.ValueHelp found.");
                    this.waitFor({
                        controlType: "sap.m.Dialog",
                        matchers: new Ancestor(aFieldValueHelps[0]),
                        success: function(aVHDialogs) {
                            Opa5.assert.equal(aVHDialogs.length, 1, "ValueHelp dialog found.");
                            this.waitFor({
                                controlType: "sap.m.Button",
                                matchers: [
                                    new Ancestor(aVHDialogs[0], false),
                                    new PropertyStrictEquals({
                                        name: "text",
                                        value: bCancel ? Util.texts.cancel : Util.texts.ok
                                    })
                                ],
                                actions: new Press()
                           });
                        }
                    });
                }
            });
        }
    };
});