/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Matcher",
	"sap/ui/test/matchers/Ancestor",
    "sap/ui/test/matchers/Descendant",
    "./waitForLink"
], function(
	Opa5,
	Matcher,
	Ancestor,
    Descendant,
    waitForLink
) {
	"use strict";

    return {
        iShouldSeeAPopover: function(oLinkIdentifier) {
            return waitForLink.call(this, oLinkIdentifier, {
                success: function(oLink) {
                    this.waitFor({
                        controlType: "sap.ui.mdc.Field",
                        matchers: new Descendant(oLink, true),
                        success: function(aFields) {
                            this.waitFor({
                                controlType: "sap.m.Popover",
                                matchers: new Ancestor(aFields[0].getFieldInfo(), false),
                                success: function(aPopovers) {
                                    Opa5.assert.equal(aPopovers.length, 1, "Popover of mdc.Link found");
                                }
                            });
                        }
                    });
                }
            });
        },
        iShouldSeeLinksOnPopover: function(oLinkIdentifier, aLinks) {
            return waitForLink.call(this, oLinkIdentifier, {
                success: function() {
                    this.waitFor({
                        controlType: "sap.ui.mdc.link.Panel",
                        success: function(aPanels) {
                            Opa5.assert.equal(aPanels.length, 1, "mdc.link.Panel found");
                            var oPanel = aPanels[0];
                            var iIndex = 0;
                            var oMatcher = new Matcher();
                            oMatcher.isMatching = function(oLink) {
                                var bTextMatching = oLink.getText() === aLinks[iIndex];
                                iIndex++;
                                return bTextMatching;
                            };
                            if (aLinks.length > 0) {
                                this.waitFor({
                                    controlType: "sap.m.Link",
                                    matchers: [
                                        new Ancestor(oPanel, false),
                                        oMatcher
                                    ],
                                    success: function(aLinkControls) {
                                        Opa5.assert.equal(aLinks.length, aLinkControls.length, aLinks.length + " Links on Popover found");
                                    }
                                });
                            } else {
                                var aVisibleItems = oPanel.getItems().filter(function(oItem) {
                                    return oItem.getVisible();
                                });
                                Opa5.assert.equal(aVisibleItems.length, 0, aVisibleItems.length + " Links on Popover found");
                            }
                        }
                    });
                }
            });
        }
    };

});