/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"./waitForVariantManager",
	"./waitForVariantManagerOverlay",
	"../Utils"
], function(
	Opa5,
	waitForVariantManager,
	waitForVariantManagerOverlay,
	TestUtils
) {
	"use strict";

	return {

		iShouldSeeTheVariantManagerButton: function(sText) {
			return waitForVariantManager.call(this, {
				text: sText
			});
		},

		iShouldSeeTheVariantManagerPopover: function() {
			return waitForVariantManagerOverlay.call(this, {
				properties: {

					// title: "My Views"
					title: TestUtils.getTextFromResourceBundle("sap.ui.fl", "VARIANT_MANAGEMENT_VARIANTS")
				}
			});
		},

		iShouldSeeTheSaveVariantDialog: function() {
			return waitForVariantManagerOverlay.call(this, {
				controlType: "sap.m.Dialog",
				properties: {

					// title: Save View
					title: TestUtils.getTextFromResourceBundle("sap.ui.fl", "VARIANT_MANAGEMENT_SAVEDIALOG")
				},
				matchers: undefined // FIXME: default ancestor matcher does not work, but it should
			});
		}
    };
});
