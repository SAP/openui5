/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/actions/Press",
	"../p13n/waitForP13nButtonWithMatchers",
	"../p13n/waitForP13nDialog",
	"../p13n/Util",
	"sap/ui/core/Core"
], function(
	Opa5,
	Properties,
	Ancestor,
	Press,
	waitForP13nButtonWithMatchers,
	waitForP13nDialog,
	P13nUtil,
	oCore
) {
	"use strict";

	var oMDCBundle = oCore.getLibraryResourceBundle("sap.ui.mdc");

    return {
        iOpenThePersonalizationDialog: function(oControl, oSettings) {
            var sControlId = typeof oControl === "string" ? oControl : oControl.getId();
            var aDialogMatchers = [];
            var aButtonMatchers = [];
            return this.waitFor({
                id: sControlId,
                success: function(oControlInstance) {
                    Opa5.assert.ok(oControlInstance);

                    aButtonMatchers.push(new Ancestor(oControlInstance));
                    aDialogMatchers.push(new Ancestor(oControlInstance, false));

                    // Add matcher for p13n button icon
                    aButtonMatchers.push(new Properties({
                        icon: P13nUtil.icons.settings
                    }));
                    aDialogMatchers.push(new Properties({
                        title: oMDCBundle.getText("p13nDialog.VIEW_SETTINGS")
                    }));

                    waitForP13nButtonWithMatchers.call(this, {
                        actions: new Press(),
                        matchers: aButtonMatchers,
                        success: function() {
                            waitForP13nDialog.call(this, {
                                matchers: aDialogMatchers,
                                success:  function(oP13nDialog) {
                                    if (oSettings && typeof oSettings.success === "function") {
                                        oSettings.success.call(this, oP13nDialog);
                                    }
                                }
                            });
                        },
                        errorMessage: "Control '" + sControlId + "' has no P13n button"
                    });
                },
                errorMessage: "Control '" + sControlId + "' not found."
            });
        }
    };

});