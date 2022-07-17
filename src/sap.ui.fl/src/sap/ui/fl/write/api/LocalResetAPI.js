/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Change",
	"sap/ui/fl/Utils",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/base/util/restricted/_union"
], function(
	PersistenceWriteAPI,
	ChangesWriteAPI,
	JsControlTreeModifier,
	Change,
	Utils,
	ChangePersistenceFactory,
	union
) {
	"use strict";

	/**
	 * Provides an API to reset containers.
	 *
	 * @namespace sap.ui.fl.write.api.LocalResetAPI
	 * @experimental Since 1.90
	 * @since 1.90
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	var LocalResetAPI = /** @lends sap.ui.fl.write.api.LocalResetAPI */ {};

	function getAllChanges(oControl, sLayer, sCurrentVariant) {
		var mPropertyBag = {
			includeDirtyChanges: true,
			layer: sLayer
		};
		var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oControl);
		return oChangePersistence.getAllUIChanges(mPropertyBag)
			.filter(function (oChange) {
				return (
					oChange.getState() !== Change.states.DELETED
					&& oChange.getVariantReference() === (sCurrentVariant || "")
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
				.map(function (sSelector) {
					return JsControlTreeModifier.bySelector(sSelector, oComponent);
				})
				.filter(Boolean)
				.some(function (oDependent) {
					return isPartOfTargetControlTree(oDependent);
				});
		}

		return checkChange;
	}

	LocalResetAPI.resetChanges = function (aChanges, oAppComponent) {
		// Reset in reverse order, make sure not to mutate the original order as it is used to restore
		var aReverseChanges = aChanges.slice().reverse();

		var aRevertQueue = aReverseChanges.map(function (oChange) {
			var oControl = JsControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);
			return function () {
				return PersistenceWriteAPI.remove({
					change: oChange,
					selector: oControl
				})
				.then(function () {
					oChange.setQueuedForRevert();
					return ChangesWriteAPI.revert({
						change: oChange,
						element: oControl
					});
				});
			};
		});
		return Utils.execPromiseQueueSequentially(aRevertQueue);
	};

	LocalResetAPI.restoreChanges = function (aChanges, oAppComponent) {
		var aApplyQueue = aChanges.map(function (oChange) {
			return function () {
				oChange.restorePreviousState();
				var oControl = JsControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);
				PersistenceWriteAPI.add({
					change: oChange,
					selector: oControl
				});
				if (oChange.getState() === Change.states.PERSISTED) {
					var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oAppComponent);
					var aDirtyChanges = oChangePersistence.getDirtyChanges();
					var iIndex = aDirtyChanges.indexOf(oChange);
					if (iIndex >= 0) {
						aDirtyChanges.splice(iIndex, 1);
					}
				}

				return ChangesWriteAPI.apply({
					change: oChange,
					element: oControl,
					modifier: JsControlTreeModifier
				});
			};
		});
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