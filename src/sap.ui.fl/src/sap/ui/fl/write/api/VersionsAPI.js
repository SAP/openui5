/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils"
], function(
	FlexState,
	Versions,
	Utils,
	ManifestUtils
) {
	"use strict";

	/**
	 * Provides an API for tools like {@link sap.ui.rta} to activate, discard and retrieve versions.
	 *
	 * @namespace sap.ui.fl.write.api.VersionsAPI
	 * @experimental Since 1.74
	 * @since 1.74
	 * @ui5-restricted sap.ui.rta, similar tools
	 *
	 */
	var VersionsAPI = /** @lends sap.ui.fl.write.api.VersionsAPI */ {};

	/**
	 * Initializes the versions for a given selector and layer.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector for which the request is done
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 *
	 * @returns {Promise<sap.ui.fl.Version[]>} List of versions if available;
	 * Rejects if not all parameters were passed or the application could not be determined
	 */
	VersionsAPI.initialize = function (mPropertyBag) {
		if (!mPropertyBag.selector) {
			return Promise.reject("No selector was provided");
		}
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}

		var oAppComponent = Utils.getAppComponentForControl(mPropertyBag.selector);
		var sReference = Utils.getComponentClassName(oAppComponent);

		if (!sReference) {
			return Promise.reject("The application ID could not be determined");
		}

		return Versions.initialize({
			reference: Utils.normalizeReference(sReference),
			layer: mPropertyBag.layer
		});
	};

	/**
	 * Returns a flag if a draft exists for the current application and layer.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector for which the request is done
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 *
	 * @return {boolean} Flag if a draft is available;
	 * Throws an error in case no initialization took place upfront
	 */
	VersionsAPI.isDraftAvailable = function (mPropertyBag) {
		var aVersions = VersionsAPI.getVersions(mPropertyBag);
		var oDraft = aVersions.find(function (oVersion) {
			return oVersion.versionNumber === 0;
		});

		return !!oDraft;
	};

	/**
	 * Returns a list of versions.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector for which the request is done
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 *
	 * @returns {sap.ui.fl.Version[]} List of versions if available;
	 * Throws an error in case no initialization took place upfront
	 */
	VersionsAPI.getVersions = function (mPropertyBag) {
		if (!mPropertyBag.selector) {
			throw Error("No selector was provided");
		}
		if (!mPropertyBag.layer) {
			throw Error("No layer was provided");
		}

		var oAppComponent = Utils.getAppComponentForControl(mPropertyBag.selector);
		var sReference = Utils.getComponentClassName(oAppComponent);

		if (!sReference) {
			throw Error("The application ID could not be determined");
		}

		return Versions.getVersions({
			reference: Utils.normalizeReference(sReference),
			layer: mPropertyBag.layer
		});
	};

	/**
	 * Removes the internal stored state of a given application and refreshes the state including a draft for the given layer;
	 * an actual reload of the application has to be triggered by the caller.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector for which the request is done
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 *
	 * @returns {Promise} Resolves as soon as the clearance and the requesting is triggered.
	 */
	VersionsAPI.loadDraftForApplication = function (mPropertyBag) {
		if (!mPropertyBag.selector) {
			return Promise.reject("No selector was provided");
		}
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}

		var oAppComponent = Utils.getAppComponentForControl(mPropertyBag.selector);
		var sReference = Utils.getComponentClassName(oAppComponent);
		if (!sReference) {
			return Promise.reject("The application ID could not be determined");
		}
		return FlexState.clearAndInitialize({
			componentId: oAppComponent.getId(),
			reference: sReference,
			draftLayer: mPropertyBag.layer
		});
	};

	/**
	 * Activates a draft version.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector for which the request is done
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @param {string} mPropertyBag.title - Title of the to be activated version
	 *
	 * @ui5-restricted sap.ui.rta
	 *
	 * @returns {Promise<sap.ui.fl.Version>} Promise resolving with the updated list of versions for the application
	 * when the version was activated;
	 * rejects if an error occurs or the layer does not support draft handling or there is no draft to activate
	 */
	VersionsAPI.activateDraft = function (mPropertyBag) {
		if (!mPropertyBag.selector) {
			return Promise.reject("No selector was provided");
		}
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.title) {
			return Promise.reject("No version title was provided");
		}

		var oAppComponent = Utils.getAppComponentForControl(mPropertyBag.selector);
		if (oAppComponent) {
			var oManifest = oAppComponent.getManifest();
			var sReference = ManifestUtils.getFlexReference({
				manifest: oManifest,
				componentData: oAppComponent.getComponentData()
			});
			var sAppVersion = Utils.getAppVersionFromManifest(oManifest);
		}

		if (!sReference) {
			return Promise.reject("The application ID could not be determined");
		}

		return Versions.activateDraft({
			nonNormalizedReference: sReference,
			reference: Utils.normalizeReference(sReference),
			appVersion: sAppVersion,
			layer: mPropertyBag.layer,
			title: mPropertyBag.title
		});
	};

	/**
	 * Discards the current draft within a given layer; This sends a call to the connector in case a draft exists and will
	 * update the FlexState accordingly in case the <code>updateState</code> flag is set; This API does not revert the changes
	 * and the consumer must take care of making a reload of the application itself.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector for which the request is done
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @returns {Promise<boolean>} Promise resolving with a flag if a discarding took place;
	 * rejects if an error occurs or the layer does not support draft handling
	 */
	VersionsAPI.discardDraft = function (mPropertyBag) {
		if (!mPropertyBag.selector) {
			return Promise.reject("No selector was provided");
		}
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}

		var oAppComponent = Utils.getAppComponentForControl(mPropertyBag.selector);
		if (oAppComponent) {
			var oManifest = oAppComponent.getManifest();
			var sReference = ManifestUtils.getFlexReference({
				manifest: oManifest,
				componentData: oAppComponent.getComponentData()
			});
			var sAppVersion = Utils.getAppVersionFromManifest(oManifest);
		}

		if (!sReference) {
			return Promise.reject("The application ID could not be determined");
		}

		return Versions.discardDraft({
			nonNormalizedReference: sReference,
			reference: Utils.normalizeReference(sReference),
			layer: mPropertyBag.layer,
			appVersion: sAppVersion
		}).then(function (bDiscarded) {
			if (bDiscarded) {
				// clears FlexState and triggers a new flex data request without blocking
				// it is actually not loading the draft, because we just discarded it
				VersionsAPI.loadDraftForApplication({
					selector: mPropertyBag.selector,
					layer: mPropertyBag.layer
				});
			}
			return bDiscarded;
		});
	};

	return VersionsAPI;
});
