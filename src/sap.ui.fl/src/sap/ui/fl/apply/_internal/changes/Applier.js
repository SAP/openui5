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
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/Utils"
], function(
	Log,
	formatMessage,
	Element,
	JsControlTreeModifier,
	FlexCustomData,
	Utils,
	DependencyHandler,
	FlexObjectState,
	FlUtils
) {
	"use strict";

	let oLastPromise = (FlUtils.FakePromise ? new FlUtils.FakePromise() : Promise.resolve());
	const oPendingProcessesOnControl = {};

	const Applier = {};

	/**
	 * Formats the log message by replacing placeholders with values and logging the message.
	 *
	 * @param {string} sLogType - Logging type to be used. Possible values: info | warning | debug | error
	 * @param {array.<string>} aMessageComponents - Individual parts of the message text
	 * @param {array.<any>} aValuesToInsert - The values to be used instead of the placeholders in the message
	 * @param {string} [sCallStack] - Passes the call stack to the logging function
	 */
	function formatAndLogMessage(sLogType, aMessageComponents, aValuesToInsert, sCallStack) {
		const sLogMessage = formatMessage(aMessageComponents.join(" "), aValuesToInsert);
		Log[sLogType](sLogMessage, sCallStack || "");
	}

	async function checkControlAndDependentSelectorControls(oChange, mPropertyBag) {
		const oSelector = oChange.getSelector && oChange.getSelector();
		if (!oSelector || (!oSelector.id && !oSelector.name)) {
			throw Error("No selector in change found or no selector ID.");
		}

		function checkFailedSelectors(oSelector) {
			if (FlUtils.indexOfObject(mPropertyBag.failedSelectors, oSelector) > -1) {
				throw Error("A change depending on that control already failed, so the current change is skipped");
			}
		}

		const oControl = await mPropertyBag.modifier.bySelectorTypeIndependent(oSelector, mPropertyBag.appComponent, mPropertyBag.view);
		if (!oControl) {
			throw Error("A flexibility change tries to change a nonexistent control.");
		}
		checkFailedSelectors(oSelector);

		const aDependentControlSelectorList = oChange.getDependentControlSelectorList();
		aDependentControlSelectorList.forEach((oDependentControlSelector) => {
			const oDependentControl = mPropertyBag.modifier.bySelector(
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
	}

	function isXmlModifier(mPropertyBag) {
		return mPropertyBag.modifier.targets === "xmlTree";
	}

	function checkAndAdjustChangeStatus(oControl, oChange, mPropertyBag, bSkipDependencies) {
		// in case of changes in templates, the original control is not always available at this point
		// example: rename on a control created by a change inside a template
		const oOriginalControl = Utils.getControlIfTemplateAffected(oChange, oControl, mPropertyBag).control;
		const oModifier = mPropertyBag.modifier;
		const bHasAppliedCustomData = oOriginalControl
			&& !!FlexCustomData.getAppliedCustomDataValue(oOriginalControl, oChange, oModifier);
		const bIsCurrentlyAppliedOnControl = oOriginalControl
			&& FlexCustomData.hasChangeApplyFinishedCustomData(oOriginalControl, oChange, oModifier);
		const bChangeStatusAppliedFinished = oChange.isApplyProcessFinished();
		if (bChangeStatusAppliedFinished && !bIsCurrentlyAppliedOnControl) {
			// if a change was already processed and is not applied anymore, then the control was destroyed and recreated.
			// In this case we need to recreate/copy the dependencies if we are applying in JS
			if (!bSkipDependencies) {
				FlexObjectState.copyDependenciesFromCompleteDependencyMap(oChange, mPropertyBag.appComponent);
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
		if (isXmlModifier(mPropertyBag) && oChange.getJsOnly()) {
			// change is not capable of xml modifier
			// the change status has to be reset to initial
			const sErrorMessage = "Change cannot be applied in XML. Retrying in JS.";
			oChange.setInitialApplyState();
			throw Error(sErrorMessage);
		}
	}

	async function handleAfterApply(oChange, mControl, oInitializedControl, mPropertyBag) {
		// changeHandler can return a different control, e.g. case where a visible UI control replaces the stashed control placeholder
		if (oInitializedControl instanceof Element) {
			// the newly rendered control could have custom data set from the XML modifier
			mControl.control = oInitializedControl;
		}
		if (mControl.control) {
			await mPropertyBag.modifier.updateAggregation(mControl.originalControl, oChange.getContent().boundAggregation);
		}
		// only save the revert data in the custom data when the change is being processed in XML,
		// as it's only relevant for viewCache at the moment
		await FlexCustomData.addAppliedCustomData(mControl.control, oChange, mPropertyBag, isXmlModifier(mPropertyBag));
		// if a change was reverted previously remove the flag as it is not reverted anymore
		const oResult = {success: true};
		oChange.markSuccessful(oResult);
		return oResult;
	}

	async function handleAfterApplyError(oError, oChange, mControl, mPropertyBag) {
		const bXmlModifier = isXmlModifier(mPropertyBag);
		const oResult = {success: false, error: oError};

		const sChangeId = oChange.getId();
		const sLogMessage = "Change ''{0}'' could not be applied.";
		const bErrorOccurred = oError instanceof Error;
		const sCustomDataIdentifier = FlexCustomData.getCustomDataIdentifier(false, bErrorOccurred, bXmlModifier);
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
		await FlexCustomData.addFailedCustomData(mControl.control, oChange, mPropertyBag, sCustomDataIdentifier);
		// if the change failed during XML processing, the status has to be reset
		// the change will be applied again in JS
		if (bXmlModifier) {
			oChange.setInitialApplyState();
		} else {
			oChange.markFailed(oResult);
		}
		return oResult;
	}

	function logApplyChangeError(oError, oChange) {
		const sChangeType = oChange.getChangeType();
		const sTargetControlId = oChange.getSelector().id;
		const fullQualifiedName = `${oChange.getNamespace() + oChange.getId()}.${oChange.getFileType()}`;

		let sWarningMessage = "A flexibility change could not be applied.";
		sWarningMessage += "\nThe displayed UI might not be displayed as intended.";
		if (oError.message) {
			sWarningMessage += `\n   occurred error message: '${oError.message}'`;
		}
		sWarningMessage += `\n   type of change: '${sChangeType}'`;
		sWarningMessage += `\n   LRep location of the change: ${fullQualifiedName}`;
		sWarningMessage += `\n   id of targeted control: '${sTargetControlId}'.`;

		Log.warning(sWarningMessage, undefined, "sap.ui.fl.apply._internal.changes.Applier");
	}

	function adjustOriginalSelector(oChange, oControl, oAppComponent) {
		const oPropertyBag = {
			appComponent: oAppComponent,
			modifier: JsControlTreeModifier
		};
		const oCurrentOriginalControl = JsControlTreeModifier.bySelector(oChange.originalSelectorToBeAdjusted, oAppComponent);
		let oActualOriginalControl = oControl.getBindingInfo(oChange.getContent().boundAggregation).template;

		// no parent means that the control is the template itself
		if (oCurrentOriginalControl.getParent()) {
			const aStack = [];
			let oTempControl = oCurrentOriginalControl;
			do {
				aStack.push({
					aggregation: oTempControl.sParentAggregationName,
					index: oTempControl.getParent().getAggregation(oTempControl.sParentAggregationName).indexOf(oTempControl)
				});
				oTempControl = oTempControl.getParent();
			} while (oTempControl.getParent());

			aStack.reverse();
			aStack.forEach((oInfo) => {
				oActualOriginalControl = oActualOriginalControl.getAggregation(oInfo.aggregation)[oInfo.index];
			});
		}
		oChange.addDependentControl(oActualOriginalControl, "originalSelector", oPropertyBag);
	}

	function registerOnAfterXMLChangeProcessingHandler(aOnAfterXMLChangeProcessingHandlers, oChangeHandler, oControl) {
		let iChangeHandlerIndex = aOnAfterXMLChangeProcessingHandlers.findIndex((mHandler) => {
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

	async function processControl(oControl, mPropertyBag, oDependencyMap, oAppComponent) {
		const aPromiseStack = [];
		const sControlId = oControl.getId();
		const aChangesForControl = oDependencyMap.mChanges[sControlId] || [];
		let bControlWithDependencies;

		if (oDependencyMap.mControlsWithDependencies[sControlId]) {
			DependencyHandler.removeControlsDependencies(oDependencyMap, sControlId);
			bControlWithDependencies = true;
		}

		aChangesForControl.forEach((oChange) => {
			// in the ExtensionPoint scenario changes can get cloned,
			// in case of a template change the original selector has to be adjusted
			if (oChange.originalSelectorToBeAdjusted) {
				adjustOriginalSelector(oChange, oControl, oAppComponent);
				delete oChange.originalSelectorToBeAdjusted;
			}
			if (oChange._ignoreOnce) {
				delete oChange._ignoreOnce;
			} else if (oChange.isApplyProcessFinished()) {
				DependencyHandler.resolveDependenciesForChange(oDependencyMap, oChange.getId(), sControlId);
			} else if (!oDependencyMap.mDependencies[oChange.getId()]) {
				aPromiseStack.push(async () => {
					await Applier.applyChangeOnControl(oChange, oControl, mPropertyBag);
					DependencyHandler.resolveDependenciesForChange(oDependencyMap, oChange.getId(), sControlId);
				});
			} else {
				const fnCallback = Applier.applyChangeOnControl.bind(Applier, oChange, oControl, mPropertyBag);
				DependencyHandler.addChangeApplyCallbackToDependency(oDependencyMap, oChange.getId(), fnCallback);
			}
		});

		if (aChangesForControl.length || bControlWithDependencies) {
			await FlUtils.execPromiseQueueSequentially(aPromiseStack);
			await DependencyHandler.processDependentQueue(oDependencyMap, oAppComponent, sControlId);
		}
		oPendingProcessesOnControl[sControlId].shift().resolveFunction();
	}

	/**
	 * Sets a specific precondition, which has to be fulfilled before applying all changes on control.
	 *
	 * @param {Promise} oPromise - Promise which is resolved when precondition fulfilled
	 */
	Applier.addPreConditionForInitialChangeApplying = function(oPromise) {
		oLastPromise = oLastPromise.then(() => {
			return oPromise;
		});
	};

	/**
	 * Applies a specific change on the passed control, if it is not already applied.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change object which should be applied on the passed control
	 * @param {sap.ui.core.Control} oControl - Control which is the target of the passed change
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {object} mPropertyBag.view - View to process
	 * @param {object} mPropertyBag.modifier - Polymorph reuse operations handling the changes on the given view type
	 * @param {object} mPropertyBag.appDescriptor - App descriptor containing the metadata of the current application
	 * @param {object} mPropertyBag.appComponent - Component instance that is currently loading
	 * @returns {Promise} Promise that is resolved after all changes were reverted in asynchronous case or FakePromise for the synchronous processing scenario
	 */
	Applier.applyChangeOnControl = async function(oChange, oControl, mPropertyBag) {
		const mControl = Utils.getControlIfTemplateAffected(oChange, oControl, mPropertyBag);
		try {
			const oChangeHandler = mPropertyBag.changeHandler || await Utils.getChangeHandler({
				flexObject: oChange,
				control: mControl.control,
				controlType: mControl.controlType,
				modifier: mPropertyBag.modifier
			});
			checkPreconditions(oChange, mPropertyBag);

			if (oChange.hasApplyProcessStarted()) {
				const oResult = await oChange.addPromiseForApplyProcessing();
				oChange.markSuccessful();
				return oResult;
			}

			if (!oChange.isApplyProcessFinished()) {
				oChange.startApplying();
				try {
					const oInitializedControl = await oChangeHandler.applyChange(oChange, mControl.control, mPropertyBag);
					return handleAfterApply(oChange, mControl, oInitializedControl, mPropertyBag);
				} catch (oError) {
					return handleAfterApplyError(oError, oChange, mControl, mPropertyBag);
				}
			}

			// make sure that everything that goes with finishing the apply process is done, even though the change was already applied
			const oResult = {success: true};
			oChange.markSuccessful(oResult);
			return oResult;
		} catch (oError) {
			return {
				success: false,
				error: oError
			};
		}
	};

	/**
	 * Applies a given array of changes sequentially. If the change was successfully applied it is added to the LiveDependencyMap.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aChanges - FlexObjects to be applied
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {object} mPropertyBag.reference - Flex reference
	 * @param {object} mPropertyBag.appComponent - App Component instance
	 * @returns {Promise<undefined>} Resolves after all changes were applied
	 */
	Applier.applyMultipleChanges = async function(aChanges, mPropertyBag) {
		mPropertyBag.modifier = JsControlTreeModifier;
		for (const oChange of aChanges) {
			const oControl = JsControlTreeModifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent);
			const oLiveDependencyMap = FlexObjectState.getLiveDependencyMap(mPropertyBag.reference);
			if (oControl) {
				checkAndAdjustChangeStatus(oControl, oChange, mPropertyBag, true);
				if (!oChange.isApplyProcessFinished()) {
					oChange.setQueuedForApply();
				}
				let oResult;
				try {
					oResult = await Applier.applyChangeOnControl(oChange, oControl, mPropertyBag);
				} catch (oError) {
					oResult = {success: false};
				}
				if (oResult.success) {
					DependencyHandler.addRuntimeChangeToMap(oChange, mPropertyBag.appComponent, oLiveDependencyMap);
				}
			} else {
				DependencyHandler.addChangeAndUpdateDependencies(oChange, mPropertyBag.appComponent.getId(), oLiveDependencyMap);
			}
		}
	};

	/**
	 * Gets the dependency map and gets all changes for that control from the map, then, depending on
	 * dependencies, directly applies the change or saves the callback to apply in the dependency.
	 *
	 * @param {object} oAppComponent - Component instance that is currently loading
	 * @param {string} sReference - Flex reference
	 * @param {sap.ui.core.Control} oControl Instance of the control to which changes should be applied
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Resolves as soon as all changes for the control are applied
	 */
	Applier.applyAllChangesForControl = async function(oAppComponent, sReference, oControl) {
		// the changes have to be queued synchronously
		// scenario 1: n controls get created, for all this function is called synchronously. Changes have to be queued synchronously
		// scenario 2: control gets recreated, the changes for the new control have to be queued after the processing of the old control
		const oDependencyMap = FlexObjectState.getLiveDependencyMap(sReference);
		const sControlId = oControl.getId();
		const aChangesForControl = oDependencyMap.mChanges[sControlId] || [];
		const mPropertyBag = {
			modifier: JsControlTreeModifier,
			appComponent: oAppComponent,
			view: FlUtils.getViewForControl(oControl)
		};

		// if there are still changes being processed for the current control, wait for the last of them to be finished
		if (oPendingProcessesOnControl[sControlId]?.length) {
			await oPendingProcessesOnControl[sControlId][oPendingProcessesOnControl[sControlId].length - 1].promise;
		}

		aChangesForControl.forEach((oChange) => {
			checkAndAdjustChangeStatus(oControl, oChange, mPropertyBag);
			if (!oChange.isApplyProcessFinished() && !oChange._ignoreOnce) {
				oChange.setQueuedForApply();
			}
		});

		oPendingProcessesOnControl[sControlId] ||= [];
		const oNewPromise = {};
		oNewPromise.promise = new Promise((resolve) => {
			oNewPromise.resolveFunction = resolve;
		});
		oPendingProcessesOnControl[sControlId].push(oNewPromise);

		// make sure that the current control waits for the previous control to be processed
		oLastPromise = oLastPromise.then(processControl.bind(undefined, oControl, mPropertyBag, oDependencyMap, oAppComponent));
		return oLastPromise;
	};

	/**
	 * Loops over all retrieved flexibility changes and applies them onto the targeted control within the view.
	 *
	 * @param {object} mPropertyBag - Collection of cross-functional attributes
	 * @param {object} mPropertyBag.view - View to process
	 * @param {string} mPropertyBag.viewId - ID of the processed view
	 * @param {string} mPropertyBag.appComponent - Application component instance responsible for the view
	 * @param {object} mPropertyBag.modifier - Polymorph reuse operations handling the changes on the given view type
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aChanges List of flexibility changes on controls for the current processed view
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Promise that is resolved after all changes were reverted in asynchronous case or FakePromise for the synchronous processing scenario including view object in both cases
	 */
	Applier.applyAllChangesForXMLView = async function(mPropertyBag, aChanges) {
		if (!Array.isArray(aChanges)) {
			const sErrorMessage = `No list of changes was passed for processing the flexibility on view: ${mPropertyBag.view}.`;
			Log.error(sErrorMessage, undefined, "sap.ui.fl.apply._internal.changes.Applier");
			aChanges = [];
		}

		const aOnAfterXMLChangeProcessingHandlers = [];
		mPropertyBag.failedSelectors = [];

		for (const oChange of aChanges) {
			try {
				const oControl = await checkControlAndDependentSelectorControls(oChange, mPropertyBag);
				const mControl = Utils.getControlIfTemplateAffected(oChange, oControl, mPropertyBag);
				mPropertyBag.changeHandler = await Utils.getChangeHandler({
					flexObject: oChange,
					control: mControl.control,
					controlType: mControl.controlType,
					modifier: mPropertyBag.modifier
				});
				oChange.setQueuedForApply();
				checkAndAdjustChangeStatus(oControl, oChange, mPropertyBag, true);

				if (!oChange.isApplyProcessFinished()) {
					if (typeof mPropertyBag.changeHandler.onAfterXMLChangeProcessing === "function") {
						registerOnAfterXMLChangeProcessingHandler(
							aOnAfterXMLChangeProcessingHandlers,
							mPropertyBag.changeHandler,
							oControl
						);
					}
					const oResult = await Applier.applyChangeOnControl(oChange, oControl, mPropertyBag);
					if (!oResult.success) {
						throw Error(oResult.error);
					}
				}
			} catch (oError) {
				oChange.getDependentSelectorList().forEach((oDependentControlSelector) => {
					if (FlUtils.indexOfObject(mPropertyBag.failedSelectors, oDependentControlSelector) === -1) {
						mPropertyBag.failedSelectors.push(oDependentControlSelector);
					}
				});
				logApplyChangeError(oError, oChange);
			}
		}

		delete mPropertyBag.failedSelectors;

		// Once all changes for a control are processed, call the
		// onAfterXMLChangeProcessing hooks of all involved change handlers
		aOnAfterXMLChangeProcessingHandlers.forEach((mHandler) => {
			mHandler.controls.forEach((oControl) => {
				try {
					mHandler.handler.onAfterXMLChangeProcessing(oControl, mPropertyBag);
				} catch (oError) {
					Log.error("Error during onAfterXMLChangeProcessing", oError);
				}
			});
		});

		return mPropertyBag.view;
	};
	return Applier;
});