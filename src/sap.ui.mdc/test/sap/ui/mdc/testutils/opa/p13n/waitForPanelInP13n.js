/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
    "sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant"
], function(
	Opa5,
    Properties,
    Ancestor,
    Descendant
) {
	"use strict";

	return function waitForPanelInP13n(oSettings) {
        var aMatchers = [];
        if (oSettings.groupName) {
            aMatchers.push(
                new Properties({
                    text: oSettings.groupName
                })
            );
        }
		return this.waitFor({
            controlType: oSettings.modal ? "sap.m.Dialog" : "sap.m.ResponsivePopover",
            success: function(aPopovers) {
                var oPopover = aPopovers[0];
                Opa5.assert.ok(oPopover,"P13n Container found");
                aMatchers.push(new Ancestor(oPopover));
                this.waitFor({
                    controlType: "sap.m.Title",
                    matchers: aMatchers,
                    success: function(aLabels){
                        this.waitFor({
                            controlType: "sap.m.Panel",
                            matchers: new Descendant(aLabels[0]),

                            success: function(aPanels) {
                                if (typeof oSettings.success === "function") {
                                    oSettings.success.call(this, aPanels[0]);
                                }
                            }
                        });
                    }
                });
            }
        });
    };


});
