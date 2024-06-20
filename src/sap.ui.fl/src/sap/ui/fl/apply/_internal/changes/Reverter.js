/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/Utils"
], function(
	Log,
	Applier,
	FlexCustomData,
	Utils,
	DependencyHandler,
	FlexObjectState,
	FlUtils
) {
	"use strict";

	var Reverter = {};

	function _waitForApplyIfNecessary(oChange) {
		if (!oChange.isApplyProcessFinished() && oChange.hasApplyProcessStarted()) {
			// wait for the change to be applied
			return oChange.addPromiseForApplyProcessing().then(function(oResult) {
				if (oResult && oResult.error) {
					oChange.markRevertFinished(oResult.error);
					throw Error(oResult.error);
				}
			});
		}
		return Promise.resolve();
	}

	function removeChangeFromMaps(oChange, sReference) {
		const sChangeKey = oChange.getId();
		const oDependencyMap = FlexObjectState.getLiveDependencyMap(sReference);
		DependencyHandler.removeChangeFromMap(oDependencyMap, sChangeKey);
		DependencyHandler.removeChangeFromDependencies(oDependencyMap, sChangeKey);
	}

	async function revertAndDeleteChangeOnControl(oChange, oControl, mRevertProperties, mPropertyBag) {
		const vRevertResult = await Reverter.revertChangeOnControl(oChange, oControl, mRevertProperties);
		FlexCustomData.destroyAppliedCustomData(vRevertResult || oControl, oChange, mPropertyBag.modifier);
		if (vRevertResult) {
			removeChangeFromMaps(oChange, mPropertyBag.reference);
		}
	}

	/**
	 * Reverts a specific change on the passed control if it is currently applied.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change object that should be reverted on the passed control
	 * @param {sap.ui.core.Control} oControl - Control which is the target of the passed change
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Component instance that is currently loading
	 * @param {object} mPropertyBag.appDescriptor - App descriptor containing the metadata of the current application
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Polymorph reuse operations handling the changes on the given view type
	 * @param {sap.ui.core.mvc.View} mPropertyBag.view - View to process
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Resolving Promise/FakePromise with either the control (success) or <code>false</code> (failure) as value
	 */
	Reverter.revertChangeOnControl = function(oChange, oControl, mPropertyBag) {
		var mControl = Utils.getControlIfTemplateAffected(oChange, oControl, mPropertyBag);
		var oChangeHandler;

		return Utils.getChangeHandler(oChange, mControl, mPropertyBag).then(function(oReturnedChangeHandler) {
			oChangeHandler = oReturnedChangeHandler;
		})
		.then(_waitForApplyIfNecessary.bind(null, oChange))
		.then(function() {
			if (oChange.isSuccessfullyApplied()) {
				oChange.startReverting();
				return oChangeHandler.revertChange(oChange, mControl.control, mPropertyBag);
			}
			throw Error("Change was never applied");
		})
		.then(function() {
			// After revert the relevant control for the change might have changed, therefore it must be retrieved again (e.g. stashing)
			mControl.control = mPropertyBag.modifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent, mPropertyBag.view);
			if (mControl.bTemplateAffected) {
				return mPropertyBag.modifier.updateAggregation(mControl.control, oChange.getContent().boundAggregation);
			}
			return undefined;
		})
		.then(function() {
			oChange.markRevertFinished();
			return mControl.control;
		})
		.catch(function(oError) {
			var sErrorMessage = `Change could not be reverted: ${oError.message}`;
			Log.error(sErrorMessage);
			oChange.markRevertFinished(sErrorMessage);
			return false;
		});
	};

	/**
	 * Reverts all given changes in one app component.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aChanges - Array of changes to be reverted
	 * @param {object} mPropertyBag - Object with additional properties
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Component instance that is currently loading
	 * @param {string} mPropertyBag.reference - Flex reference
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Polymorph reuse operations handling the changes on the given view type
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Promise/FakePromise that resolves as soon as all changes are reverted
	 */
	Reverter.revertMultipleChanges = function(aChanges, mPropertyBag) {
		var aPromiseStack = [];
		aChanges.forEach(function(oChange) {
			// Queued 'state' will be removed once the revert process is done
			oChange.setQueuedForRevert();
			aPromiseStack.push(function() {
				var oSelector = oChange.getSelector && oChange.getSelector();
				var oControl = mPropertyBag.modifier.bySelector(oSelector, mPropertyBag.appComponent);
				if (!oControl) {
					removeChangeFromMaps(oChange, mPropertyBag.reference);
					return (FlUtils.FakePromise ? new FlUtils.FakePromise() : Promise.resolve());
				}
				var mRevertProperties = {
					modifier: mPropertyBag.modifier,
					appComponent: mPropertyBag.appComponent,
					view: FlUtils.getViewForControl(oControl)
				};
				return revertAndDeleteChangeOnControl(oChange, oControl, mRevertProperties, mPropertyBag);
			});
		});
		const pReturn = FlUtils.execPromiseQueueSequentially(aPromiseStack);
		// reverting a change might trigger the propagation listener and the applyAllChangesForControl functionality
		// this needs to wait for the whole revert to be done so that the persistence is cleaned up and
		// a reverted change is not applied again
		Applier.addPreConditionForInitialChangeApplying(pReturn);
		return pReturn;
	};

	return Reverter;
});