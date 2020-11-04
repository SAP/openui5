/*!
* ${copyright}
*/

// Provides object sap.ui.fl.apply._internal.extensionPoint.BaseProcessor
sap.ui.define([
	"sap/ui/fl/registry/ExtensionPointRegistry",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/base/util/merge"
],
function(
	ExtensionPointRegistry,
	JsControlTreeModifier,
	merge
) {
	'use strict';

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
		createDefaultContent: function (oExtensionPoint) {
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
		},

		applyExtensionPoint: function(oExtensionPoint) {
			// instantiate extension point registry
			var oExtensionPointRegistry = ExtensionPointRegistry.getInstance();
			var mExtensionPointInfo = merge({defaultContent: []}, oExtensionPoint);
			oExtensionPointRegistry.registerExtensionPoints(mExtensionPointInfo);

			// create default content
			return BaseProcessor.createDefaultContent(oExtensionPoint)
				.then(function (aControls) {
					mExtensionPointInfo.defaultContent = mExtensionPointInfo.defaultContent.concat(aControls);
				});
		}
	};

	return BaseProcessor;
});