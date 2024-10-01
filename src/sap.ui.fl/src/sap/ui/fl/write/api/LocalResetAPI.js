/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_union",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/_internal/flexState/changes/UIChangeManager",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Utils"
], function(
	union,
	JsControlTreeModifier,
	States,
	UIChangesState,
	ManifestUtils,
	UIChangeManager,
	ChangesWriteAPI,
	PersistenceWriteAPI,
	Utils
) {
	"use strict";

	/**
	 * Provides an API to reset containers.
	 *
	 * @namespace sap.ui.fl.write.api.LocalResetAPI
	 * @since 1.90
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	var LocalResetAPI = /** @lends sap.ui.fl.write.api.LocalResetAPI */ {};

	function getAllChanges(oControl, sLayer, sCurrentVariant) {
		return UIChangesState.getAllUIChanges(ManifestUtils.getFlexReferenceForControl(oControl))
		.filter(function(oChange) {
			return (
				oChange.getFileType() === "change"
				&& oChange.getLayer() === sLayer
				&& oChange.getState() !== States.LifecycleState.DELETED
				&& oChange.getVariantReference() === (sCurrentVariant || undefined)
			);
		});
	}

	function getNestedChangesForControlCheck(oTargetControl) {
		var oComponent = Utils.getAppComponentForControl(oTargetControl);
		var aNestedControls = [];
		var aOutsideControls = [];

		function isPartOfTargetControlTree(oControl, aRelatedControls) {
			var aRelated = (aRelatedControls || []).concat(oControl);
			if (oControl === oTargetControl || aNestedControls.includes(oControl)) {
				aNestedControls = union(aNestedControls, aRelated);
				return true;
			}
			var oParent = oControl.getParent();
			if (aOutsideControls.includes(oControl) || !oParent) {
				aOutsideControls = union(aOutsideControls, aRelated);
				return false;
			}
			return isPartOfTargetControlTree(oParent, aRelated);
		}

		function checkChange(oChange) {
			return oChange.getDependentSelectorList()
			.map(function(sSelector) {
				return JsControlTreeModifier.bySelector(sSelector, oComponent);
			})
			.filter(Boolean)
			.some(function(oDependent) {
				return isPartOfTargetControlTree(oDependent);
			});
		}

		return checkChange;
	}

	LocalResetAPI.resetChanges = function(aChanges, oAppComponent) {
		// Reset in reverse order, make sure not to mutate the original order as it is used to restore
		var aReverseChanges = aChanges.slice().reverse();

		var aRevertQueue = aReverseChanges.map(function(oChange) {
			var oControl = JsControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);
			// execPromiseQueueSequentially expects promises wrapped inside a function
			return function() {
				oChange.setQueuedForRevert();
				return ChangesWriteAPI.revert({
					change: oChange,
					element: oControl
				});
			};
		});

		return PersistenceWriteAPI.remove({
			flexObjects: aReverseChanges,
			selector: oAppComponent
		})
		.then(Utils.execPromiseQueueSequentially.bind(Utils, aRevertQueue));
	};

	LocalResetAPI.restoreChanges = function(aChanges, oAppComponent) {
		const sReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		UIChangeManager.restoreDeletedChanges(sReference, aChanges, oAppComponent);
		const aApplyQueue = aChanges.map((oChange) =>
			() => {
				const oControl = JsControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);
				return ChangesWriteAPI.apply({
					change: oChange,
					element: oControl,
					modifier: JsControlTreeModifier
				});
			}
		);
		return Utils.execPromiseQueueSequentially(aApplyQueue);
	};

	LocalResetAPI.getNestedUIChangesForControl = function(oControl, mPropertyBag) {
		var aChanges = getAllChanges(oControl, mPropertyBag.layer, mPropertyBag.currentVariant);
		var fnCheck = getNestedChangesForControlCheck(oControl);
		return aChanges.filter(fnCheck);
	};

	LocalResetAPI.isResetEnabled = function(oControl, mPropertyBag) {
		var aChanges = getAllChanges(oControl, mPropertyBag.layer, mPropertyBag.currentVariant);
		var fnCheck = getNestedChangesForControlCheck(oControl);
		return aChanges.some(fnCheck);
	};

	return LocalResetAPI;
});