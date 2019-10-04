/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/base/Log",
	"sap/base/util/LoaderExtensions"
], function(
	merge,
	BaseConnector,
	Utils,
	Log,
	LoaderExtensions
) {
	"use strict";

	function _getPreloadedBundle(sReference, sBundleName) {
		var sBundleResourcePath = sReference.replace(/\./g, "/") + "/changes/" + sBundleName + ".json";
		var bBundleLoaded = !!sap.ui.loader._.getModuleState(sBundleResourcePath);
		var oConfiguration = sap.ui.getCore().getConfiguration();
		if (bBundleLoaded || oConfiguration.getDebug() || oConfiguration.isFlexBundleRequestForced()) {
			try {
				return LoaderExtensions.loadResource(sBundleResourcePath);
			} catch (e) {
				//JSON parse error of bundle file --> log error
				if (e.name.includes("SyntaxError")) {
					Log.error(e);
				}
				//Could not find the bundle file --> log warning
				Log.warning("flexibility did not find a " + sBundleName + "-bundle.json for the application: " + sReference);
			}
		}
	}

	/**
	 * Connector for requesting data from an LRep based back end.
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.StaticFileConnector
	 * @since 1.67
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.Connector
	 */
	var StaticFileConnector = merge({}, BaseConnector, /** sap.ui.fl.apply._internal.connectors.StaticFileConnector */ {
		/**
		 * Provides the flex data stored in the build changes-bundle JSON file.
		 *
		 * @param {object} mPropertyBag Properties needed by the connector
		 * @param {string} mPropertyBag.reference Reference of the application
		 * @returns {Promise<Object>} Resolving with an object containing a data contained in the changes-bundle
		 */
		loadFlexData: function (mPropertyBag) {
			var oFlexBundle = _getPreloadedBundle(mPropertyBag.reference, "flexibility-bundle");
			if (oFlexBundle) {
				return Promise.resolve(oFlexBundle);
			}

			var oChangesBundle = _getPreloadedBundle(mPropertyBag.reference, "changes-bundle");
			if (oChangesBundle) {
				return Promise.resolve({
					changes: oChangesBundle
				});
			}

			return Promise.resolve(Utils.getEmptyFlexDataResponse());
		}
	});

	return StaticFileConnector;
}, true);
