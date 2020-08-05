/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"./waitForVariantManager",
	"./waitForVariantManagerOverlay",
	"sap/ui/mdc/integration/testlibrary/Util"
], function(
	Opa5,
	waitForVariantManager,
	waitForVariantManagerOverlay,
	TestUtil
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
					title: TestUtil.getTextFromResourceBundle("sap.ui.fl", "VARIANT_MANAGEMENT_VARIANTS")
				}
			});
		},

		iShouldSeeTheSaveVariantDialog: function() {
			return waitForVariantManagerOverlay.call(this, {
				controlType: "sap.m.Dialog",
				properties: {

					// title: Save View
					title: TestUtil.getTextFromResourceBundle("sap.ui.fl", "VARIANT_MANAGEMENT_SAVEDIALOG")
				},
				matchers: undefined // FIXME: default ancestor matcher does not work, but it should
			});
		}
    };
});
