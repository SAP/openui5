/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_pick",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState"
], function(
	_pick,
	Applier,
	Reverter,
	VariantManagementState
) {
	"use strict";

	/**
	 * Returns the map with all changes to be reverted and applied when switching variants.
	 *
	 * @param {object} mPropertyBag - Additional properties for variant switch
	 * @param {string} mPropertyBag.vmReference - Variant management ID
	 * @param {string} mPropertyBag.currentVReference - The ID of the currently used variant
	 * @param {string} mPropertyBag.newVReference - ID of the newly selected variant
	 *
	 * @typedef {object} sap.ui.fl.variants.SwitchChanges
	 * @property {array} changesToBeReverted - Array of changes to be reverted
	 * @property {array} changesToBeApplied - Array of changes to be applied
	 *
	 * @returns {sap.ui.fl.variants.SwitchChanges} Map containing all changes to be reverted and all new changes
	 * @private
	 * @ui5-restricted
	 */
	function getControlChangesForVariantSwitch(mPropertyBag) {
		var aCurrentVariantChanges = VariantManagementState.getControlChangesForVariant(
			Object.assign(
				_pick(mPropertyBag, ["vmReference", "variantsMap", "reference"]), {
					vReference: mPropertyBag.currentVReference
				}
			)
		);
		var aNewChanges = VariantManagementState.getControlChangesForVariant(
			Object.assign(
				_pick(mPropertyBag, ["vmReference", "variantsMap", "reference"]), {
					vReference: mPropertyBag.newVReference
				}
			)
		);

		var aRevertChanges = [];
		if (aNewChanges.length > 0) {
			aRevertChanges = aCurrentVariantChanges.slice();
			aCurrentVariantChanges.some(function(oChange) {
				if (aNewChanges[0] && oChange.getId() === aNewChanges[0].getId()) {
					aNewChanges.shift();
					aRevertChanges.shift();
				} else {
					return true;
				}
			});
		} else {
			aRevertChanges = aCurrentVariantChanges;
		}

		var mSwitches = {
			changesToBeReverted: aRevertChanges.reverse(),
			changesToBeApplied: aNewChanges
		};

		return mSwitches;
	}

	/**
	 * Provides functionality to switch variants in a variants map. See also {@link sap.ui.fl.variants.VariantManagement}.
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.controlVariants.Switcher
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	var Switcher = {
		/**
		 * Switches variants.
		 *
		 * @param {object} mPropertyBag - Property Bag
		 * @param {string} mPropertyBag.vmReference - Variant management reference
		 * @param {string} mPropertyBag.reference - Flex reference
		 * @param {string} mPropertyBag.newVReference - Variant reference to be switched to
		 * @param {string} mPropertyBag.currentVReference - Variant reference to be switched from
		 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App component
		 *
		 * @returns {Promise} Resolves after variant has been switched
		 * @private
		 * @ui5-restricted
		 */
		async switchVariant(mPropertyBag) {
			var mChangesToBeSwitched = getControlChangesForVariantSwitch(mPropertyBag);

			await Reverter.revertMultipleChanges(mChangesToBeSwitched.changesToBeReverted, mPropertyBag);
			await Applier.applyMultipleChanges(mChangesToBeSwitched.changesToBeApplied, mPropertyBag);
			VariantManagementState.setCurrentVariant(mPropertyBag);
		}

	};
	return Switcher;
});