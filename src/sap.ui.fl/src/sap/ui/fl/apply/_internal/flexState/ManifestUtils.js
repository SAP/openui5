/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils"
],
function(
	Utils
) {
	"use strict";

	function appendComponentToReference(sComponentName) {
		if (sComponentName.length > 0 && sComponentName.indexOf(".Component") < 0) {
			sComponentName += ".Component";
		}
		return sComponentName;
	}

	/**
	 * Provides utility functions for handling manifests; All function work with Manifest Objects or raw manifests
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.ManifestUtils
	 * @experimental
	 * @since 1.74
	 * @version ${version}
	 * @private
	 */
	var ManifestUtils = {
		getFlexReference: function(mPropertyBag) {
			var oManifest = mPropertyBag.manifest;
			var oComponentData = mPropertyBag.componentData;

			// support of old app variants
			if (oComponentData.startupParameters) {
				if (Array.isArray(oComponentData.startupParameters["sap-app-id"])) {
					return oComponentData.startupParameters["sap-app-id"][0];
				}
			}

			var oSapUi5Entry = oManifest.getEntry ? oManifest.getEntry("sap.ui5") : oManifest["sap.ui5"];
			if (oSapUi5Entry) {
				if (oSapUi5Entry.appVariantId) {
					return oSapUi5Entry.appVariantId;
				}

				if (oSapUi5Entry.componentName) {
					return appendComponentToReference(oSapUi5Entry.componentName);
				}
			}

			return appendComponentToReference(Utils.getAppIdFromManifest(oManifest));
		},

		getCacheKeyFromAsyncHints: function(oAsyncHints, sReference) {
			if (oAsyncHints && oAsyncHints.requests && Array.isArray(oAsyncHints.requests)) {
				var oFlAsyncHint;
				oAsyncHints.requests.some(function(oAsyncHint) {
					if (oAsyncHint.name === "sap.ui.fl.changes" && oAsyncHint.reference === sReference) {
						oFlAsyncHint = oAsyncHint;
					}
				});
				if (oFlAsyncHint) {
					return oFlAsyncHint.cachebusterToken || "<NO CHANGES>";
				}
			}
		},

		getBaseComponentNameFromManifest: function(oManifest) {
			var oSapUi5Entry = oManifest.getEntry ? oManifest.getEntry("sap.ui5") : oManifest["sap.ui5"];
			return oSapUi5Entry && oSapUi5Entry.componentName || Utils.getAppIdFromManifest(oManifest);
		}
	};

	return ManifestUtils;
}, true);