/*!
* ${copyright}
*/

// Provides object sap.ui.fl.apply._internal.extensionPoint.BaseProcessor
sap.ui.define([
	"sap/ui/fl/registry/ExtensionPointRegistry",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/base/SyncPromise",
	"sap/base/util/merge",
	"sap/base/Log"

],
function(
	ExtensionPointRegistry,
	JsControlTreeModifier,
	SyncPromise,
	merge,
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
			}, SyncPromise.resolve());
		}
		return SyncPromise.resolve(aResolvedControls);
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

	function applyExtensionPoint(oExtensionPoint, bSkipInsertContent) {
		// instantiate extension point registry
		var oExtensionPointRegistry = ExtensionPointRegistry.getInstance();
		var mExtensionPointInfo = merge({defaultContent: []}, oExtensionPoint);
		mExtensionPointInfo.viewId = getViewId(oExtensionPoint);
		oExtensionPointRegistry.registerExtensionPoints(mExtensionPointInfo);

		// create default content
		return createDefaultContent(oExtensionPoint, mExtensionPointInfo, bSkipInsertContent);
	}

	/**
	 * Implements the <code>Extension Points</code> provider by SAPUI5 flexibility that can be hooked in the <code>sap.ui.core.ExtensionPoint</code> life cycle.
	 *
	 * @name sap.ui.fl.apply._internal.extensionPoint.BaseProcessor
	 * @class
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 */
	var BaseProcessor = {
		/**
		 * Registration of extension points for the creation process in designtime.
		 * As well as creation of default content of extension points.
		 *
		 * @param {sap.ui.core.ExtensionPoint} oExtensionPoint - info object with extension point information
		 * @returns {Promise} resolves when default content is created or related changes are prepared for application
		 */
		applyExtensionPoint: function(oExtensionPoint) {
			return applyExtensionPoint(oExtensionPoint, false);
		}
	};

	return BaseProcessor;
});