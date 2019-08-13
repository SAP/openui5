/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/connectors/BaseConnector",
	"sap/base/Log",
	"sap/base/util/LoaderExtensions"
], function(
	merge,
	BaseConnector,
	Log,
	LoaderExtensions
) {
	"use strict";

	/**
	 * Connector for requesting data from an LRep based back end.
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.StaticFileConnector
	 * @experimental Since 1.67
	 * @since 1.67
	 * @ui5-restricted sap.ui.fl.apply._internal.Connector
	 */
	var StaticFileConnector = merge({}, BaseConnector, /** sap.ui.fl.apply._internal.connectors.StaticFileConnector */ {
		/**
		 * Configuration used in the sap.ui.fl.Connector to always load the static files
		 */
		CONFIGURATION: {
			layerFilter: [],
			connectorName: "StaticFileConnector"
		},

		/**
		 * Provides the flex data stored in the build changes-bundle JSON file.
		 *
		 * @param {string} mPropertyBag.Reference reference of the application
		 * @returns {Promise<Object>} resolving with an object containing a data contained in the changes-bundle
		 */
		loadFlexData: function (mPropertyBag) {
			var sReference = mPropertyBag.reference;
			var sResourcePath = sReference.replace(/\./g, "/") + "/changes/changes-bundle.json";
			var bChangesBundleLoaded = !!sap.ui.loader._.getModuleState(sResourcePath);
			var oConfiguration = sap.ui.getCore().getConfiguration();
			if (bChangesBundleLoaded || oConfiguration.getDebug() || oConfiguration.isFlexBundleRequestForced()) {
				try {
					var oResponse = {
						changes: LoaderExtensions.loadResource(sResourcePath)
					};
					return Promise.resolve(oResponse);
				} catch (e) {
					Log.warning("flexibility did not find a changes-bundle.json for the application: " + sReference);
				}
			}

			return Promise.resolve({});
		}
	});

	return StaticFileConnector;
}, true);
