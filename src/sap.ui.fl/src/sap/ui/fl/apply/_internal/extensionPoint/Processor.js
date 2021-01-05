/*!
* ${copyright}
*/

// Provides object sap.ui.fl.apply._internal.extensionPoint.Processor
sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/ExtensionPointRegistry",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/base/util/merge",
	"sap/base/util/restricted/_omit",
	"sap/base/Log"
],
function(
	DependencyHandler,
	ChangePersistenceFactory,
	Applier,
	FlexState,
	ChangesWriteAPI,
	Utils,
	ExtensionPointRegistry,
	JsControlTreeModifier,
	merge,
	_omit,
	Log
) {
	'use strict';

	function checkForExtensionPoint(oExtensionPoint, aControls) {
		var aNestedExtensionPointPromises = [];
		var aResolvedControls = [];
		var iNestedEPAdditionalContentCounter = 0;
		var oLastExtensionPoint;
		// aControls is a list of controls and extension points
		aControls.forEach(function(oControl, iControlIndex) {
			if (oControl._isExtensionPoint) {
				oControl.targetControl = oExtensionPoint.targetControl;
				oControl.aggregationName = oExtensionPoint.aggregationName;
				oControl.fragmentId = oExtensionPoint.fragmentId;
				oControl.index = iControlIndex;
				if (oLastExtensionPoint) {
					oLastExtensionPoint._nextSibling = oControl;
				}
				oLastExtensionPoint = oControl;

				// is required to calculate the index into the changehandler
				oControl.referencedExtensionPoint = oExtensionPoint;
				aNestedExtensionPointPromises.push(function () {
					return applyExtensionPoint(oControl, true)
						.then(function(aNestedControls) {
							aNestedControls.forEach(function(oNestedControl, iNestedControlIndex) {
								aResolvedControls.splice(iControlIndex + iNestedControlIndex + iNestedEPAdditionalContentCounter, 0, oNestedControl);
							});
							oControl.index += iNestedEPAdditionalContentCounter;
							// the iControlIndex counts the extensionpoint as 1 control. when the EP is replaced by content with more then one  control
							// then we need to have an additional content counter for correct index calculations for the following extension points
							iNestedEPAdditionalContentCounter += (aNestedControls.length - 1);
						});
				});
			} else {
				aResolvedControls.push(oControl);
			}
		});
		if (aNestedExtensionPointPromises.length > 0) {
			// execution of promises sequentially and finaly return the resolved controls properties
			aNestedExtensionPointPromises.push(function() {
				return aResolvedControls;
			});
			return aNestedExtensionPointPromises.reduce(function (oPreviousPromise, oCurrentPromise) {
				return oPreviousPromise.then(oCurrentPromise);
			}, Promise.resolve());
		}
		return Promise.resolve(aResolvedControls);
	}

	function createDefaultContent(oExtensionPoint, mRegsteredExtensionPoint, bSkipInsertContent) {
		return oExtensionPoint.createDefault()
			.then(checkForExtensionPoint.bind(undefined, oExtensionPoint))
			.then(function (aControls) {
				if (!bSkipInsertContent) {
					aControls.forEach(function(oNewControl, iIterator) {
						mRegsteredExtensionPoint.defaultContent.push(oNewControl);
						JsControlTreeModifier.insertAggregation(
							oExtensionPoint.targetControl,
							oExtensionPoint.aggregationName,
							oNewControl,
							oExtensionPoint.index + iIterator,
							oExtensionPoint.view
						);
					});
					oExtensionPoint.ready(aControls);
				}
				return aControls;
			});
	}

	function getViewId(mExtensionPointInfo) {
		var oViewId;
		if (mExtensionPointInfo.view.isA("sap.ui.core.Fragment")) {
			var oController = mExtensionPointInfo.view.getController();
			var oControllerView = oController && oController.getView();
			oViewId = oControllerView && oControllerView.getId();
			if (!oViewId) {
				Log.error("Could not find responsible view on fragment containing extension points. "
					+ "Please provide controller with attached view on fragment instantiation! Fragment name: "
					+ mExtensionPointInfo.view.getId()
					+ " / extension point name: "
					+ mExtensionPointInfo.name);
			}
		}
		return oViewId || mExtensionPointInfo.view.getId();
	}

	function isValidForRuntimeOnlyChanges(oChange, mExtensionPointInfo) {
		if (mExtensionPointInfo.fragmentId) {
			var oExtensionPointFromChange = oChange.getExtensionPointInfo && oChange.getExtensionPointInfo();
			if (oExtensionPointFromChange) {
				return mExtensionPointInfo.fragmentId !== oExtensionPointFromChange.fragmentId;
			}
			return true;
		}
		return false;
	}

	function replaceChangeSelector(oChange, oExtensionPoint, bOriginalSelectorNeedsToBeAdjusted) {
		var mSelector = oChange.getSelector();
		if (oExtensionPoint.closestAggregationBindingCarrier && oExtensionPoint.closestAggregationBinding) {
			// processing for extension points positioned into an aggregation template
			mSelector = merge(mSelector, {
				id: oExtensionPoint.closestAggregationBindingCarrier,
				idIsLocal: false
			});
			var oChangeDefinition = oChange.getDefinition();
			var mOriginalSelector = {
				id: oExtensionPoint.targetControl.getId(),
				idIsLocal: false
			};
			if (!oChangeDefinition.dependentSelector) {
				oChangeDefinition.dependentSelector = {};
			}
			if (bOriginalSelectorNeedsToBeAdjusted) {
				oChange.originalSelectorToBeAdjusted = mOriginalSelector;
				delete oChangeDefinition.dependentSelector.originalSelector;
			} else {
				oChangeDefinition.dependentSelector.originalSelector = mOriginalSelector;
			}
			oChangeDefinition.content.boundAggregation = oExtensionPoint.closestAggregationBinding;
		} else {
			mSelector = merge(mSelector, {
				id: oExtensionPoint.targetControl.getId(),
				idIsLocal: false
			});
		}
		oChange.setSelector(mSelector);
	}

	function applyExtensionPoint(oExtensionPoint, bSkipInsertContent) {
		var oAppComponent = Utils.getAppComponentForControl(oExtensionPoint.targetControl);
		var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oExtensionPoint.targetControl);
		var mPropertyBag = {};
		mPropertyBag.appComponent = oAppComponent;
		mPropertyBag.modifier = JsControlTreeModifier;
		mPropertyBag.name = oExtensionPoint.name;
		mPropertyBag.componentId = oAppComponent.getId();

		var oExtensionPointRegistry = ExtensionPointRegistry.getInstance();
		var mExtensionPointInfo = merge({defaultContent: []}, oExtensionPoint);

		var oViewId = getViewId(oExtensionPoint);
		mPropertyBag.viewId = oViewId;
		mExtensionPointInfo.viewId = oViewId;
		oExtensionPointRegistry.registerExtensionPoints(mExtensionPointInfo);

		var oPromise = FlexState.initialize(mPropertyBag)
			.then(oChangePersistence.getChangesForExtensionPoint.bind(oChangePersistence, mPropertyBag))
			.then(function (aChanges) {
				if (aChanges.length === 0) {
					return createDefaultContent(oExtensionPoint, mExtensionPointInfo, bSkipInsertContent);
				}
				var aPromises = [];
				aChanges.forEach(function (oChange) {
					//Only continue process if the change has not been applied, such as in case of XMLPreprocessing of an async view
					if (oChange.isInInitialState() && !(oChange.getExtensionPointInfo && oChange.getExtensionPointInfo())) {
						oChange.setExtensionPointInfo(oExtensionPoint);

						//Set correct selector from extension point targetControl's ID
						replaceChangeSelector(oChange, oExtensionPoint, false);

						//If the component creation is async, the changesMap already created without changes on EP --> it need to be updated
						//Otherwise, update the selector of changes is enough, change map will be created later correctly
						if (oChangePersistence.isChangeMapCreated()) {
							oChangePersistence._addChangeAndUpdateDependencies(oAppComponent, oChange);
						}
					} else if (isValidForRuntimeOnlyChanges(oChange, mExtensionPointInfo)) {
						//OR change is applied but we need to create additional runtime only changes
						//in case of duplicate extension points with different fragment id (fragment as template)
						var oChangeDefinition = oChange.getDefinition();
						var mChangeSpecificData = _omit(oChangeDefinition, ["dependentSelector", "fileName", "selector", "content"]);
						Object.keys(oChangeDefinition.content).forEach(function (sKey) {
							mChangeSpecificData[sKey] = oChangeDefinition.content[sKey];
						});
						mChangeSpecificData.support.sourceChangeFileName = oChangeDefinition.fileName || "";
						aPromises.push(ChangesWriteAPI.create({
							changeSpecificData: mChangeSpecificData,
							selector: {
								view: oExtensionPoint.view,
								name: oExtensionPoint.name
							}
						})
							.then(function (oRuntimeOnlyChange) {
								//Set correct selector from extension point targetControl's ID
								replaceChangeSelector(oRuntimeOnlyChange, oExtensionPoint, true);
								oRuntimeOnlyChange.setExtensionPointInfo(oExtensionPoint);
								oRuntimeOnlyChange.setModuleName(oChangeDefinition.moduleName);
								oRuntimeOnlyChange.getDefinition().creation = oChangeDefinition.creation;
								DependencyHandler.insertChange(oRuntimeOnlyChange, oChangePersistence._mChanges, oChange);
								oChangePersistence._addChangeAndUpdateDependencies(oAppComponent, oRuntimeOnlyChange);
							})
						);
					}
				});
				return Promise.all(aPromises);
			});
		if (!bSkipInsertContent) {
			oExtensionPointRegistry.addApplyExtensionPointPromise(oPromise);
			Applier.setPreConditionForApplyAllChangesOnControl(oExtensionPointRegistry.getApplyExtensionPointsPromise());
		}
		return oPromise;
	}

	/**
	 * Implements the <code>Extension Points</code> provider by SAPUI5 flexibility that can be hooked in the <code>sap.ui.core.ExtensionPoint</code> life cycle.
	 *
	 * @name sap.ui.fl.apply._internal.extensionxPoint.Processor
	 * @class
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 */
	var Processor = {
		/**
		 * Registration of extension points for the creation process in designtime.
		 * As well as creation of default content of extension point or preparation of flex changes
		 * based on the extension points to be able to be applied.
		 *
		 * @param {sap.ui.core.ExtensionPoint} oExtensionPoint - info object with extension point information
		 * @returns {Promise} resolves when default content is created or related changes are prepared for application
		 */
		applyExtensionPoint: function(oExtensionPoint) {
			return applyExtensionPoint(oExtensionPoint, false);
		}
	};

	return Processor;
});