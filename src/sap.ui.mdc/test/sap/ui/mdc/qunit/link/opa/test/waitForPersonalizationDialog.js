/*!
 * ${copyright}
 */
sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/matchers/PropertyStrictEquals",
    "test-resources/sap/ui/mdc/qunit/link/opa/test/Util"
], function(Opa5, PropertyStrictEquals, TestUtil) {
    "use strict";

    return function waitForPersonalizationDialog(oSettings) {
        const sTitle = TestUtil.getTextFromResourceBundle("sap.ui.mdc", "info.SELECTION_DIALOG_ALIGNEDTITLE");

        oSettings = oSettings || {};
        oSettings.errorMessage = oSettings.errorMessage || "No sap.m.Dialog with title '" + sTitle + "' found";

        return this.waitFor({
            controlType: "sap.m.Dialog",
            matchers: new PropertyStrictEquals({
                name: "title",
                value: sTitle
            }),
            actions: oSettings.actions ? oSettings.actions : [],
            success: function(aPersonalizationDialog) {
                if (typeof oSettings.success === "function") {
					const oP13nDialog = aPersonalizationDialog[0];
					oSettings.success.call(this, oP13nDialog);
				}
            }
        });
    };

});