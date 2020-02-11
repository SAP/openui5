/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/Utils"
], function(
	FlexState,
	Versions,
	Utils
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
	 * Returns a flag if a draft exists for the current application and layer.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector for which the request is done
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 *
	 * @return {Promise<boolean>} Promise resolving with a flag if a draft is available;
	 * rejects if an error occurs or the layer does not support draft handling
	 */
	VersionsAPI.isDraftAvailable = function (mPropertyBag) {
		return VersionsAPI.getVersions(mPropertyBag)
			.then(function (aVersions) {
				var oDraft = aVersions.find(function (oVersion) {
					return oVersion.versionNumber === 0;
				});

				return !!oDraft;
			});
	};

	/**
	 * Returns a list of versions.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector for which the request is done
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 *
	 * @returns {Promise<sap.ui.fl.Version[]>} Promise resolving with a list of versions if available;
	 * rejects if an error occurs or the layer does not support draft handling
	 */
	VersionsAPI.getVersions = function (mPropertyBag) {
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

		return Versions.getVersions({
			reference: sReference,
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
	 *
	 * @ui5-restricted sap.ui.rta
	 *
	 * @returns {Promise<sap.ui.fl.Version[]>} Promise resolving with the updated list of versions for the application
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

		var oAppComponent = Utils.getAppComponentForControl(mPropertyBag.selector);
		var sReference = Utils.getComponentClassName(oAppComponent);

		if (!sReference) {
			return Promise.reject("The application ID could not be determined");
		}

		return Versions.activateDraft({
			reference: sReference,
			layer: mPropertyBag.layer
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
	 * @param {boolean} [mPropertyBag.updateState=false] - Flag if the state should be updated
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
		var sReference = Utils.getComponentClassName(oAppComponent);

		if (!sReference) {
			return Promise.reject("The application ID could not be determined");
		}

		return Versions.discardDraft({
			reference: sReference,
			layer: mPropertyBag.layer,
			updateState: mPropertyBag.updateState
		});
	};

	return VersionsAPI;
});
