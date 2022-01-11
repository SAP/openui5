/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
    "sap/ui/test/matchers/PropertyStrictEquals"
], function(
	Opa5,
    PropertyStrictEquals
) {
	"use strict";

	return function waitForLink(oLinkIdentifier, oSettings) {
        var sText = oLinkIdentifier.text;
        var sId = oLinkIdentifier.id;
        Opa5.assert.ok(sText || sId, "LinkIdentifier correct Text: '" + sText + "' - ID: '" + sId + "'");
        var fnCallSuccess = function(oLink) {
            if (typeof oSettings.success === "function") {
                oSettings.success.call(this, oLink);
            }
        };

        var oOpaSettings = {
            controlType: "sap.m.Link",
            actions: oSettings.actions
        };

        if (sText) {
            oOpaSettings.matchers = new PropertyStrictEquals({
                name: "text",
                value: sText
            });
        }

        if (sId) {
            oOpaSettings.id = sId;
            oOpaSettings.success = function(oLinkControl) {
                Opa5.assert.ok(oLinkControl, "sap.ui.mdc.Link found");
                fnCallSuccess.call(this, oLinkControl);
            };
        } else {
            oOpaSettings.success = function(aLinkControls) {
                Opa5.assert.equal(aLinkControls.length, 1, "sap.ui.mdc.Link found");
                fnCallSuccess.call(this, aLinkControls[0]);
            };
        }

        return this.waitFor(oOpaSettings);
    };
});
