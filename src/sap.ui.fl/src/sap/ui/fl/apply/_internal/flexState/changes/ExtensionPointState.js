/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/merge",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/Utils"
], (
	_omit,
	merge,
	Log,
	JsControlTreeModifier,
	ChangesUtils,
	FlexObjectFactory,
	FlexObjectStates,
	UIChangesState,
	FlexState,
	ManifestUtils,
	ChangeHandlerStorage,
	ChangePersistenceFactory,
	Utils
) => {
	"use strict";

	/**
	 * Handler class to manipulate extension point changes.
	 * Extension point changes are extended by the extension point information that is required when the flex change is applied.
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.changes.ExtensionPointState
	 * @since 1.79
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	const ExtensionPointState = {};

	function isValidForRuntimeOnlyChanges(oChange, mExtensionPointInfo) {
		if (mExtensionPointInfo.fragmentId) {
			const oExtensionPointFromChange = oChange.getExtensionPointInfo && oChange.getExtensionPointInfo();
			if (oExtensionPointFromChange) {
				return mExtensionPointInfo.fragmentId !== oExtensionPointFromChange.fragmentId;
			}
			return true;
		}
		return false;
	}

	function replaceChangeSelector(oChange, oExtensionPoint, bOriginalSelectorNeedsToBeAdjusted) {
		let mSelector = oChange.getSelector();
		if (oExtensionPoint.closestAggregationBindingCarrier && oExtensionPoint.closestAggregationBinding) {
			// processing for extension points positioned into an aggregation template
			mSelector = merge(mSelector, {
				id: oExtensionPoint.closestAggregationBindingCarrier,
				idIsLocal: false
			});
			const mOriginalSelector = {
				id: oExtensionPoint.targetControl.getId(),
				idIsLocal: false
			};
			if (bOriginalSelectorNeedsToBeAdjusted) {
				oChange.originalSelectorToBeAdjusted = mOriginalSelector;
			} else {
				oChange.setDependentSelectors({originalSelector: mOriginalSelector});
			}
			oChange.setContent({boundAggregation: oExtensionPoint.closestAggregationBinding});
		} else {
			mSelector = merge(mSelector, {
				id: oExtensionPoint.targetControl.getId(),
				idIsLocal: false
			});
		}
		oChange.setSelector(mSelector);
	}

	function createAndCompleteFlexObjectWithChangeHandlerInfo(mPropertyBag) {
		const oFlexObject = FlexObjectFactory.createUIChange(mPropertyBag.changeSpecificData);
		return ChangeHandlerStorage.getChangeHandler(
			oFlexObject.getChangeType(),
			mPropertyBag.controlType,
			mPropertyBag.selector,
			JsControlTreeModifier,
			oFlexObject.getLayer()
		)
		.then((oChangeHandler) => {
			return oChangeHandler.completeChangeContent(oFlexObject, mPropertyBag.changeSpecificData, {
				modifier: JsControlTreeModifier,
				appComponent: mPropertyBag.appComponent,
				view: Utils.getViewForControl(mPropertyBag.selector)
			});
		})
		.then(() => {
			// completeChangeContent changes the content and might make it dirty
			oFlexObject.setState(FlexObjectStates.LifecycleState.NEW);
			return oFlexObject;
		});
	}

	function createAdditionalChange(mPropertyBag) {
		if (mPropertyBag.selector.name && mPropertyBag.selector.view) {
			const oAppComponent = Utils.getAppComponentForSelector(mPropertyBag.selector.view);
			const sReference = mPropertyBag.selector.appId || ManifestUtils.getFlexReferenceForControl(oAppComponent);
			mPropertyBag.appComponent = oAppComponent;
			mPropertyBag.changeSpecificData.reference = sReference;

			mPropertyBag.changeSpecificData.selector = {
				name: mPropertyBag.selector.name,
				viewSelector: JsControlTreeModifier.getSelector(mPropertyBag.selector.view.getId(), oAppComponent)
			};
			return createAndCompleteFlexObjectWithChangeHandlerInfo(mPropertyBag);
		}
		return undefined;
	}

	/**
	 * Gets the changes for the given extension point.
	 *
	 * @param {string} sReference - Flex reference of the application
	 * @param {object} mPropertyBag - Additional data that are needed to read the changes
	 * @param {string} mPropertyBag.viewId - ID of the view
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component for the extension point
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Responsible modifier
	 * @param {string} mPropertyBag.extensionPointName - Name of the extension point
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Returns an array of FlexObjects
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.extensionPoint.Processor
	 */
	ExtensionPointState.getChangesForExtensionPoint = function(sReference, mPropertyBag) {
		if (!mPropertyBag.extensionPointName) {
			Log.error("Missing name from extension point info!");
			return [];
		}
		const aFlexObjects = UIChangesState.getAllApplicableUIChanges(sReference);
		return aFlexObjects.filter((oFlexObject) => {
			if (oFlexObject.getSelector().name !== mPropertyBag.extensionPointName) {
				return false;
			}
			return ChangesUtils.isChangeInView(mPropertyBag, oFlexObject);
		});
	};

	/**
	 * Enhances the extension point changes by extension point information and selector.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Manifest that belongs to current component
	 * @param {string} mPropertyBag.viewId - View ID
	 * @param {object} mPropertyBag.targetControl - Target control instance
	 * @param {object} mExtensionPointInfo - Map of extension point information
	 * @returns {Promise} Promise that resolves with enhanced extension point changes if available, or is rejected if an error occurs
	 *
	 * @private
	 * @ui5-restricted
	 */
	ExtensionPointState.enhanceExtensionPointChanges = function(mPropertyBag, mExtensionPointInfo) {
		mPropertyBag.extensionPointName = mExtensionPointInfo.name;
		const oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(mExtensionPointInfo.targetControl);
		const sReference = ManifestUtils.getFlexReferenceForControl(mExtensionPointInfo.targetControl);

		const aChanges = ExtensionPointState.getChangesForExtensionPoint(sReference, mPropertyBag);
		const aPromises = [];
		aChanges.forEach(function(oChange) {
			// Only continue process if the change has not been applied, such as in case of XMLPreprocessing of an async view
			if (oChange.isInInitialState() && !(oChange.getExtensionPointInfo && oChange.getExtensionPointInfo())) {
				oChange.setExtensionPointInfo(mExtensionPointInfo);

				// Set correct selector from extension point targetControl's ID
				replaceChangeSelector(oChange, mExtensionPointInfo, false);

				// If the component creation is async, the changesMap already created without changes on EP --> it need to be updated
				// Otherwise, update the selector of changes is enough, change map will be created later correctly
				if (FlexState.isInitialized(mPropertyBag)) {
					oChangePersistence.addChangeAndUpdateDependencies(mPropertyBag.appComponent, oChange);
				}
			} else if (isValidForRuntimeOnlyChanges(oChange, mExtensionPointInfo)) {
				// Change is applied but we need to create additional runtime only changes
				// in case of duplicate extension points with different fragment id (fragment as template)
				const oChangeFileContent = oChange.convertToFileContent();
				const oChangeContent = oChange.getContent();
				const mChangeSpecificData = _omit(oChangeFileContent, [
					"dependentSelector",
					"fileName",
					"selector",
					"content",
					"adaptationId"
				]);
				Object.keys(oChangeContent).forEach(function(sKey) {
					mChangeSpecificData[sKey] = oChangeContent[sKey];
				});
				mChangeSpecificData.support.sourceChangeFileName = oChange.getId() || "";
				aPromises.push(
					createAdditionalChange({
						changeSpecificData: mChangeSpecificData,
						selector: {
							view: mExtensionPointInfo.view,
							name: mExtensionPointInfo.name
						}
					})
					.then(function(oRuntimeOnlyChange) {
						// Set correct selector from extension point targetControl's ID
						replaceChangeSelector(oRuntimeOnlyChange, mExtensionPointInfo, true);
						oRuntimeOnlyChange.setExtensionPointInfo(mExtensionPointInfo);
						const oFlexObjectMetadata = oRuntimeOnlyChange.getFlexObjectMetadata();
						oFlexObjectMetadata.moduleName = oChange.getFlexObjectMetadata().moduleName;
						oRuntimeOnlyChange.setFlexObjectMetadata(oFlexObjectMetadata);
						oRuntimeOnlyChange.setCreation(oChange.getCreation());
						oChangePersistence.addChangeAndUpdateDependencies(mPropertyBag.appComponent, oRuntimeOnlyChange, oChange);
						aPromises.push(oRuntimeOnlyChange);
					})
				);
			}
		});
		return Promise.all(aPromises)
		.then(function() {
			return aChanges;
		});
	};

	return ExtensionPointState;
});