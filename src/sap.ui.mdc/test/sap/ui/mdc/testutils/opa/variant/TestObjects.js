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

	/**
	 * @namespace onTheMDCVariant
	 */
	Opa5.createPageObjects({
		onTheMDCVariant: {
			actions: {
				/**
				 * OPA5 test action
				 * @memberof onTheMDCVariant
				 * @method iPressOnTheVariantManagerButton
				 * @param {string} sVariantName Name of the current variant
				 * @returns {Promise} OPA waitFor
				 */
				iPressOnTheVariantManagerButton: function(sVariantName) {
					return variantActions.iPressOnTheVariantManagerButton.apply(this, arguments);
				},
				/**
				 * OPA5 test action
				 * @memberof onTheMDCVariant
				 * @method iPressOnTheVariantManagerSaveAsButton
				 * @returns {Promise} OPA waitFor
				 */
				iPressOnTheVariantManagerSaveAsButton: function() {
					return variantActions.iPressOnTheVariantManagerSaveAsButton.apply(this, arguments);
				},
				/**
				 * OPA5 test action
				 * @memberof onTheMDCVariant
				 * @method iSaveVariantAs
				 * @param {string} sVariantCurrentName Name of the current variant
				 * @param {string} sVariantNewName Name of the variant which is to saved
				 * @returns {Promise} OPA waitFor
				 */
				iSaveVariantAs: function(sVariantCurrentName, sVariantNewName) {
					return variantActions.iSaveVariantAs.apply(this, arguments);
				},
				/**
				 * OPA5 test action
				 * @memberof onTheMDCVariant
				 * @method iSelectVariant
				 * @param {string} sVariantName Name of the variant which is to be selected
				 * @returns {Promise} OPA waitFor
				 */
				iSelectVariant: function(sVariantName) {
					return variantActions.iSelectVariant.apply(this, arguments);
				}
			},
			assertions: {
				/**
				 * OPA5 test assertion
				 * @memberof onTheMDCVariant
				 * @method iShouldSeeTheVariantManagerButton
				 * @param {string} sText Text property of the VariantManager button
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeTheVariantManagerButton: function(sText) {
					return variantAssertions.iShouldSeeTheVariantManagerButton.apply(this, arguments);
				},
				/**
				 * OPA5 test assertion
				 * @memberof onTheMDCVariant
				 * @method iShouldSeeTheVariantManagerPopover
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeTheVariantManagerPopover: function() {
					return variantAssertions.iShouldSeeTheVariantManagerPopover.apply(this, arguments);
				},
				/**
				 * OPA5 test assertion
				 * @memberof onTheMDCVariant
				 * @method iShouldSeeTheSaveVariantDialog
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeTheSaveVariantDialog: function() {
					return variantAssertions.iShouldSeeTheSaveVariantDialog.apply(this, arguments);
				}
			}
		}
	});

});
