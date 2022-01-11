/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Matcher",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"../p13n/Actions",
	"../p13n/Util",
    "./waitForLink"
], function(
	Opa5,
	Matcher,
	Properties,
	Ancestor,
	Descendant,
	PropertyStrictEquals,
	Press,
	EnterText,
	p13nActions,
	p13nUtil,
    waitForLink
) {
	"use strict";

    return {
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