/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"./Actions",
	"./Assertions"
], function(
	Opa5,
	Actions,
	Assertions
) {
	"use strict";

	/**
	 * @namespace onFlVariantManagement
	 */
	Opa5.createPageObjects({
		onFlVariantManagement: {
			actions: {

				/**
				 * Opens/Closes the My Views popup.
				 * @memberof onFlVariantManagement
				 * @public
				 * @param {string} sFlVMId The fl variant management control ID.
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 */
				iOpenMyView: function (sFlVMId) {
					return Actions.iPressButtonWithID.call(this, sFlVMId + "-vm-trigger");
				},

				/**
				 * Opens the Save View dialog.
				 * @memberof onFlVariantManagement
				 * @public
				 * @param {string} sFlVMId The fl variant management control ID
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 */
				iOpenSaveView: function (sFlVMId) {
					return Actions.iPressButtonWithID.call(this, sFlVMId + "-vm-saveas");
				},

				/**
				 * Opens the Manage Views dialog.
				 * @memberof onFlVariantManagement
				 * @public
				 * @param {string} sFlVMId The fl variant management control ID
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 */
				iOpenManageViews: function (sFlVMId) {
					return Actions.iPressButtonWithID.call(this, sFlVMId + "-vm-manage");
				},

				/**
				 * Presses the Save button inside the Manage Views dialog.
				 * @memberof onFlVariantManagement
				 * @public
				 * @param {string} sFlVMId The fl variant management control ID
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 */
				iPressTheManageViewsSave: function (sFlVMId) {
					return Actions.iPressButtonWithID.call(this, sFlVMId + "-vm-managementsave");
				},

				/**
				 * Presses the Cancel button inside the Manage Views dialog.
				 * @memberof onFlVariantManagement
				 * @public
				 * @param {string} sFlVMId The fl variant management control ID
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 */
				iPressTheManageViewsCancel: function (sFlVMId) {
					return Actions.iPressButtonWithID.call(this, sFlVMId + "-vm-managementcancel");
				},

				/**
				 * Handles the Favorite checkbox.
				 * Prerequisite is an open Manage Views dialog.
				 * @memberof onFlVariantManagement				 *
				 * @public
				 * @param {string} sVariantName The name of a variant
				 * @param {boolean} bValue The state of the Favorite checkbox
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 */
				iSetFavoriteVariant: function (sVariantName, bValue) {
					return Actions.iSetFavoriteVariant.call(this, sVariantName, bValue);
				},

				/**
				 * Renames a variant.
				 * Prerequisite is an open Manage Views dialog.
				 * @memberof onFlVariantManagement
				 * @public
				 * @param {string} sOriginalVariantName The previous name of a variant
				 * @param {string} sNewVariantName The new name of a variant
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 */
				iRenameVariant: function (sOriginalVariantName, sNewVariantName) {
					return Actions.iRenameVariant.call(this, sOriginalVariantName, sNewVariantName);
				},

				/**
				 * Sets the default for a variant.
				 * Prerequisite is an open Manage Views dialog.
				 * @memberof onFlVariantManagement
				 * @public
				 * @param {string} sVariantName The name of the new default variant
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 */
				iSetDefaultVariant: function (sVariantName) {
					return Actions.iSetDefaultVariant.call(this, sVariantName);
				},

				/**
				 * Removes a variant.
				 * Prerequisite is an open Manage Views dialog.
				 * @memberof onFlVariantManagement
				 * @public
				 * @param {string} sVariantName The name of the new default variant
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 */
				iRemoveVariant: function (sVariantName) {
					return Actions.iRemoveVariant.call(this, sVariantName);
				},

				/**
				 * Handles the Apply Automatically checkbox for a variant
				 * Prerequisite is an open Manage Views dialog.
				 * @memberof onFlVariantManagement
				 * @public
				 * @param {string} sVariantName The name of the variant
				 * @param {boolean} bApplyAuto The Apply Automatically checkbox for the variant
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 */
				iApplyAutomaticallyVariant: function (sVariantName, bApplyAuto) {
					return Actions.iApplyAutomaticallyVariant.call(this, sVariantName, bApplyAuto);
				},

				/**
				 * Creates a new variant.
				 * @memberof onFlVariantManagement
				 * @public
				 * @param {string} sFlVMId The fl variant management control ID
				 * @param {string} sVariantTitle The name of the new variant
				 * @param {boolean} bDefault Default checkbox for the variant
				 * @param {boolean} bApplyAuto The Apply Automatically for the variant
				 * @param {boolean} bPublic The Public information for the variant
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 */
				iCreateNewVariant: function (sFlVMId, sVariantTitle, bDefault, bApplyAuto, bPublic) {
					return Actions.iCreateNewVariant.call(this, sFlVMId, sVariantTitle, bDefault, bApplyAuto, bPublic);
				}
			},
			assertions: {

				/**
				 * Checks the expected variant title.
				 * @memberof onFlVariantManagement
				 * @param {string} sFlVMId The fl variant management control ID
				 * @param {string} sVariantTitle The name of the expected variant
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 * @public
				 */
				theVariantShouldBeDisplayed: function (sFlVMId, sVariantTitle) {
					return Assertions.theVariantShouldBeDisplayed.call(this, sFlVMId, sVariantTitle);
				},

				/**
				 * Checks the expected variant titles.
				 * Prerequisite is an open My Views popup.
				 * @memberof onFlVariantManagement
				 * @param {string} sFlVMId The fl variant management control ID
				 * @param {array} aVariantNames List of the expected variants
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 * @public
				 */
				theMyViewShouldContain: function (sFlVMId, aVariantNames) {
					return Assertions.theMyViewShouldContain.call(this, sFlVMId, aVariantNames);
				},

				/**
				 * Checks is the expected Save View dialog is open.
				 * @memberof onFlVariantManagement
				 * @param {string} sFlVMId The fl variant management control ID
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 * @public
				 */
				theOpenSaveViewDialog: function (sFlVMId) {
					return Assertions.theOpenDialog.call(this, sFlVMId + "-vm-savedialog");
				},

				/**
				 * Checks is the expected Manage Views dialog is open.
				 * @memberof onFlVariantManagement
				 * @param {string} sFlVMId The fl variant management control ID
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 * @public
				 */
				theOpenManageViewsDialog: function (sFlVMId) {
					return Assertions.theOpenDialog.call(this, sFlVMId + "-vm-managementdialog");
				},

				/**
				 * Checks the variants in the Manage Views dialog.
				 * Prerequisite is an open Manage Views dialog.
				 * @memberof onFlVariantManagement
				 * @param {array} aVariantNames List of the expected variants
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 * @public
				 */
				theOpenManageViewsDialogTitleShouldContain: function (aVariantNames) {
					return Assertions.theOpenManageViewsDialogTitleShouldContain.call(this, aVariantNames);
				},

				/**
				 * Checks the variants with the Favorite checkbox set in the Manage Views dialog.
				 * Prerequisite is an open Manage Views dialog.
				 * @memberof onFlVariantManagement
				 * @param {array} aVariantFavorites List of the expected variants
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 * @public
				 */
				theOpenManageViewsDialogFavoritesShouldContain: function (aVariantFavorites) {
					return Assertions.theOpenManageViewsDialogFavoritesShouldContain.call(this, aVariantFavorites);
				},

				/**
				 * Checks the variants with the Apply Automatically checkbox set in the Manage Views dialog.
				 * Prerequisite is an open Manage Views dialog.
				 * @memberof onFlVariantManagement
				 * @param {array} aVariantApplayAutos List of the expected variants
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 * @public
				 */
				theOpenManageViewsDialogApplyAutomaticallyShouldContain: function (aVariantApplayAutos) {
					return Assertions.theOpenManageViewsDialogApplyAutomaticallyShouldContain.call(this, aVariantApplayAutos);
				},

				/**
				 * Checks the variants for its sharing information.
				 * Prerequisite is an open Manage Views dialog.
				 * @memberof onFlVariantManagement
				 * @param {array} aVariantSharing List of the expected sharing information of the variants
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 * @public
				 */
				theOpenManageViewsDialogSharingShouldContain: function (aVariantSharing) {
					return Assertions.theOpenManageViewsDialogSharingShouldContain.call(this, aVariantSharing);
				},

				/**
				 * Checks for the expected default variant.
				 * Prerequisite is an open Manage Views dialog.
				 * @memberof onFlVariantManagement
				 * @param {string} sVariantName The expected default variant
				 * @returns {Promise} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
				 * @public
				 */
				theOpenManageViewsDialogDefaultShouldBe: function (sVariantName) {
					return Assertions.theOpenManageViewsDialogDefaultShouldBe.call(this, sVariantName);
				}
			}
		}
	});
});
