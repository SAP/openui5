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
		if (sComponentName && sComponentName.indexOf(".Component") < 0) {
			sComponentName += ".Component";
		}
		return sComponentName;
	}

	function getFlAsyncHint(oAsyncHints) {
		var oFlAsyncHint;

		oAsyncHints.requests.some(function(oAsyncHint) {
			if (oAsyncHint.name === "sap.ui.fl.changes") {
				oFlAsyncHint = oAsyncHint;
			}
		});

		return oFlAsyncHint;
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
		/** Determines the flex reference for a given control by
		 * identifying the application component and analyzing the manifest of this component.
		 *
		 * @param {sap.ui.core.Control} oControl - Control for the application determination
		 * @return {string} Reference of the application
		 */
		getFlexReferenceForControl: function (oControl) {
			var oAppComponent = Utils.getAppComponentForControl(oControl);
			return ManifestUtils.getFlexReference({
				manifest: oAppComponent.getManifest(),
				componentData: oAppComponent.getComponentData()
			});
		},

		getFlexReference: function(mPropertyBag) {
			var oManifest = mPropertyBag.manifest;
			var oComponentData = mPropertyBag.componentData || {};

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

		getCacheKeyFromAsyncHints: function(sReference, oAsyncHints) {
			if (oAsyncHints && oAsyncHints.requests && Array.isArray(oAsyncHints.requests)) {
				var oFlAsyncHint = getFlAsyncHint(oAsyncHints);
				if (oFlAsyncHint && oFlAsyncHint.reference === sReference) {
					return oFlAsyncHint.cachebusterToken || "<NO CHANGES>";
				}
			}
		},

		getChangeManifestFromAsyncHints: function(oAsyncHints) {
			// whenever there is a back end providing a fl async hint it is also not necessary to merge on client side
			if (oAsyncHints && oAsyncHints.requests && Array.isArray(oAsyncHints.requests)) {
				var oFlAsyncHint = getFlAsyncHint(oAsyncHints);
				if (oFlAsyncHint) {
					return false;
				}
			}

			return true;
		},

		getBaseComponentNameFromManifest: function(oManifest) {
			var oSapUi5Entry = oManifest.getEntry ? oManifest.getEntry("sap.ui5") : oManifest["sap.ui5"];
			return oSapUi5Entry && oSapUi5Entry.componentName || Utils.getAppIdFromManifest(oManifest);
		},

		isFlexExtensionPointHandlingEnabled: function (oView) {
			var oAppComponent = Utils.getAppComponentForControl(oView);
			return !!(oAppComponent
				&& oAppComponent.getManifestEntry("sap.ui5")
				&& oAppComponent.getManifestEntry("sap.ui5").flexExtensionPointEnabled);
		}
	};

	return ManifestUtils;
});