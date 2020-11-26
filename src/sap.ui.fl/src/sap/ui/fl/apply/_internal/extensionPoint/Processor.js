/*!
* ${copyright}
*/

// Provides object sap.ui.fl.apply._internal.extensionPoint.Processor
sap.ui.define([
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/ExtensionPointRegistry",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/base/util/merge",
	"sap/base/Log"
],
function(
	ChangePersistenceFactory,
	Applier,
	FlexState,
	Utils,
	ExtensionPointRegistry,
	JsControlTreeModifier,
	merge,
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
						aChanges.forEach(function (oChange) {
							//Only continue process if the change has not been applied, such as in case of XMLPreprocessing of an async view
							if (oChange.isInInitialState()) {
								oChange.setExtensionPointInfo(oExtensionPoint);

								//Set correct selector from targetControl's ID
								var oSelector = oChange.getSelector();
								oSelector.id = oExtensionPoint.targetControl.getId();
								oSelector.idIsLocal = false;
								oChange.setSelector(oSelector);

								//If the component creation is async, the changesMap already created without changes on EP --> it need to be updated
								//Otherwise, update the selector of changes is enough, change map will be created later correctly
								if (oChangePersistence.isChangeMapCreated()) {
									oChangePersistence._addChangeAndUpdateDependencies(oAppComponent, oChange);
								}
							}
						});
					}
				});
			oExtensionPointRegistry.addApplyExtensionPointPromise(oPromise);
			Applier.setPreConditionForApplyAllChangesOnControl(oExtensionPointRegistry.getApplyExtensionPointsPromise());
			return oPromise;
		}
	};

	return Processor;
});