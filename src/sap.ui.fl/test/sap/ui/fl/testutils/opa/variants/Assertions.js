/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	'sap/base/Log',
	"sap/m/VariantManagement"
], function(
	Opa5,
	Log,
	VariantManagement
) {
	"use strict";

	return {

		/**
		 * Checks the expected variant title.
		 *
		 * @param {string} sFlVMId The fl variant management control ID
		 * @param {string} sVariantTitle The name of the expected variant
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		theVariantShouldBeDisplayed: function (sFlVMId, sVariantTitle) {
			return this.waitFor({
				id: sFlVMId,
				success: function (oVariantManagement) {
					Opa5.assert.equal(oVariantManagement.getTitle().getText(), sVariantTitle, "Expected " + sVariantTitle + " to be displayed.");
				},
				errorMessage: "VariantManagement could't be found"
			});
		},

		/**
		 * Checks the expected variant titles.
		 * Prerequisite is an open My Views popup.
		 * @param {string} sFlVMId The fl variant management control ID
		 * @param {array} aVariantNames List of the expected variants
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		theMyViewShouldContain: function (sFlVMId, aVariantNames) {
			return this.waitFor({
				id: sFlVMId + "-vm-popover-popover",
				success: function () {
					return this.waitFor({
						controlType: "sap.m.SelectList",
						id: sFlVMId + "-vm-list",
						success: function() {
							return this.waitFor({
								controlType: "sap.ui.core.Item",
								matchers: function(oItem) {
									return oItem.getId().indexOf(sFlVMId + "-vm-list-") >= 0;
								},
								success: function(aItems) {
									var aIsVariantTitle = [];
									aItems.forEach(function(oItem) { aIsVariantTitle.push(oItem.getText());});
									Opa5.assert.deepEqual(aVariantNames, aIsVariantTitle, "expected [" + aVariantNames + "] entries found");
								}
							});
						},
						errorMessage: "Did not find any variants"
					});
				},
				errorMessage: "'My Views' could not be found"
			});
		},

		/**
		 * Checks is the expected Save View dialog is open.
		 * @param {string} sFlVMId The fl variant management control ID
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		theOpenSaveViewDialog: function (sFlVMId) {
			return this.waitFor({
				id: sFlVMId + "-vm-savedialog",
				success: function (oSaveViewDialog) {
					Opa5.assert.ok(oSaveViewDialog);
				}
			});
		},

		/**
		 * Checks is the expected Manage Views dialog is open.
		 * @param {string} sFlVMId The fl variant management control ID
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		theOpenManageViewsDialog: function (sFlVMId) {
			return this.waitFor({
				id: sFlVMId + "-vm-managementdialog",
				success: function (oManageDialog) {
					Opa5.assert.ok(oManageDialog);
				}
			});
		},

		/**
		 * Checks the variants in the Manage Views dialog.
		 * Prerequisite is an open Manage Views dialog.
		 * @param {array} aVariantNames List of the expected variants
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		theOpenManageViewsDialogTitleShouldContain: function (aVariantNames) {
			return this.waitFor({
				controlType: "sap.m.ColumnListItem",
				success: function(aManageVariantItems) {
					var aIsVariantTitle = [];
					aManageVariantItems.forEach(function(oItem) {
						var oCell = oItem.getCells()[VariantManagement.COLUMN_NAME_IDX];
						if (oCell.isA("sap.m.ObjectIdentifier")) {
							aIsVariantTitle.push(oCell.getTitle());
						} else {
							aIsVariantTitle.push(oCell.getValue());
						}
					});

					Opa5.assert.deepEqual(aVariantNames, aIsVariantTitle, "expected [" + aVariantNames + "] entries found");
				},
				errorMessage: "No variant list items found"
			});
		},

		/**
		 * Checks the variants with the Favorite checkbox set in the Manage Views dialog.
		 * Prerequisite is an open Manage Views dialog.
		 * @param {array} aVariantFavorites List of the expected variants
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		theOpenManageViewsDialogFavoritesShouldContain: function (aVariantFavorites) {
			return this.waitFor({
				controlType: "sap.m.ColumnListItem",
				success: function(aManageVariantItems) {
					var aIsVariantFavorites = [];
					aManageVariantItems.forEach(function(oItem) {
						var oCell = oItem.getCells()[VariantManagement.COLUMN_FAV_IDX];
						aIsVariantFavorites.push(oCell.getSrc() === "sap-icon://favorite");
					});

					Opa5.assert.deepEqual(aVariantFavorites, aIsVariantFavorites, "expected [" + aVariantFavorites + "] states found");
				},
				errorMessage: "No variant list items found"
			});
		},

		/**
		 * Checks the variants with the Apply Automatically checkbox set in the Manage Views dialog.
		 * Prerequisite is an open Manage Views dialog.
		 * @param {array} aVariantApplayAutos List of the expected variants
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		theOpenManageViewsDialogApplyAutomaticallyShouldContain: function (aVariantApplayAutos) {
			return this.waitFor({
				controlType: "sap.m.ColumnListItem",
				success: function(aManageVariantItems) {
					var aIsVariantApplyAutos = [];
					aManageVariantItems.forEach(function(oItem) {
						var oCell = oItem.getCells()[4]; //EXEC
						aIsVariantApplyAutos.push(oCell.getSelected());
					});

					Opa5.assert.deepEqual(aVariantApplayAutos, aIsVariantApplyAutos, "expected [" + aVariantApplayAutos + "] states found");
				},
				errorMessage: "No variant list items found"
			});
		},

		/**
		 * Checks for the expected default variant.
		 * Prerequisite is an open Manage Views dialog.
		 * @param {string} sVariantName The expected default variant
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		theOpenManageViewsDialogDefaultShouldBe: function (sVariantName) {
			return this.waitFor({
				controlType: "sap.m.ColumnListItem",
				success: function(aManageVariantItems) {
					var oListItem = aManageVariantItems.filter(function(oItem) {
						var oCell = oItem.getCells()[VariantManagement.COLUMN_NAME_IDX];
						if (oCell.isA("sap.m.ObjectIdentifier")) {
							return oCell.getTitle() === sVariantName;
						}
						return oCell.getValue() === sVariantName;
					})[0];

					if (!oListItem) {
						Log.error("No variant with name " + sVariantName + " was found in 'Manage Views'");
					} else {
						var oDefault = oListItem.getCells()[3]; //DEF
						Opa5.assert.ok(oDefault.getSelected(), "the default for " + sVariantName + " was expected to be set");
					}
				},
				errorMessage: "No variant list items found"
			});
		}
	};
});