/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/strings/formatMessage",
	"sap/ui/core/Element",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/Utils"
], function(
	Log,
	formatMessage,
	Element,
	JsControlTreeModifier,
	FlexCustomData,
	Utils,
	DependencyHandler,
	FlUtils
) {
	"use strict";

	var oLastPromise = (FlUtils.FakePromise ? new FlUtils.FakePromise() : Promise.resolve());

	/**
	 * Formats the log message by replacing placeholders with values and logging the message.
	 *
	 * @param {string} sLogType - Logging type to be used. Possible values: info | warning | debug | error
	 * @param {array.<string>} aMessageComponents - Individual parts of the message text
	 * @param {array.<any>} aValuesToInsert - The values to be used instead of the placeholders in the message
	 * @param {string} [sCallStack] - Passes the callstack to the logging function
	 */
	function formatAndLogMessage(sLogType, aMessageComponents, aValuesToInsert, sCallStack) {
		var sLogMessage = aMessageComponents.join(" ");
		sLogMessage = formatMessage(sLogMessage, aValuesToInsert);
		Log[sLogType](sLogMessage, sCallStack || "");
	}

	function checkControlAndDependentSelectorControls(oChange, mPropertyBag) {
		var oSelector = oChange.getSelector && oChange.getSelector();
		if (!oSelector || (!oSelector.id && !oSelector.name)) {
			return Promise.reject(Error("No selector in change found or no selector ID."));
		}

		function checkFailedSelectors(oSelector) {
			if (FlUtils.indexOfObject(mPropertyBag.failedSelectors, oSelector) > -1) {
				throw Error("A change depending on that control already failed, so the current change is skipped");
			}
		}

		return mPropertyBag.modifier.bySelectorTypeIndependent(oSelector, mPropertyBag.appComponent, mPropertyBag.view)
		.then(function(oControl) {
			if (!oControl) {
				throw Error("A flexibility change tries to change a nonexistent control.");
			}
			checkFailedSelectors(oSelector);

			var aDependentControlSelectorList = oChange.getDependentControlSelectorList();
			aDependentControlSelectorList.forEach(function(oDependentControlSelector) {
				var oDependentControl = mPropertyBag.modifier.bySelector(
					oDependentControlSelector,
					mPropertyBag.appComponent,
					mPropertyBag.view
				);
				if (!oDependentControl) {
					throw new Error("A dependent selector control of the flexibility change is not available.");
				}
				checkFailedSelectors(oDependentControlSelector);
			});
			return oControl;
		});
	}

	function isXmlModifier(mPropertyBag) {
		return mPropertyBag.modifier.targets === "xmlTree";
	}

	function checkAndAdjustChangeStatus(oControl, oChange, mChangesMap, oFlexController, mPropertyBag) {
		// in case of changes in templates, the original control is not always available at this point
		// example: rename on a control created by a change inside a template
		var oOriginalControl = Utils.getControlIfTemplateAffected(oChange, oControl, mPropertyBag).control;
		var oModifier = mPropertyBag.modifier;
		var bHasAppliedCustomData = oOriginalControl
			&& !!FlexCustomData.getAppliedCustomDataValue(oOriginalControl, oChange, oModifier);
		var bIsCurrentlyAppliedOnControl = oOriginalControl
			&& FlexCustomData.hasChangeApplyFinishedCustomData(oOriginalControl, oChange, oModifier);
		var bChangeStatusAppliedFinished = oChange.isApplyProcessFinished();
		var oAppComponent = mPropertyBag.appComponent;
		if (bChangeStatusAppliedFinished && !bIsCurrentlyAppliedOnControl) {
			// if a change was already processed and is not applied anymore, then the control was destroyed and recreated.
			// In this case we need to recreate/copy the dependencies if we are applying in JS
			if (!isXmlModifier(mPropertyBag)) {
				var fnCheckFunction = Utils.checkIfDependencyIsStillValid.bind(null, oAppComponent, oModifier, mChangesMap);
				oFlexController._oChangePersistence.copyDependenciesFromInitialChangesMap(oChange, fnCheckFunction, oAppComponent);
			}
			oChange.setInitialApplyState();
		} else if (!bChangeStatusAppliedFinished && bIsCurrentlyAppliedOnControl) {
			// if a change is already applied on the control, but the status does not reflect that, the status has to be updated
			// scenario: viewCache
			if (bHasAppliedCustomData) {
				// if the change was applied, set the revert data fetched from the custom data
				oChange.setRevertData(FlexCustomData.getParsedRevertDataFromCustomData(oOriginalControl, oChange, oModifier));
				oChange.markSuccessful();
			} else {
				oChange.markFailed();
			}
		} else if (bChangeStatusAppliedFinished && bIsCurrentlyAppliedOnControl) {
			// both the change instance and the UI Control are already applied, so the change can be directly marked as finished
			oChange.markSuccessful();
		}
	}

	function checkPreconditions(oChange, mPropertyBag) {
		var sErrorMessage;
		if (isXmlModifier(mPropertyBag) && oChange.getJsOnly()) {
			// change is not capable of xml modifier
			// the change status has to be reset to initial
			sErrorMessage = "Change cannot be applied in XML. Retrying in JS.";
		}

		if (sErrorMessage) {
			oChange.setInitialApplyState();
			throw Error(sErrorMessage);
		}
	}

	function handleAfterApply(oChange, mControl, oInitializedControl, mPropertyBag) {
		return Promise.resolve()
		.then(function() {
			// changeHandler can return a different control, e.g. case where a visible UI control replaces the stashed control placeholder
			if (oInitializedControl instanceof Element) {
				// the newly rendered control could have custom data set from the XML modifier
				mControl.control = oInitializedControl;
			}
			if (mControl.control) {
				return mPropertyBag.modifier.updateAggregation(mControl.originalControl, oChange.getContent().boundAggregation);
			}
			return undefined;
		})
		.then(function() {
			// only save the revert data in the custom data when the change is being processed in XML,
			// as it's only relevant for viewCache at the moment
			return FlexCustomData.addAppliedCustomData(mControl.control, oChange, mPropertyBag, isXmlModifier(mPropertyBag));
		})
		.then(function() {
			// if a change was reverted previously remove the flag as it is not reverted anymore
			var oResult = {success: true};
			oChange.markSuccessful(oResult);
			return oResult;
		});
	}

	function handleAfterApplyError(oError, oChange, mControl, mPropertyBag) {
		var bXmlModifier = isXmlModifier(mPropertyBag);
		var oResult = {success: false, error: oError};

		var sChangeId = oChange.getId();
		var sLogMessage = "Change ''{0}'' could not be applied.";
		var bErrorOccurred = oError instanceof Error;
		var sCustomDataIdentifier = FlexCustomData.getCustomDataIdentifier(false, bErrorOccurred, bXmlModifier);
		switch (sCustomDataIdentifier) {
			case FlexCustomData.notApplicableChangesCustomDataKey:
				formatAndLogMessage(
					"info",
					[sLogMessage, oError.message],
					[sChangeId]
				);
				break;
			case FlexCustomData.failedChangesCustomDataKeyXml:
				formatAndLogMessage(
					"warning",
					[sLogMessage, "Merge error detected while processing the XML tree."],
					[sChangeId],
					oError.stack
				);
				break;
			case FlexCustomData.failedChangesCustomDataKeyJs:
				formatAndLogMessage(
					"error",
					[sLogMessage, "Merge error detected while processing the JS control tree."],
					[sChangeId],
					oError.stack
				);
				break;
			default:
				// no default
		}
		return FlexCustomData.addFailedCustomData(mControl.control, oChange, mPropertyBag, sCustomDataIdentifier)
		.then(function() {
			// if the change failed during XML processing, the status has to be reset
			// the change will be applied again in JS
			if (bXmlModifier) {
				oChange.setInitialApplyState();
			} else {
				oChange.markFailed(oResult);
			}
			return oResult;
		});
	}

	function logApplyChangeError(oError, oChange) {
		var sChangeType = oChange.getChangeType();
		var sTargetControlId = oChange.getSelector().id;
		var fullQualifiedName = oChange.getNamespace() + oChange.getId() + "." + oChange.getFileType();

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

	function adjustOriginalSelector(oChange, oControl, oAppComponent) {
		var oPropertyBag = {
			appComponent: oAppComponent,
			modifier: JsControlTreeModifier
		};
		var oCurrentOriginalControl = JsControlTreeModifier.bySelector(oChange.originalSelectorToBeAdjusted, oAppComponent);
		var oActualOriginalControl = oControl.getBindingInfo(oChange.getContent().boundAggregation).template;

		// no parent means that the control is the template iteself
		if (oCurrentOriginalControl.getParent()) {
			var aStack = [];
			var oTempControl = oCurrentOriginalControl;
			do {
				aStack.push({
					aggregation: oTempControl.sParentAggregationName,
					index: oTempControl.getParent().getAggregation(oTempControl.sParentAggregationName).indexOf(oTempControl)
				});
				oTempControl = oTempControl.getParent();
			} while (oTempControl.getParent());

			aStack.reverse();
			aStack.forEach(function(oInfo) {
				oActualOriginalControl = oActualOriginalControl.getAggregation(oInfo.aggregation)[oInfo.index];
			});
		}
		oChange.addDependentControl(oActualOriginalControl, "originalSelector", oPropertyBag);
	}

	function registerOnAfterXMLChangeProcessingHandler(aOnAfterXMLChangeProcessingHandlers, oChangeHandler, oControl) {
		var iChangeHandlerIndex = aOnAfterXMLChangeProcessingHandlers.findIndex(function(mHandler) {
			return mHandler.handler === oChangeHandler;
		});
		if (iChangeHandlerIndex < 0) {
			iChangeHandlerIndex = aOnAfterXMLChangeProcessingHandlers.length;
			aOnAfterXMLChangeProcessingHandlers.push({
				handler: oChangeHandler,
				controls: []
			});
		}
		if (!aOnAfterXMLChangeProcessingHandlers[iChangeHandlerIndex].controls.includes(oControl)) {
			aOnAfterXMLChangeProcessingHandlers[iChangeHandlerIndex].controls.push(oControl);
		}
	}

	var Applier = {
		/**
		 * Sets a specific precondition, which has to be fulfilled before applying all changes on control.
		 *
		 * @param {Promise} oPromise - Promise which is resolved when precondition fulfilled
		 */
		addPreConditionForInitialChangeApplying: function(oPromise) {
			oLastPromise = oLastPromise.then(function() {
				return oPromise;
			});
		},

		/**
		 * Applying a specific change on the passed control, if it is not already applied.
		 *
		 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change object which should be applied on the passed control
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
			var pHandlerPromise = mPropertyBag.changeHandler
				? Promise.resolve(mPropertyBag.changeHandler)
				: Utils.getChangeHandler(oChange, mControl, mPropertyBag);

			return pHandlerPromise.then(function(oChangeHandler) {
				checkPreconditions(oChange, mPropertyBag);
				return oChangeHandler;
			})

			.then(function(oChangeHandler) {
				if (oChange.hasApplyProcessStarted()) {
					// wait for the change to be finished and then clean up the status and queue
					return oChange.addPromiseForApplyProcessing().then(function(oResult) {
						oChange.markSuccessful();
						return oResult;
					});
				} else if (!oChange.isApplyProcessFinished()) {
					return (FlUtils.FakePromise ? new FlUtils.FakePromise() : Promise.resolve()).then(function() {
						oChange.startApplying();
						return oChangeHandler.applyChange(oChange, mControl.control, mPropertyBag);
					})
					.then(function(oInitializedControl) {
						return handleAfterApply(oChange, mControl, oInitializedControl, mPropertyBag);
					})
					.catch(function(oError) {
						return handleAfterApplyError(oError, oChange, mControl, mPropertyBag);
					});
				}

				// make sure that everything that goes with finishing the apply process is done, even though the change was already applied
				var oResult = {success: true};
				oChange.markSuccessful(oResult);
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
			var mPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: oAppComponent,
				view: FlUtils.getViewForControl(oControl)
			};

			aChangesForControl.forEach(function(oChange) {
				checkAndAdjustChangeStatus(oControl, oChange, mChangesMap, oFlexController, mPropertyBag);
				if (!oChange.isApplyProcessFinished() && !oChange._ignoreOnce) {
					oChange.setQueuedForApply();
				}
			});

			// make sure that the current control waits for the previous control to be processed
			oLastPromise = oLastPromise.then(function(oControl, mPropertyBag) {
				var aPromiseStack = [];
				var sControlId = oControl.getId();
				var aChangesForControl = mChangesMap.mChanges[sControlId] || [];
				var bControlWithDependencies;

				if (mChangesMap.mControlsWithDependencies[sControlId]) {
					DependencyHandler.removeControlsDependencies(mChangesMap, sControlId);
					bControlWithDependencies = true;
				}

				aChangesForControl.forEach(function(oChange) {
					// in the ExtensionPoint scenario changes can get cloned,
					// in case of a template change the original selector has to be adjusted
					if (oChange.originalSelectorToBeAdjusted) {
						adjustOriginalSelector(oChange, oControl, oAppComponent);
						delete oChange.originalSelectorToBeAdjusted;
					}
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

				if (aChangesForControl.length || bControlWithDependencies) {
					return FlUtils.execPromiseQueueSequentially(aPromiseStack).then(function() {
						return DependencyHandler.processDependentQueue(mChangesMap, oAppComponent, sControlId);
					});
				}
				return undefined;
			}.bind(null, oControl, mPropertyBag));

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
		 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aChanges List of flexibility changes on controls for the current processed view
		 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Promise that is resolved after all changes were reverted in asynchronous case or FakePromise for the synchronous processing scenario including view object in both cases
		 */
		applyAllChangesForXMLView: function(mPropertyBag, aChanges) {
			if (!Array.isArray(aChanges)) {
				var sErrorMessage = "No list of changes was passed for processing the flexibility on view: " + mPropertyBag.view + ".";
				Log.error(sErrorMessage, undefined, "sap.ui.fl.apply._internal.changes.Applier");
				aChanges = [];
			}

			var aOnAfterXMLChangeProcessingHandlers = [];
			mPropertyBag.failedSelectors = [];

			return aChanges.reduce(function(oPreviousPromise, oChange) {
				var oControl;
				return oPreviousPromise
				.then(checkControlAndDependentSelectorControls.bind(null, oChange, mPropertyBag))
				.then(function(oReturnedControl) {
					oControl = oReturnedControl;
					var mControl = Utils.getControlIfTemplateAffected(oChange, oControl, mPropertyBag);
					return Utils.getChangeHandler(oChange, mControl, mPropertyBag);
				})
				.then(function(oChangeHandler) {
					mPropertyBag.changeHandler = oChangeHandler;
					oChange.setQueuedForApply();
					checkAndAdjustChangeStatus(oControl, oChange, undefined, undefined, mPropertyBag);

					if (!oChange.isApplyProcessFinished()) {
						if (typeof mPropertyBag.changeHandler.onAfterXMLChangeProcessing === "function") {
							registerOnAfterXMLChangeProcessingHandler(
								aOnAfterXMLChangeProcessingHandlers,
								mPropertyBag.changeHandler,
								oControl
							);
						}
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
					oChange.getDependentSelectorList().forEach(function(oDependentControlSelector) {
						if (FlUtils.indexOfObject(mPropertyBag.failedSelectors, oDependentControlSelector) === -1) {
							mPropertyBag.failedSelectors.push(oDependentControlSelector);
						}
					});
					logApplyChangeError(oError, oChange);
				});
			}, (FlUtils.FakePromise ? new FlUtils.FakePromise() : Promise.resolve()))
			.then(function() {
				delete mPropertyBag.failedSelectors;

				// Once all changes for a control are processed, call the
				// onAfterXMLChangeProcessing hooks of all involved change handlers
				aOnAfterXMLChangeProcessingHandlers.forEach(function(mHandler) {
					mHandler.controls.forEach(function(oControl) {
						try {
							mHandler.handler.onAfterXMLChangeProcessing(oControl, mPropertyBag);
						} catch (oError) {
							Log.error("Error during onAfterXMLChangeProcessing", oError);
						}
					});
				});

				return mPropertyBag.view;
			});
		}
	};
	return Applier;
});