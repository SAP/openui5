/*!
* ${copyright}
*/

// Provides object sap.ui.fl.apply._internal.extensionPoint.Processor
sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/changes/ExtensionPointState",
	"sap/ui/fl/Utils",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/base/util/merge"
],
function(
	Applier,
	FlexState,
	ExtensionPointState,
	Utils,
	JsControlTreeModifier,
	merge
) {
	"use strict";

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
		oExtensionPointRegistry: undefined,
		oRegistryPromise: Promise.resolve(),

		registerExtensionPoint: function (mExtensionPointInfo) {
			Processor.oRegistryPromise = Processor.oRegistryPromise.then(function () {
				return new Promise(function (resolve, reject) {
					if (Processor.oExtensionPointRegistry) {
						Processor.oExtensionPointRegistry.registerExtensionPoint(mExtensionPointInfo);
						return resolve();
					} else if (sap.ui.getCore().getConfiguration().getDesignMode()) {
						sap.ui.require(["sap/ui/fl/write/_internal/extensionPoint/Registry"], function (ExtensionPointRegistry) {
							Processor.oExtensionPointRegistry = ExtensionPointRegistry;
							ExtensionPointRegistry.registerExtensionPoint(mExtensionPointInfo);
							resolve();
						}, function (oError) {
							reject(oError);
						});
					} else {
						resolve();
					}
				});
			});
			return Processor.oRegistryPromise;
		},

		createDefaultContent: function (oExtensionPoint, aChanges) {
			if (aChanges.length === 0) {
				return oExtensionPoint.createDefault()
					.then(function (aControls) {
						aControls.forEach(function(oNewControl, iIterator) {
							JsControlTreeModifier.insertAggregation(
								oExtensionPoint.targetControl,
								oExtensionPoint.aggregationName,
								oNewControl,
								oExtensionPoint.index + iIterator,
								oExtensionPoint.view
							);
						});
						oExtensionPoint.ready(aControls);
						return aControls;
					});
			}
			return Promise.resolve([]);
		},

		addDefaultContentToExtensionPointInfo: function (mExtensionPointInfo, aControls) {
			mExtensionPointInfo.defaultContent = mExtensionPointInfo.defaultContent.concat(aControls);
		},

		applyExtensionPoint: function(oExtensionPoint) {
			var oAppComponent = Utils.getAppComponentForControl(oExtensionPoint.targetControl);
			var mPropertyBag = {};
			var mExtensionPointInfo = merge({defaultContent: []}, oExtensionPoint);
			mPropertyBag.appComponent = oAppComponent;
			mPropertyBag.modifier = JsControlTreeModifier;
			mPropertyBag.viewId = oExtensionPoint.view.getId();
			mPropertyBag.componentId = oAppComponent.getId();

			var oPromise = Processor.registerExtensionPoint(mExtensionPointInfo)
				.then(FlexState.initialize.bind(FlexState, mPropertyBag))
				// enhance exiting extension point changes with mExtensionPointInfo
				.then(ExtensionPointState.enhanceExtensionPointChanges.bind(ExtensionPointState, mPropertyBag, mExtensionPointInfo))
				.then(Processor.createDefaultContent.bind(this, oExtensionPoint))
				.then(Processor.addDefaultContentToExtensionPointInfo.bind(this, mExtensionPointInfo));

			Applier.addPreConditionForInitialChangeApplying(oPromise);
			return oPromise;
		}
	};

	return Processor;
});