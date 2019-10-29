/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/FlexCustomData",
	"sap/ui/fl/Utils"
], function(
	Log,
	Utils,
	FlexCustomData,
	FlUtils
) {
	"use strict";

	function _handleStashedControls(oChange, oControl, oChangeHandler, mPropertyBag) {
		var bStashed = false;
		var sControlType = mPropertyBag.modifier.getControlType(oControl);
		if (oChange.getChangeType() === "stashControl" && sControlType === "sap.ui.core._StashedControl") {
			bStashed = true;

			// the revertData has to be faked when it is not available
			if (!oChange.hasRevertData()) {
				oChangeHandler.setChangeRevertData(oChange, false);
			}
		}
		return bStashed;
	}

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
	}

	var Reverter = {
		/**
		 * Reverts a specific change on the passed control if it is currently applied.
		 *
		 * @param {sap.ui.fl.Change} oChange - Change object that should be reverted on the passed control
		 * @param {sap.ui.core.Control} oControl - Control which is the target of the passed change
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Component instance that is currently loading
		 * @param {object} mPropertyBag.appDescriptor - App descriptor containing the metadata of the current application
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Polymorph reuse operations handling the changes on the given view type
		 * @param {sap.ui.core.mvc.View} mPropertyBag.view - View to process
		 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Resolving Promise/FakePromise with either the control (success) or <code>false</code> (failure) as value
		 */
		revertChangeOnControl: function(oChange, oControl, mPropertyBag) {
			var mControl = Utils.getControlIfTemplateAffected(oChange, oControl, mPropertyBag);
			var oChangeHandler;

			return Utils.getChangeHandler(oChange, mControl, mPropertyBag).then(function(oReturnedChangeHandler) {
				oChangeHandler = oReturnedChangeHandler;
			})

			.then(_waitForApplyIfNecessary.bind(null, oChange))

			.then(function() {
				// stashed controls don't have custom data in Runtime, so we have to assume that it is applied so we can perform the revert
				var bStashed = _handleStashedControls(oChange, oControl, oChangeHandler, mPropertyBag);

				if (oChange.isApplyProcessFinished() || bStashed) {
					if (!oChange.hasRevertData()) {
						oChange.setRevertData(FlexCustomData.getParsedRevertDataFromCustomData(oControl, oChange, mPropertyBag.modifier));
					}

					oChange.startReverting();
					return oChangeHandler.revertChange(oChange, mControl.control, mPropertyBag);
				}
				throw Error("Change was never applied");
			})

			.then(function() {
				// After revert the relevant control for the change might have changed, therefore it must be retrieved again (e.g. stashing)
				mControl.control = mPropertyBag.modifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent, mPropertyBag.view);
				if (mControl.bTemplateAffected) {
					mPropertyBag.modifier.updateAggregation(mControl.control, oChange.getContent().boundAggregation);
				}
				oChange.markRevertFinished();
				return mControl.control;
			})

			.catch(function(oError) {
				var sErrorMessage = "Change could not be reverted: " + oError.message;
				Log.error(sErrorMessage);
				oChange.markRevertFinished(sErrorMessage);
				return false;
			});
		},

		/**
		 * Reverts all given changes in one app component.
		 *
		 * @param {sap.ui.fl.Change[]} aChanges - Array of changes to be reverted
		 * @param {object} mPropertyBag - Object with additional properties
		 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Component instance that is currently loading
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Polymorph reuse operations handling the changes on the given view type
		 * @param {sap.ui.fl.FlexController} mPropertyBag.flexController - Instance of the flex controller the change is saved in
		 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Promise/FakePromise that resolves as soon as all changes are reverted
		 */
		revertMultipleChanges: function(aChanges, mPropertyBag) {
			var aPromiseStack = [];
			aChanges.forEach(function(oChange) {
				// Queued 'state' will be removed once the revert process is done
				oChange.setQueuedForRevert();
				aPromiseStack.push(function() {
					var oSelector = oChange.getSelector && oChange.getSelector();
					var oControl = mPropertyBag.modifier.bySelector(oSelector, mPropertyBag.appComponent);
					if (!oControl) {
						Log.warning("A flexibility change tries to revert changes on a nonexistent control with id " + oSelector.id);
						return new FlUtils.FakePromise();
					}
					var mRevertProperties = {
						modifier: mPropertyBag.modifier,
						appComponent: mPropertyBag.appComponent,
						view: FlUtils.getViewForControl(oControl)
					};

					return Reverter.revertChangeOnControl(oChange, oControl, mRevertProperties).then(function(vRevertResult) {
						FlexCustomData.destroyAppliedCustomData(vRevertResult || oControl, oChange, mPropertyBag.modifier);
						return !!vRevertResult;
					})
					.then(function(bSuccess) {
						if (bSuccess) {
							// TODO should be changed as soon as new flex persistence is in place
							mPropertyBag.flexController._oChangePersistence._deleteChangeInMap(oChange);
						}
					});
				});
			});

			return FlUtils.execPromiseQueueSequentially(aPromiseStack);
		}
	};
	return Reverter;
}, true);