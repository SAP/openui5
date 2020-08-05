/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Element",
	"sap/ui/core/StashedControlSupport",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/Utils"
], function(
	Log,
	Element,
	StashedControlSupport,
	JsControlTreeModifier,
	FlexCustomData,
	Utils,
	DependencyHandler,
	FlUtils
) {
	"use strict";

	var oLastPromise = new FlUtils.FakePromise();

	function _checkControlAndDependentSelectorControls(oChange, mPropertyBag) {
		var oSelector = oChange.getSelector && oChange.getSelector();
		if (!oSelector || (!oSelector.id && !oSelector.name)) {
			throw Error("No selector in change found or no selector ID.");
		}

		var oControl = mPropertyBag.modifier.bySelector(oSelector, mPropertyBag.appComponent, mPropertyBag.view);
		if (!oControl) {
			throw Error("A flexibility change tries to change a nonexistent control.");
		}

		var aDependentControlSelectorList = oChange.getDependentControlSelectorList();
		aDependentControlSelectorList.forEach(function(sDependentControlSelector) {
			var oDependentControl = mPropertyBag.modifier.bySelector(sDependentControlSelector, mPropertyBag.appComponent, mPropertyBag.view);
			if (!oDependentControl) {
				throw Error("A dependent selector control of the flexibility change is not available.");
			}
		});

		return oControl;
	}

	function _checkAndAdjustChangeStatus(oControl, oChange, mChangesMap, oFlexController, mPropertyBag) {
		var bXmlModifier = _isXmlModifier(mPropertyBag);
		var mControl = Utils.getControlIfTemplateAffected(oChange, oControl, mPropertyBag);
		var bIsCurrentlyAppliedOnControl = FlexCustomData.hasChangeApplyFinishedCustomData(mControl.control, oChange, mPropertyBag.modifier);
		var bChangeStatusAppliedFinished = oChange.isApplyProcessFinished();
		if (bChangeStatusAppliedFinished && !bIsCurrentlyAppliedOnControl) {
			// if a change was already processed and is not applied anymore, then the control was destroyed and recreated.
			// In this case we need to recreate/copy the dependencies if we are applying in JS
			if (!bXmlModifier) {
				var fnCheckFunction = Utils.checkIfDependencyIsStillValid.bind(null, mPropertyBag.appComponent, mPropertyBag.modifier, mChangesMap);
				mChangesMap = oFlexController._oChangePersistence.copyDependenciesFromInitialChangesMap(oChange, fnCheckFunction, mPropertyBag.appComponent);
			}
			oChange.setInitialApplyState();
		} else if (!bChangeStatusAppliedFinished && bIsCurrentlyAppliedOnControl) {
			// if a change is already applied on the control, but the status does not reflect that, the status has to be updated
			// scenario: viewCache
			oChange.markFinished();
		}
		return mChangesMap;
	}

	function _checkPreconditions(oChange, mPropertyBag) {
		var sErrorMessage;
		if (_isXmlModifier(mPropertyBag) && oChange.getDefinition().jsOnly) {
			// change is not capable of xml modifier
			// the change status has to be reset to initial
			sErrorMessage = "Change cannot be applied in XML. Retrying in JS.";
		}

		if (sErrorMessage) {
			oChange.setInitialApplyState();
			throw Error(sErrorMessage);
		}
	}

	function _handleAfterApply(oChange, mControl, oInitializedControl, mPropertyBag) {
		// changeHandler can return a different control, e.g. case where a visible UI control replaces the stashed control
		if (oInitializedControl instanceof Element) {
			// the newly rendered control could have custom data set from the XML modifier
			mControl.control = oInitializedControl;
		}
		if (mControl.control) {
			mPropertyBag.modifier.updateAggregation(mControl.originalControl, oChange.getContent().boundAggregation);
		}
		// only save the revert data in the custom data when the change is being processed in XML,
		// as it's only relevant for viewCache at the moment
		FlexCustomData.addAppliedCustomData(mControl.control, oChange, mPropertyBag, _isXmlModifier(mPropertyBag));
		// if a change was reverted previously remove the flag as it is not reverted anymore
		var oResult = {success: true};
		oChange.markFinished(oResult);
		return oResult;
	}

	function _handleAfterApplyError(oError, oChange, mControl, mPropertyBag) {
		var bXmlModifier = _isXmlModifier(mPropertyBag);
		var oResult = {success: false, error: oError};

		var sChangeId = oChange.getId();
		var sLogMessage = "Change ''{0}'' could not be applied.";
		var bErrorOccured = oError instanceof Error;
		var sCustomDataIdentifier = FlexCustomData.getCustomDataIdentifier(false, bErrorOccured, bXmlModifier);
		switch (sCustomDataIdentifier) {
			case FlexCustomData.notApplicableChangesCustomDataKey:
				FlUtils.formatAndLogMessage("info", [sLogMessage, oError.message], [sChangeId]);
				break;
			case FlexCustomData.failedChangesCustomDataKeyXml:
				FlUtils.formatAndLogMessage("warning", [sLogMessage, "Merge error detected while processing the XML tree."], [sChangeId], oError.stack);
				break;
			case FlexCustomData.failedChangesCustomDataKeyJs:
				FlUtils.formatAndLogMessage("error", [sLogMessage, "Merge error detected while processing the JS control tree."], [sChangeId], oError.stack);
				break;
			/*no default*/
		}
		FlexCustomData.addFailedCustomData(mControl.control, oChange, mPropertyBag, sCustomDataIdentifier);

		// if the change failed during XML processing, the status has to be reset
		// the change will be applied again in JS
		if (bXmlModifier) {
			oChange.setInitialApplyState();
		} else {
			oChange.markFinished(oResult);
		}
		return oResult;
	}

	function _isXmlModifier(mPropertyBag) {
		return mPropertyBag.modifier.targets === "xmlTree";
	}

	function _logApplyChangeError(oError, oChange) {
		var oDefinition = oChange.getDefinition();
		var sChangeType = oDefinition.changeType;
		var sTargetControlId = oDefinition.selector.id;
		var fullQualifiedName = oDefinition.namespace + oDefinition.fileName + "." + oDefinition.fileType;

		var sWarningMessage = "A flexibility change could not be applied.";
		sWarningMessage += "\nThe displayed UI might not be displayed as intedend.";
		if (oError.message) {
			sWarningMessage += "\n   occurred error message: '" + oError.message + "'";
		}
		sWarningMessage += "\n   type of change: '" + sChangeType + "'";
		sWarningMessage += "\n   LRep location of the change: " + fullQualifiedName;
		sWarningMessage += "\n   id of targeted control: '" + sTargetControlId + "'.";

		Log.warning(sWarningMessage, undefined, "sap.ui.fl.apply._internal.changes.Applier");
	}

	function isControlStashed(mChangesMap, sControlId) {
		var aControlChanges = mChangesMap.mChanges[sControlId] || [];
		var bIsStashed = true;
		var sChangeType;
		aControlChanges.slice(0).reverse().some(function(oChange) {
			sChangeType = oChange.getDefinition().changeType;
			if (sChangeType.indexOf("stash") > -1) {
				bIsStashed = true;
				return true;
			} else if (sChangeType.indexOf("unstash") > -1) {
				bIsStashed = false;
				return true;
			}
		});
		return bIsStashed;
	}

	function handleStashedControls(mChangesMap, sControlId, oAppComponent) {
		var bHasStashDependencies = false;
		var aStashedChildren = StashedControlSupport.getStashedControlIds(sControlId);
		aStashedChildren.forEach(function(sStashedControlId) {
			if (isControlStashed(mChangesMap, sStashedControlId)) {
				var aChangesToBeIgnored = DependencyHandler.removeOpenDependentChanges(mChangesMap, oAppComponent, sStashedControlId, sControlId);
				aChangesToBeIgnored.forEach(function(oChange) {
					oChange._ignoreOnce = true;
				});
				bHasStashDependencies = (aChangesToBeIgnored.length > 0) ? true : bHasStashDependencies;
			}
		});

		return bHasStashDependencies;
	}

	var Applier = {
		/**
		 * Sets a specific precondition, which has to be fulfilled before applying all changes on control.
		 *
		 * @param {Promise} oPromise - Promise which is resolved when precondition fulfilled
		 */
		addPreConditionForInitialChangeApplying: function(oPromise) {
			oLastPromise = oLastPromise.then(function () {
				return oPromise;
			});
		},

		/**
		 * Applying a specific change on the passed control, if it is not already applied.
		 *
		 * @param {sap.ui.fl.Change} oChange - Change object which should be applied on the passed control
		 * @param {sap.ui.core.Control} oControl - Control which is the target of the passed change
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {object} mPropertyBag.view - View to process
		 * @param {object} mPropertyBag.modifier - Polymorph reuse operations handling the changes on the given view type
		 * @param {object} mPropertyBag.appDescriptor - App descriptor containing the metadata of the current application
		 * @param {object} mPropertyBag.appComponent - Component instance that is currently loading
		 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Promise that is resolved after all changes were reverted in asynchronous case or FakePromise for the synchronous processing scenario
		 */
		applyChangeOnControl: function(oChange, oControl, mPropertyBag) {
			var mControl = Utils.getControlIfTemplateAffected(oChange, oControl, mPropertyBag);

			return Utils.getChangeHandler(oChange, mControl, mPropertyBag).then(function(oChangeHandler) {
				_checkPreconditions(oChange, mPropertyBag);
				return oChangeHandler;
			})

			.then(function(oChangeHandler) {
				if (oChange.hasApplyProcessStarted()) {
					// wait for the change to be finished and then clean up the status and queue
					return oChange.addPromiseForApplyProcessing().then(function(oResult) {
						oChange.markFinished();
						return oResult;
					});
				} else if (!oChange.isApplyProcessFinished()) {
					return new FlUtils.FakePromise().then(function() {
						oChange.startApplying();
						return oChangeHandler.applyChange(oChange, mControl.control, mPropertyBag);
					})
					.then(function(oInitializedControl) {
						return _handleAfterApply(oChange, mControl, oInitializedControl, mPropertyBag);
					})
					.catch(function(oError) {
						return _handleAfterApplyError(oError, oChange, mControl, mPropertyBag);
					});
				}

				// make sure that everything that goes with finishing the apply process is done, even though the change was already applied
				var oResult = {success: true};
				oChange.markFinished(oResult);
				return oResult;
			})

			.catch(function(oError) {
				return {
					success: false,
					error: oError
				};
			});
		},

		/**
		 * Gets the changes map and gets all changes for that control from the map, then, depending on
		 * dependencies, directly applies the change or saves the callback to apply in the dependency.
		 *
		 * @param {function} fnGetChangesMap - Function which resolves with the changes map
		 * @param {object} oAppComponent - Component instance that is currently loading
		 * @param {sap.ui.fl.oFlexController} oFlexController - Instance of FlexController
		 * @param {sap.ui.core.Control} oControl Instance of the control to which changes should be applied
		 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Resolves as soon as all changes for the control are applied
		 */
		applyAllChangesForControl: function(fnGetChangesMap, oAppComponent, oFlexController, oControl) {
			// the changes have to be queued synchronously
			var mChangesMap = fnGetChangesMap();
			var sControlId = oControl.getId();
			var aChangesForControl = mChangesMap.mChanges[sControlId] || [];

			var bHasStashDependencies = handleStashedControls(mChangesMap, sControlId, oAppComponent);

			aChangesForControl.forEach(function (oChange) {
				if (!oChange.isApplyProcessFinished() && !oChange._ignoreOnce) {
					oChange.setQueuedForApply();
				}
			});

			// make sure that the current control waits for the previous control to be processed
			oLastPromise = oLastPromise.then(function(oControl, bHasStashDependencies) {
				var aPromiseStack = [];
				var sControlId = oControl.getId();
				var aChangesForControl = mChangesMap.mChanges[sControlId] || [];
				var mPropertyBag = {
					modifier: JsControlTreeModifier,
					appComponent: oAppComponent,
					view: FlUtils.getViewForControl(oControl)
				};
				var bControlWithDependencies;

				if (mChangesMap.mControlsWithDependencies[sControlId]) {
					DependencyHandler.removeControlsDependencies(mChangesMap, sControlId);
					bControlWithDependencies = true;
				}

				aChangesForControl.forEach(function (oChange) {
					mChangesMap = _checkAndAdjustChangeStatus(oControl, oChange, mChangesMap, oFlexController, mPropertyBag);
					if (oChange._ignoreOnce) {
						delete oChange._ignoreOnce;
					} else if (oChange.isApplyProcessFinished()) {
						DependencyHandler.resolveDependenciesForChange(mChangesMap, oChange.getId(), sControlId);
					} else if (!mChangesMap.mDependencies[oChange.getId()]) {
						aPromiseStack.push(function() {
							return Applier.applyChangeOnControl(oChange, oControl, mPropertyBag).then(function() {
								DependencyHandler.resolveDependenciesForChange(mChangesMap, oChange.getId(), sControlId);
							});
						});
					} else {
						var fnCallback = Applier.applyChangeOnControl.bind(Applier, oChange, oControl, mPropertyBag);
						DependencyHandler.addChangeApplyCallbackToDependency(mChangesMap, oChange.getId(), fnCallback);
					}
				});

				if (aChangesForControl.length || bControlWithDependencies || bHasStashDependencies) {
					return FlUtils.execPromiseQueueSequentially(aPromiseStack).then(function () {
						return DependencyHandler.processDependentQueue(mChangesMap, oAppComponent, sControlId);
					});
				}
			}.bind(null, oControl, bHasStashDependencies));

			return oLastPromise;
		},

		/**
		 * Looping over all retrieved flexibility changes and applying them onto the targeted control within the view.
		 *
		 * @param {object} mPropertyBag - Collection of cross-functional attributes
		 * @param {object} mPropertyBag.view - View to process
		 * @param {string} mPropertyBag.viewId - ID of the processed view
		 * @param {string} mPropertyBag.appComponent - Application component instance responsible for the view
		 * @param {object} mPropertyBag.modifier - Polymorph reuse operations handling the changes on the given view type
		 * @param {sap.ui.fl.Change[]} aChanges List of flexibility changes on controls for the current processed view
		 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Promise that is resolved after all changes were reverted in asynchronous case or FakePromise for the synchronous processing scenario including view object in both cases
		 */
		applyAllChangesForXMLView: function(mPropertyBag, aChanges) {
			if (!Array.isArray(aChanges)) {
				var sErrorMessage = "No list of changes was passed for processing the flexibility on view: " + mPropertyBag.view + ".";
				Log.error(sErrorMessage, undefined, "sap.ui.fl.apply._internal.changes.Applier");
				aChanges = [];
			}

			return aChanges.reduce(function(oPreviousPromise, oChange) {
				return oPreviousPromise.then(function() {
					var oControl = _checkControlAndDependentSelectorControls(oChange, mPropertyBag);
					oChange.setQueuedForApply();
					_checkAndAdjustChangeStatus(oControl, oChange, undefined, undefined, mPropertyBag);
					if (!oChange.isApplyProcessFinished()) {
						return Applier.applyChangeOnControl(oChange, oControl, mPropertyBag);
					}
					return {success: true};
				})
				.then(function(oReturn) {
					if (!oReturn.success) {
						throw Error(oReturn.error);
					}
				})
				.catch(function(oError) {
					_logApplyChangeError(oError, oChange);
				});
			}, new FlUtils.FakePromise())
			.then(function() {
				return mPropertyBag.view;
			});
		}
	};
	return Applier;
}, true);