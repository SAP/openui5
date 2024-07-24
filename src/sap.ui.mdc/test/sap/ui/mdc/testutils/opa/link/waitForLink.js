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
		const { text, id } = oLinkIdentifier;
		if (!(text || id)) {
			Opa5.assert.ok(id, `should have ID or Text`);
			Opa5.assert.ok(text, `should have ID or Text`);
		}

		const fnCallSuccess = function(oLink) {
			if (typeof oSettings.success === "function") {
				oSettings.success.call(this, oLink);
			}
		};

		const oOpaSettings = {
			controlType: "sap.m.Link",
			actions: oSettings.actions
		};

		if (text) {
			oOpaSettings.matchers = new PropertyStrictEquals({
				name: "text",
				value: text
			});
		}

		if (id) {
			oOpaSettings.id = id;
			oOpaSettings.success = function(oLinkControl) {
				Opa5.assert.ok(oLinkControl, `should find sap.ui.mdc.Link`);
				fnCallSuccess.call(this, oLinkControl);
			};
		} else {
			oOpaSettings.success = function(aLinkControls) {
				Opa5.assert.equal(aLinkControls.length, 1, `should find sap.ui.mdc.Link`);
				fnCallSuccess.call(this, aLinkControls[0]);
			};
		}

		return this.waitFor(oOpaSettings);
	};

});
