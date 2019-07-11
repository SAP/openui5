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
	 * @namespace
	 * @name sap.ui.fl.apply.internal.connectors.StaticFileConnector
	 * @author SAP SE
	 * @experimental Since 1.67
	 * @since 1.67
	 * @version ${version}
	 * @private
	 */
	var StaticFileConnector = merge({}, BaseConnector, {
		/**
		 * Configuration used in the sap.ui.fl.Connector to always load the static files
		 */
		CONFIGURATION: {
			layerFilter: [],
			connectorName: "StaticFileConnector"
		},

		/**
		 * Provides the flex data stored in the build changes-bundle JSON file;
		 * The sAppVersion is not used due to the lack of app version differentiating module names.
		 *
		 * @param {string} sFlexReference reference of the application
		 * @returns {Promise<Object>} resolving with an object containing a data contained in the changes-bundle
		 */
		loadFlexData: function (sFlexReference/*, sAppVersion*/) {
			var sResourcePath = sFlexReference.replace(/\./g, "/") + "/changes/changes-bundle.json";
			var bChangesBundleLoaded = !!sap.ui.loader._.getModuleState(sResourcePath);
			var oConfiguration = sap.ui.getCore().getConfiguration();
			if (bChangesBundleLoaded || oConfiguration.getDebug() || oConfiguration.isFlexBundleRequestForced()) {
				try {
					var oResponse = merge({}, this._RESPONSES.FLEX_DATA, {changes: LoaderExtensions.loadResource(sResourcePath)});
					return Promise.resolve(oResponse);
				} catch (e) {
					Log.warning("flexibility did not find a changes-bundle.json for the application: " + sFlexReference);
				}
			}

			return Promise.resolve(this._RESPONSES.FLEX_DATA);
		}
	});

	return StaticFileConnector;
}, true);
