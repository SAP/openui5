/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"./Actions",
	"./Assertions"
], function(
	Opa5,
	variantActions,
	variantAssertions
) {
	"use strict";

	Opa5.createPageObjects({
		onTheVariant: {
			actions: {
				iPressOnTheVariantManagerButton: function(sVariantName) {
					return variantActions.iPressOnTheVariantManagerButton.apply(this, arguments);
				},
				iPressOnTheVariantManagerSaveAsButton: function() {
					return variantActions.iPressOnTheVariantManagerSaveAsButton.apply(this, arguments);
				},
				iSaveVariantAs: function(sVariantCurrentName, sVariantNewName) {
					return variantActions.iSaveVariantAs.apply(this, arguments);
				},
				iSelectVariant: function(sVariantName) {
					return variantActions.iSelectVariant.apply(this, arguments);
				}
            },
            assertions: {
				iShouldSeeTheVariantManagerButton: function(sText) {
					return variantAssertions.iShouldSeeTheVariantManagerButton.apply(this, arguments);
				},
				iShouldSeeTheVariantManagerPopover: function() {
					return variantAssertions.iShouldSeeTheVariantManagerPopover.apply(this, arguments);
				},
				iShouldSeeTheSaveVariantDialog: function() {
					return variantAssertions.iShouldSeeTheSaveVariantDialog.apply(this, arguments);
				}
			}
        }
    });

});
