/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"sap/m/VariantManagement"
], function(
	Opa5,
	Press,
	EnterText,
	PropertyStrictEquals,
	Ancestor,
	Descendant,
	VariantManagement
) {
	"use strict";

	var waitForEditableVariantItemByVariantName = function(sVariantName, oSettings) {
		return this.waitFor({
			controlType: "sap.m.ColumnListItem",
			actions: function(oEditableVariantItem) {
				var oCell = oEditableVariantItem.getCells()[VariantManagement.COLUMN_NAME_IDX];
				var bVariantFound = false;

				if (oCell.isA("sap.m.ObjectIdentifier")) {
					bVariantFound = oCell.getTitle() === sVariantName;
				} else if (oCell.isA("sap.m.Input")) {
					bVariantFound = oCell.getValue() === sVariantName;
				}

				if (bVariantFound) {
					this.waitFor({
						controlType: "sap.m.ColumnListItem",
						matchers: new Descendant(oCell, false),
						success: function(aEditableVariantItems) {
							var oEditableVariantItem = aEditableVariantItems[0];
							if (typeof oSettings.success === "function") {
								oSettings.success.call(this, oEditableVariantItem);
							}
						},
						actions: oSettings.actions ? oSettings.actions : [],
						errorMessage: "No variant list items found"
					});
				}
			}.bind(this),
			errorMessage: "No variant with name " + sVariantName + " was found in 'Manage Views'"
		});
	};

	var fIsFavoriteSelected = function(oIcon) {
		return oIcon.getSrc() === "sap-icon://favorite";
	};

	return {

		/**
		 * Presses the button for a given ID.
		 * @public
		 * @param {string} sId The control ID of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 */
		iPressButtonWithID: function(sId) {
			return this.waitFor({
				id: sId,
				controlType: "sap.m.Button",
				actions: new Press()
			});
		},

		/**
		 * Opens/Closes the My Views popup.
		 * @public
		 * @param {string} sFlVMId The fl variant management control ID.
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 */
		iOpenMyView: function (sFlVMId) {
			return this.iPressButtonWithID(sFlVMId + "-vm-trigger");
		},

		/**
		 * Opens the Save View dialog.
		 * @public
		 * @param {string} sFlVMId The fl variant management control ID
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 */
		iOpenSaveView: function (sFlVMId) {
			return this.iPressButtonWithID(sFlVMId + "-vm-saveas");
		},

		/**
		 * Opens the Manage Views dialog.
		 * @public
		 * @param {string} sFlVMId The fl variant management control ID
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 */
		iOpenManageViews: function (sFlVMId) {
			return this.iPressButtonWithID(sFlVMId + "-vm-manage");
		},

		/**
		 * Presses the Save button inside the Manage Views dialog.
		 * @public
		 * @param {string} sFlVMId The fl variant management control ID
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 */
		iPressTheManageViewsSave: function (sFlVMId) {
			return this.iPressButtonWithID(sFlVMId + "-vm-managementsave");
		},

		/**
		 * Handles the Favorite checkbox.
		 * Prerequisite is an open Manage Views dialog.
		 * @public
		 * @param {string} sVariantName The name of a variant
		 * @param {boolean} bValue The state of the Favorite checkbox
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 */
		iSetFavoriteVariant: function (sVariantName, bValue) {
			return waitForEditableVariantItemByVariantName.call(this, sVariantName, {
				actions: function(oManageVariantItem) {
					this.waitFor({
						controlType: "sap.ui.core.Icon",
						matchers: [
							new Ancestor(oManageVariantItem, false)
						],
						actions: function(oIcon) {
							if ((fIsFavoriteSelected(oIcon) && !bValue) ||
								(!fIsFavoriteSelected(oIcon) && bValue)) {
								new Press().executeOn(oIcon);
							}
						}
					});
				}.bind(this)
			});
		},

		/**
		 * Renames a variant.
		 * Prerequisite is an open Manage Views dialog.
		 * @public
		 * @param {string} sOriginalVariantName The previous name of a variant
		 * @param {string} sNewVariantName The new name of a variant
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 */
		iRenameVariant: function (sOriginalVariantName, sNewVariantName) {
			return waitForEditableVariantItemByVariantName.call(this, sOriginalVariantName, {
				actions: function(oManageVariantItem) {
					this.waitFor({
						controlType: "sap.m.Input",
						matchers: [
							new PropertyStrictEquals({
								name: "value",
								value: sOriginalVariantName
							}),
							new Ancestor(oManageVariantItem)
						],
						actions: new EnterText({
							text: sNewVariantName,
							pressEnterKey: true
						})
					});
				}.bind(this)
			});
		},

		/**
		 * Sets the default for a variant.
		 * Prerequisite is an open Manage Views dialog.
		 * @public
		 * @param {string} sVariantName The name of the new default variant
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 */
		iSetDefaultVariant: function (sVariantName) {
			return waitForEditableVariantItemByVariantName.call(this, sVariantName, {
				actions: function(oManageVariantItem) {
					this.waitFor({
						controlType: "sap.m.RadioButton",
						matchers: [
							new Ancestor(oManageVariantItem, false)
						],
						actions: new Press()
					});
				}.bind(this)
			});
		},

		/**
		 * Removes a variant.
		 * Prerequisite is an open Manage Views dialog.
		 * @public
		 * @param {string} sVariantName The name of the new default variant
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 */
		iRemoveVariant: function (sVariantName) {
			return waitForEditableVariantItemByVariantName.call(this, sVariantName, {
				actions: function(oManageVariantItem) {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new PropertyStrictEquals({
								name: "icon",
								value: "sap-icon://decline"
							}),
							new Ancestor(oManageVariantItem, false)
						],
						actions: new Press()
					});
				}.bind(this)
			});
		},

		/**
		 * Handles the Apply Automatically checkbox for a variant
		 * Prerequisite is an open Manage Views dialog.
		 * @public
		 * @param {string} sVariantName The name of the variant
		 * @param {boolean} bApplyAuto The Apply Automatically checkbox for the variant
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 */
		iApplyAutomaticallyVariant: function (sVariantName, bApplyAuto) {
			return waitForEditableVariantItemByVariantName.call(this, sVariantName, {
				actions: function(oManageVariantItem) {
					this.waitFor({
						controlType: "sap.m.CheckBox",
						matchers: [
							new Ancestor(oManageVariantItem, false)
						],
						actions: function(oCheckBox) {
							if (bApplyAuto && !oCheckBox.getSelected() ||
								!bApplyAuto && oCheckBox.getSelected()) {
								new Press().executeOn(oCheckBox);
							}
						}
					});
				}.bind(this)
			});
		},

		/**
		 * Creates a new variant.
		 * @public
		 * @param {string} sFlVMId The fl variant management control ID
		 * @param {string} sVariantTitle The name of the new variant
		 * @param {boolean} bDefault Default checkbox for the variant
		 * @param {boolean} bApplyAuto The Apply Automatically checkbox for the variant
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 */
		iCreateNewVariant: function (sFlVMId, sVariantTitle, bDefault, bApplyAuto) {
			return this.waitFor({
				id: sFlVMId + "-vm-name",
				success: function (oInput) {
					new EnterText({
						text: sVariantTitle
					}).executeOn(oInput);

					if (bDefault) {
						this.waitFor({
							id: sFlVMId + "-vm-default",
							actions: new Press()
						});
					}

					if (bApplyAuto) {
						this.waitFor({
							id: sFlVMId + "-vm-execute",
							actions: new Press()
						});
					}

					return this.waitFor({
						id: sFlVMId + "-vm-variantsave",
						actions: new Press()
					});
				},
				errorMessage: "expected input field not found"
			});
		}
	};
});