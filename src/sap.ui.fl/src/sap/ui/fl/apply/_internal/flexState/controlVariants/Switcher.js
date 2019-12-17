/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/includes",
	"sap/base/util/restricted/_pick",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/changes/Reverter"
], function(
	includes,
	_pick,
	VariantManagementState,
	Reverter
) {
	"use strict";

	/**
	 * Returns the map with all changes to be reverted and applied when switching variants.
	 *
	 * @param {object} mPropertyBag - Additional properties for variant switch
	 * @param {string} mPropertyBag.vmReference - Variant management ID
	 * @param {string} mPropertyBag.currentVReference - The ID of the currently used variant
	 * @param {string} mPropertyBag.newVReference - ID of the newly selected variant
	 * @param {object} mPropertyBag.changesMap - Changes inside the current changes map
	 *
	 * @typedef {object} sap.ui.fl.variants.SwitchChanges
	 * @property {array} changesToBeReverted - Array of changes to be reverted
	 * @property {array} changesToBeApplied - Array of changes to be applied
	 *
	 * @returns {sap.ui.fl.variants.SwitchChanges} Map containing all changes to be reverted and all new changes
	 * @private
	 * @ui5-restricted
	 */
	function _getChangesForVariantSwitch(mPropertyBag) {
		var aCurrentVariantChanges = VariantManagementState.getVariantChanges(
			Object.assign(
				_pick(mPropertyBag, ["vmReference", "variantsMap"]), {
					changeInstance: true,
					vReference: mPropertyBag.currentVReference
				}
			)
		);
		var aCurrentChangesKeys = aCurrentVariantChanges.map(function(oCurrentVariantChange) {
			return oCurrentVariantChange.getId();
		});
		var aMapChanges = Object.keys(mPropertyBag.changesMap).reduce(
			function (aControlChanges, sControlId) {
				return aControlChanges.concat(mPropertyBag.changesMap[sControlId]);
			}, []);

		var aFilteredChangesFromMap = aMapChanges.filter(function (oChangeInMap) {
			return includes(aCurrentChangesKeys, oChangeInMap.getId());
		});

		var aNewChanges = VariantManagementState.getVariantChanges(
			Object.assign(
				_pick(mPropertyBag, ["vmReference", "variantsMap"]), {
					changeInstance: true,
					vReference: mPropertyBag.newVReference
				}
			)
		);

		var aRevertChanges = [];
		if (aNewChanges.length > 0) {
			aRevertChanges = aFilteredChangesFromMap.slice();
			aFilteredChangesFromMap.some(function (oChange) {
				if (aNewChanges[0] && oChange.getId() === aNewChanges[0].getId()) {
					aNewChanges.shift();
					aRevertChanges.shift();
				} else {
					return true;
				}
			});
		} else {
			aRevertChanges = aFilteredChangesFromMap;
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
	 * @namespace sap.ui.fl.apply.api.apply._internal.flexState.controlVariants.Switcher
	 * @experimental Since 1.74
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	var Switcher = {
		/**
		 * Switches variants.
		 *
		 * @param {object} mPropertyBag
		 * @param {sap.ui.fl.FlexController} mPropertyBag.flexController - Flex controller
		 * @param {string} mPropertyBag.vmReference - Variant management reference
		 * @param {string} mPropertyBag.newVReference - Variant reference to be switched to
		 * @param {string} mPropertyBag.currentVReference - Variant reference to be switched from
		 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App component
		 * @param {boolean} [mPropertyBag.changeInstance] <code>true</code> if each change has to be an instance of <code>sap.ui.fl.Change</code>
		 *
		 * @returns {Promise} Resolves after variant has been switched
		 * @private
		 * @ui5-restricted
		 */
		switchVariant: function (mPropertyBag) {
			//TODO: should be a function in FlexState e.g. getUIChanges()
			mPropertyBag.changesMap = mPropertyBag.flexController._oChangePersistence.getChangesMapForComponent().mChanges;
			mPropertyBag.variantsMap = VariantManagementState.getContent({reference: mPropertyBag.flexController.getComponentName()});
			var mChangesToBeSwitched = _getChangesForVariantSwitch(mPropertyBag);

			return Reverter.revertMultipleChanges(mChangesToBeSwitched.changesToBeReverted, mPropertyBag)
			//TODO: apply variantChanges() should be moved out of flex controller
				.then(mPropertyBag.flexController.applyVariantChanges.bind(mPropertyBag.flexController, mChangesToBeSwitched.changesToBeApplied, mPropertyBag.appComponent))
				.then(VariantManagementState.setCurrentVariant.bind(null, mPropertyBag));
		}

	};
	return Switcher;
}, true);