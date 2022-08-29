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
	"sap/ui/base/SyncPromise",
	"sap/base/util/merge",
	"sap/ui/core/Configuration"
],
function(
	Applier,
	FlexState,
	ExtensionPointState,
	Utils,
	JsControlTreeModifier,
	SyncPromise,
	merge,
	Configuration
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
	var Processor;

	function executeNestedExtensionPoint(oControl, aResolvedControls, iControlIndex, iNestedEPAdditionalContentCounter, fnNestedCallback) {
		return fnNestedCallback(oControl, true)
			.then(function(aNestedControls) {
				aNestedControls.forEach(function(oNestedControl, iNestedControlIndex) {
					aResolvedControls.splice(iControlIndex + iNestedControlIndex + iNestedEPAdditionalContentCounter, 0, oNestedControl);
				});
				oControl.index += iNestedEPAdditionalContentCounter;
				// the iControlIndex counts the extensionpoint as 1 control. when the EP is replaced by content with more then one  control
				// then we need to have an additional content counter for correct index calculations for the following extension points
				return aNestedControls.length - 1;
			});
	}

	function checkForExtensionPoint(oExtensionPoint, fnNestedCallback, aControls) {
		var aNestedExtensionPointPromises = [];
		var aResolvedControls = [];
		var iNestedEPAdditionalContentCounter = 0;
		var oLastExtensionPoint;
		// aControls is a list of controls and extension points
		aControls.forEach(function (oControl, iControlIndex) {
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
					return executeNestedExtensionPoint(
						oControl,
						aResolvedControls,
						iControlIndex,
						iNestedEPAdditionalContentCounter,
						fnNestedCallback
					).then(function (iNestedCounter) {
						iNestedEPAdditionalContentCounter += iNestedCounter;
					});
				}
				);
			} else {
				aResolvedControls.push(oControl);
			}
		});
		if (aNestedExtensionPointPromises.length > 0) {
			return aNestedExtensionPointPromises.reduce(function (oPreviousPromise, oCurrentPromise) {
				return oPreviousPromise.then(oCurrentPromise);
			}, SyncPromise.resolve())
				.then(function () {
					return aResolvedControls;
				});
		}
		return SyncPromise.resolve(aResolvedControls);
	}

	function applyExtensionPoint(oExtensionPoint, bSkipInsertContent) {
		var oAppComponent = Utils.getAppComponentForControl(oExtensionPoint.targetControl);
		var mPropertyBag = {};
		var mExtensionPointInfo = merge({defaultContent: []}, oExtensionPoint);
		mPropertyBag.appComponent = oAppComponent;
		mPropertyBag.modifier = JsControlTreeModifier;
		mPropertyBag.viewId = oExtensionPoint.view.getId();
		mPropertyBag.componentId = oAppComponent.getId();

		return Processor.registerExtensionPoint(mExtensionPointInfo)
			.then(FlexState.initialize.bind(FlexState, mPropertyBag))
			// enhance exiting extension point changes with mExtensionPointInfo
			.then(ExtensionPointState.enhanceExtensionPointChanges.bind(ExtensionPointState, mPropertyBag, oExtensionPoint))
			.then(Processor.createDefaultContent.bind(this, oExtensionPoint, bSkipInsertContent, applyExtensionPoint))
			.then(Processor.addDefaultContentToExtensionPointInfo.bind(this, mExtensionPointInfo, bSkipInsertContent));
	}

	Processor = {
		oExtensionPointRegistry: undefined,
		oRegistryPromise: Promise.resolve(),

		registerExtensionPoint: function (mExtensionPointInfo) {
			if (Configuration.getDesignMode()) {
				if (Processor.oExtensionPointRegistry) {
					Processor.oExtensionPointRegistry.registerExtensionPoint(mExtensionPointInfo);
					return SyncPromise.resolve();
				}

				Processor.oRegistryPromise = Processor.oRegistryPromise.then(function () {
					return new Promise(function (resolve, reject) {
						sap.ui.require(["sap/ui/fl/write/_internal/extensionPoint/Registry"], function (ExtensionPointRegistry) {
							Processor.oExtensionPointRegistry = ExtensionPointRegistry;
							ExtensionPointRegistry.registerExtensionPoint(mExtensionPointInfo);
							resolve();
						}, function (oError) {
							reject(oError);
						});
					});
				});
				return Processor.oRegistryPromise;
			}
			return SyncPromise.resolve();
		},

		createDefaultContent: function (oExtensionPoint, bSkipInsertContent, fnNestedCallback, aChanges) {
			if (aChanges.length === 0) {
				return oExtensionPoint.createDefault()
					.then(checkForExtensionPoint.bind(undefined, oExtensionPoint, fnNestedCallback))
					.then(function (aControls) {
						if (!bSkipInsertContent) {
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
						}
						return aControls;
					});
			}
			return SyncPromise.resolve([]);
		},

		addDefaultContentToExtensionPointInfo: function (mRegsteredExtensionPoint, bSkipInsertContent, aControls) {
			if (!bSkipInsertContent) {
				mRegsteredExtensionPoint.defaultContent = mRegsteredExtensionPoint.defaultContent.concat(aControls);
			}
			return aControls;
		},

		/**
		 * Registration of extension points for the creation process in designtime.
		 * As well as creation of default content of extension point or preparation of flex changes
		 * based on the extension points to be able to be applied.
		 *
		 * @param {sap.ui.core.ExtensionPoint} oExtensionPoint - info object with extension point information
		 * @returns {Promise} resolves when default content is created or related changes are prepared for application
		 */
		applyExtensionPoint: function(oExtensionPoint) {
			var oPromise = applyExtensionPoint(oExtensionPoint, false);
			Applier.addPreConditionForInitialChangeApplying(oPromise);
			return oPromise;
		}
	};

	return Processor;
});