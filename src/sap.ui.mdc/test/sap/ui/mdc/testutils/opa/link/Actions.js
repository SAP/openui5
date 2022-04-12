/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/Press",
    "../p13n/waitForP13nButtonWithMatchers",
    "../p13n/waitForP13nDialog",
    "./waitForLink",
    "sap/ui/core/Core"
], function(
	Opa5,
	Ancestor,
	Descendant,
	PropertyStrictEquals,
	Press,
    waitForP13nButtonWithMatchers,
    waitForP13nDialog,
    waitForLink,
    oCore
) {
	"use strict";

    var oMDCBundle = oCore.getLibraryResourceBundle("sap.ui.mdc");

    return {
        iOpenThePersonalizationDialog: function(oControl, oSettings) {
            var sControlId = typeof oControl === "string" ? oControl : oControl.getId();
            return this.waitFor({
                id: sControlId,
                success: function(oControlInstance) {
                    Opa5.assert.ok(oControlInstance);

                    new Press().executeOn(oControlInstance);
                    this.waitFor({
                        controlType: "sap.ui.mdc.link.Panel",
                        success: function(aPanels) {
                            Opa5.assert.equal(aPanels.length, 1, "mdc.link.Panel found");
                            var oPanel = aPanels[0];

                            waitForP13nButtonWithMatchers.call(this, {
                                actions: new Press(),
                                matchers: [
                                    new Ancestor(oPanel, false),
                                    new PropertyStrictEquals({
                                        name: "text",
                                        value: oMDCBundle.getText("info.POPOVER_DEFINE_LINKS")
                                    })
                                ],
                                success: function() {
                                    waitForP13nDialog.call(this, {
                                        matchers: new PropertyStrictEquals({
                                            name: "title",
                                            value: oMDCBundle.getText("info.SELECTION_DIALOG_ALIGNEDTITLE")
                                        }),
                                        success:  function(oP13nDialog) {
                                            if (oSettings && typeof oSettings.success === "function") {
                                                oSettings.success.call(this, oP13nDialog);
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });
                },
                errorMessage: "Control '" + sControlId + "' not found."
            });
        },
        iPressTheLink: function(oLinkIdentifier) {
            return waitForLink.call(this, oLinkIdentifier, {
                actions: new Press()
            });
        },
        iPressLinkOnPopover: function(oLinkIdentifier, sLink) {
            return waitForLink.call(this, oLinkIdentifier, {
                actions: new Press(),
                success: function() {
                    this.waitFor({
						controlType: "sap.ui.mdc.link.Panel",
						success: function(aPanels) {
							Opa5.assert.equal(aPanels.length, 1, "mdc.link.Panel found");
							var oPanel = aPanels[0];
                            this.waitFor({
                                controlType: "sap.m.Link",
                                matchers: [
                                    new Ancestor(oPanel, false),
                                    new PropertyStrictEquals({
                                        name: "text",
                                        value: sLink
                                    })
                                ],
                                actions: new Press(),
                                success: function(aLinks) {
                                    Opa5.assert.equal(aLinks.length, 1, "link on Panel found and pressed");
                                }
                            });
                        }
                    });
                }
            });
        },
        iCloseThePopover: function() {
            this.waitFor({
                controlType: "sap.ui.mdc.link.Panel",
                success: function(aPanels) {
                    Opa5.assert.equal(aPanels.length, 1, "mdc.link.Panel found");
                    var oPanel = aPanels[0];

                    this.waitFor({
                        controlType: "sap.m.ResponsivePopover",
                        matchers: new Descendant(oPanel),
                        success: function(aResponsivePopovers) {
                            Opa5.assert.equal(aResponsivePopovers.length, 1, "sap.m.ResponsivePopover found");
                            aResponsivePopovers[0].close();
                        }
                    });
                }
            });
        }
    };
});