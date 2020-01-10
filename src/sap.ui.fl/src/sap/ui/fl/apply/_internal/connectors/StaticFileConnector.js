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

	function _getBundle(sReference, sBundleName) {
		var sBundleResourcePath = sReference.replace(/\./g, "/") + "/changes/" + sBundleName + ".json";
		var bBundleLoaded = !!sap.ui.loader._.getModuleState(sBundleResourcePath);
		var oConfiguration = sap.ui.getCore().getConfiguration();
		// the bundle is usually part of the component-preload
		// if the preload is suppressed, we send a potentially failing request
		if (bBundleLoaded || oConfiguration.getDebug() || oConfiguration.getComponentPreload() === "off") {
			try {
				return LoaderExtensions.loadResource(sBundleResourcePath);
			} catch (e) {
				//JSON parse error of bundle file --> log error
				if (e.name.includes("SyntaxError")) {
					Log.error(e);
				}
				Log.warning("flexibility did not find a " + sBundleName + ".json for the application: " + sReference);
			}
		}
	}

	/**
	 * Connector for requesting flexibility data gereneated as part of the applications build step.
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.StaticFileConnector
	 * @since 1.67
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.Storage
	 */
	var StaticFileConnector = merge({}, BaseConnector, /** sap.ui.fl.apply._internal.connectors.StaticFileConnector */ {
		/**
		 * Provides the flex data stored in the built flexibility- or changes-bundle JSON file.
		 *
		 * @param {object} mPropertyBag Properties needed by the connector
		 * @param {string} mPropertyBag.reference Reference of the application
		 * @param {string} [mComponent.componentName] Component name of the current application which may differ in case of an app variant
		 * @returns {Promise<Object>} Resolving with an object containing a data contained in the bundle
		 */
		loadFlexData: function (mPropertyBag) {
			var sComponentName = mPropertyBag.componentName;

			if (!sComponentName) {
				// fallback in case the loadFlexData was called without passing the component name
				sComponentName = mPropertyBag.reference.replace(/.Component/g, "");
			}

			var oFlexBundle = _getBundle(sComponentName, "flexibility-bundle");
			if (oFlexBundle) {
				// TODO: remove as soon as the client also does the separation of compVariants and changes
				oFlexBundle.changes = oFlexBundle.changes.concat(oFlexBundle.compVariants);
				delete oFlexBundle.compVariants;
				return Promise.resolve(oFlexBundle);
			}

			var oChangesBundle = _getBundle(sComponentName, "changes-bundle");
			if (oChangesBundle) {
				return Promise.resolve({
					changes : oChangesBundle
				});
			}

			return Promise.resolve();
		}
	});

	return StaticFileConnector;
}, true);
