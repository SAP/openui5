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

	function getFlAsyncHintRequest(oAsyncHints, sReference) {
		if (oAsyncHints && oAsyncHints.requests && Array.isArray(oAsyncHints.requests)) {
			return oAsyncHints.requests.find(function(oAsyncHint) {
				return oAsyncHint.name === "sap.ui.fl.changes" && (!sReference || oAsyncHint.reference === sReference);
			});
		}
	}

	function getFlexReference(mPropertyBag) {
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
				return oSapUi5Entry.componentName;
			}
		}

		return getAppIdFromManifest(oManifest);
	}

	function getAppIdFromManifest(oManifest) {
		if (oManifest) {
			var APP_ID_AT_DESIGN_TIME = "${pro" + "ject.art" + "ifactId}"; // avoid replaced by content of ${project.artifactId} placeholder at build steps
			var oSapApp = (oManifest.getEntry) ? oManifest.getEntry("sap.app") : oManifest["sap.app"];
			var sAppId = oSapApp && oSapApp.id;
			if (sAppId === APP_ID_AT_DESIGN_TIME) {
				if (oManifest.getComponentName) {
					return oManifest.getComponentName();
				}
				if (oManifest.name) {
					return oManifest.name;
				}
			}
			return sAppId;
		}

		throw new Error("No Manifest received, descriptor changes are not possible");
	}

	/**
	 * Provides utility functions for handling manifests; All function work with Manifest Objects or raw manifests
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.ManifestUtils
	 * @since 1.74
	 * @version ${version}
	 * @private
	 */
	var ManifestUtils = {
		/**
		 * Returns the descriptor Id, which is always the reference for descriptor changes
		 *
		 * @param {object|sap.ui.core.Manifest} oManifest - Manifest of the component
		 * @returns {string} Version of application if it is available in the manifest, otherwise an empty string
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta
		 */
		getAppIdFromManifest: getAppIdFromManifest,

		getFlexReference: getFlexReference,

		/**
		 * Determines the flex reference for a given control by
		 * identifying the application component and analyzing the manifest of this component.
		 *
		 * @param {sap.ui.core.Control} oControl - Control for the application determination
		 * @returns {string} Reference of the application
		 */
		getFlexReferenceForControl: function(oControl) {
			var oAppComponent = Utils.getAppComponentForControl(oControl);
			return oAppComponent && getFlexReference({
				manifest: oAppComponent.getManifestObject(),
				componentData: oAppComponent.getComponentData()
			});
		},

		/**
		 * Determines the flex reference for a given {@link sap.ui.fl.Selector} by
		 * identifying the application component and analyzing the manifest of this component.
		 * In case of a {@link sap.ui.fl.ComponentSelector} the appId is taken as is.
		 *
		 * @param {sap.ui.fl.Selector} oSelector - Selector object
		 * @returns {string} Reference of the application
		 */
		getFlexReferenceForSelector: function(oSelector) {
			if (oSelector.appId) {
				return oSelector.appId;
			}
			return ManifestUtils.getFlexReferenceForControl(oSelector.appComponent || oSelector);
		},

		getOvpEntry: function(oManifest) {
			return oManifest.getEntry ? oManifest.getEntry("sap.ovp") : oManifest["sap.ovp"];
		},

		getCacheKeyFromAsyncHints: function(sReference, oAsyncHints) {
			var oFlAsyncHint = getFlAsyncHintRequest(oAsyncHints, sReference);
			if (oFlAsyncHint) {
				return oFlAsyncHint.cachebusterToken || "<NO CHANGES>";
			}
		},

		getPreviewSectionFromAsyncHints: function(oAsyncHints) {
			var oFlAsyncHint = getFlAsyncHintRequest(oAsyncHints);
			if (oFlAsyncHint) {
				return oFlAsyncHint.preview;
			}
		},

		getChangeManifestFromAsyncHints: function(oAsyncHints) {
			// whenever there is a back end providing a fl async hint it is also not necessary to merge on client side
			var oFlAsyncHint = getFlAsyncHintRequest(oAsyncHints);
			if (oFlAsyncHint) {
				return false;
			}
			return true;
		},

		getBaseComponentNameFromManifest: function(oManifest) {
			var oSapUi5Entry = oManifest.getEntry ? oManifest.getEntry("sap.ui5") : oManifest["sap.ui5"];
			return oSapUi5Entry && oSapUi5Entry.componentName || getAppIdFromManifest(oManifest);
		},

		isFlexExtensionPointHandlingEnabled: function(oView) {
			var oAppComponent = Utils.getAppComponentForControl(oView);
			return !!(oAppComponent
				&& oAppComponent.getManifestEntry("sap.ui5")
				&& oAppComponent.getManifestEntry("sap.ui5").flexExtensionPointEnabled);
		}
	};

	return ManifestUtils;
});