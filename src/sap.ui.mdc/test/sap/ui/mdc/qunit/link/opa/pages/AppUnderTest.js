/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/test/Opa5",
    "sap/ui/test/matchers/Ancestor",
    "sap/ui/test/matchers/PropertyStrictEquals",
    "sap/ui/test/matchers/Properties",
    "sap/ui/test/actions/Press",
    "testutils/opa/actions/OpenContextMenu"
], function (Opa5, Ancestor, PropertyStrictEquals, Properties, Press, OpenContextMenu) {
    "use strict";

    Opa5.createPageObjects({
		onTheAppUnderTest: {
			actions: {
                iPressOnStartRtaButton: function() {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        matchers: new PropertyStrictEquals({
                            name: "icon",
                            value: "sap-icon://wrench"
                        }),
                        actions: new Press()
                    });
                },
                iWaitUntilTheBusyIndicatorIsGone: function(sId) {
                    return this.waitFor({
                        id: sId,
                        check: function(oRootView) {
                            return !!oRootView && oRootView.getBusy() === false;
                        },
                        success: function() {
                            Opa5.assert.ok(true, "the App is not busy anymore");
                        },
                        errorMessage: "The app is still busy.."
                    });
                },
                iOpenContextMenuOfLink: function(sLinkText) {
                    return this.waitFor({
                        controlType: "sap.m.Link",
                        matchers: new PropertyStrictEquals({
                            name: "text",
                            value: sLinkText
                        }),
                        success: function(aLinks) {
                            Opa5.assert.equal(aLinks.length, 1, "Link found");
                            var oLink = aLinks[0];
                            this.waitFor({
                                controlType: "sap.ui.dt.ElementOverlay",
                                matchers: function(oElementOverlay) {
                                    return oElementOverlay.getElementInstance().getId() === oLink.getParent().getId();
                                },
                                actions: [
                                    new Press(),
                                    new OpenContextMenu()
                                ],
                                success: function(aElementOverlays) {
                                    Opa5.assert.equal(aElementOverlays.length, 1, "ElementOverlay found");
                                }
                            });
                        }
                    });
                }
            }
        }
    });
});