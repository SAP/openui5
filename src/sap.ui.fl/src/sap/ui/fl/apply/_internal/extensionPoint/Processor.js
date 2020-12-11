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

	function createSelectorWithTargetControl(oChange, oExtensionPoint) {
		var oSelector = oChange.getSelector();
		oSelector.id = oExtensionPoint.targetControl.getId();
		oSelector.idIsLocal = false;
		return oSelector;
	}

	/**
	 * Implements the <code>Extension Points</code> provider by SAPUI5 flexibility that can be hooked in the <code>sap.ui.core.ExtensionPoint</code> life cycle.
	 *
	 * @name sap.ui.fl.apply._internal.extensionPoint.Processor
	 * @class
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 */
	var Processor = {
		applyExtensionPoint: function(oExtensionPoint) {
			var oAppComponent = Utils.getAppComponentForControl(oExtensionPoint.targetControl);
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oExtensionPoint.targetControl);
			var mPropertyBag = {};
			mPropertyBag.appComponent = oAppComponent;
			mPropertyBag.modifier = JsControlTreeModifier;
			mPropertyBag.name = oExtensionPoint.name;
			mPropertyBag.componentId = oAppComponent.getId();

			// //TODO: get rid of workaround with _sExplicitId
			// if (oExtensionPoint.view.isA("sap.ui.core.Fragment")) {
			// 	oExtensionPoint.fragmentId = oExtensionPoint.view._sExplicitId;
			// }

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
						//default content
						oExtensionPoint.createDefault().then(function (aControls) {
							aControls.forEach(function(oNewControl, iIterator) {
								mExtensionPointInfo.defaultContent.push(oNewControl);
								JsControlTreeModifier.insertAggregation(oExtensionPoint.targetControl, oExtensionPoint.aggregationName, oNewControl, oExtensionPoint.index + iIterator, oExtensionPoint.view);
							});
							oExtensionPoint.ready(aControls);
						});
					} else {
						var aPromises = [];
						aChanges.forEach(function (oChange) {
							//Only continue process if the change has not been applied, such as in case of XMLPreprocessing of an async view
							if (oChange.isInInitialState() && !(oChange.getExtensionPointInfo && oChange.getExtensionPointInfo())) {
								oChange.setExtensionPointInfo(oExtensionPoint);

								//Set correct selector from extension point targetControl's ID
								oChange.setSelector(createSelectorWithTargetControl(oChange, oExtensionPoint));

								//If the component creation is async, the changesMap already created without changes on EP --> it need to be updated
								//Otherwise, update the selector of changes is enough, change map will be created later correctly
								if (oChangePersistence.isChangeMapCreated()) {
									oChangePersistence._addChangeAndUpdateDependencies(oAppComponent, oChange);
								}
							} else if (isValidForRuntimeOnlyChanges(oChange, mExtensionPointInfo)) {
								//OR change is applied but we need to create additional runtime only changes
								//in case of duplicate extension points with different fragment id (fragment as template)
								var oChangeDefinition = oChange.getDefinition();
								var mChangeSpecificData = _omit(oChangeDefinition, ["fileName", "selector", "content"]);
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
										oRuntimeOnlyChange.setSelector(createSelectorWithTargetControl(oRuntimeOnlyChange, oExtensionPoint));
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
					}
				});
			oExtensionPointRegistry.addApplyExtensionPointPromise(oPromise);
			Applier.setPreConditionForApplyAllChangesOnControl(oExtensionPointRegistry.getApplyExtensionPointsPromise());
			return oPromise;
		}
	};

	return Processor;
});