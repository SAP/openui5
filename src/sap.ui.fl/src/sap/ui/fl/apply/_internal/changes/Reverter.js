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

	const Reverter = {};

	async function waitForApplyIfNecessary(oChange) {
		if (!oChange.isApplyProcessFinished() && oChange.hasApplyProcessStarted()) {
			// wait for the change to be applied
			const oResult = await oChange.addPromiseForApplyProcessing();
			if (oResult && oResult.error) {
				oChange.markRevertFinished(oResult.error);
				throw Error(oResult.error);
			}
		}
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
	 * @returns {Promise} Resolving Promise with either the control (success) or <code>false</code> (failure) as value
	 */
	Reverter.revertChangeOnControl = async function(oChange, oControl, mPropertyBag) {
		const mControl = Utils.getControlIfTemplateAffected(oChange, oControl, mPropertyBag);
		try {
			const oChangeHandler = await Utils.getChangeHandler(oChange, mControl, mPropertyBag);
			await waitForApplyIfNecessary(oChange);
			if (oChange.isSuccessfullyApplied()) {
				oChange.startReverting();
			} else {
				throw Error("Change was never applied");
			}

			await oChangeHandler.revertChange(oChange, mControl.control, mPropertyBag);
			// After revert the relevant control for the change might have changed, therefore it must be retrieved again (e.g. stashing)
			mControl.control = mPropertyBag.modifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent, mPropertyBag.view);
			if (mControl.bTemplateAffected) {
				await mPropertyBag.modifier.updateAggregation(mControl.control, oChange.getContent().boundAggregation);
			}
			oChange.markRevertFinished();
			return mControl.control;
		} catch (oError) {
			const sErrorMessage = `Change could not be reverted: ${oError.message}`;
			Log.error(sErrorMessage);
			oChange.markRevertFinished(sErrorMessage);
			return false;
		}
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
		const aPromiseStack = [];
		aChanges.forEach((oChange) => {
			// Queued 'state' will be removed once the revert process is done
			oChange.setQueuedForRevert();
			aPromiseStack.push(() => {
				const oSelector = oChange.getSelector && oChange.getSelector();
				const oControl = mPropertyBag.modifier.bySelector(oSelector, mPropertyBag.appComponent);
				if (!oControl) {
					removeChangeFromMaps(oChange, mPropertyBag.reference);
					return (FlUtils.FakePromise ? new FlUtils.FakePromise() : Promise.resolve());
				}
				const mRevertProperties = {
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