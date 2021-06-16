/*!
 * ${copyright}
 */
sap.ui.define([
    "sap/ui/test/matchers/Matcher",
    "sap/ui/test/matchers/Ancestor"
], function(Matcher, Ancestor) {
    "use strict";


    return function waitForSelectWithSelectedTextOnPanel(sSelectedItemText, oPanel, oSettings) {

        oSettings = oSettings || {};

        oSettings.errorMessage = oSettings.errorMessage || "No sap.m.Select with selected text '" + sSelectedItemText + "' found";

        var oMatcher = new Matcher();
        oMatcher.isMatching = function(oControl) {
            return oControl.getSelectedItem().getText() === sSelectedItemText;
        };

        return this.waitFor({
            controlType: "sap.m.Select",
            matchers: [
                oMatcher,
                new Ancestor(oPanel, false)
            ],
            success: function(aSelects) {
                if (oSettings.success) {
                    oSettings.success.call(this, aSelects[0]);
                }
            },
            actions: oSettings.actions ? oSettings.actions : [],
            errorMessage: oSettings.errorMessage
        });
    };

});