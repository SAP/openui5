/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/model/json/JSONModel"
], function (
	ManifestUtils,
	FlexUtils,
	Storage,
	Versions,
	JSONModel
) {
	"use strict";

	/**
	 * Provides an API for creating and managing context-based adaptation.
	 *
	 * @namespace sap.ui.fl.write.api.ContextBasedAdaptationsAPI
	 * @experimental Since 1.106
	 * @since 1.106
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	var ContextBasedAdaptationsAPI = /** @lends sap.ui.fl.write.api.ContextBasedAdaptationsAPI */ {};

	function getFlexReferenceForControl(oControl) {
		var sReference = ManifestUtils.getFlexReferenceForControl(oControl);
		if (!sReference) {
			throw Error("The application ID could not be determined");
		}
		return FlexUtils.normalizeReference(sReference);
	}

	/**
	 * Processing the response to activate the draft if the expected status is contained in the response object
	 * @param {object} oResponse - Object with response data
	 * @param {number} oResponse.status - HTTP response code
	 * @param {number} nExpectedStatus - Expected HTTP response code
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Reference of the application
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {object} Object with response data
	 */
	function handleResponseForVersioning(oResponse, nExpectedStatus, mPropertyBag) {
		if (oResponse.status === nExpectedStatus) {
			Versions.onAllChangesSaved({
				reference: mPropertyBag.reference,
				layer: mPropertyBag.layer,
				contextBasedAdaptation: true
			});
		}
		return oResponse;
	}

	/**
	 * Create new context-based adaptation and saves it in the backend
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @param {object} mPropertyBag.contextBasedAdaptation - Parameters
	 * @param {string} mPropertyBag.contextBasedAdaptation.title - Title of the new adaptation
	 * @param {object} mPropertyBag.contextBasedAdaptation.contexts - Contexts of the new adaptation, for example roles for which the adaptation is created
	 * @returns {Promise} Promise that resolves with the context-based adaptation
	 */
	ContextBasedAdaptationsAPI.create = function (mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		if (!mPropertyBag.contextBasedAdaptation) {
			return Promise.reject("No contextBasedAdaptation was provided");
		}
		mPropertyBag.contextBasedAdaptation.id = FlexUtils.createDefaultFileName();
		mPropertyBag.reference = getFlexReferenceForControl(mPropertyBag.control);
		return Storage.contextBasedAdaptation.create({
			layer: mPropertyBag.layer,
			flexObject: mPropertyBag.contextBasedAdaptation,
			reference: mPropertyBag.reference,
			parentVersion: Versions.getVersionsModel({ layer: mPropertyBag.layer, reference: mPropertyBag.reference }).getProperty("/displayedVersion")
		}).then(function (oResponse) {
			return handleResponseForVersioning(oResponse, 201, mPropertyBag);
		});
	};

	/**
	 * Reorder context-based adaptations based on their priorities
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @param {object} mPropertyBag.parameters - Parameters
	 * @param {string[]} mPropertyBag.parameters.priorities - Priority list
	 * @returns {Promise} Promise that resolves with the context-based adaptation
	 */
	ContextBasedAdaptationsAPI.reorder = function (mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		if (!mPropertyBag.parameters || !mPropertyBag.parameters.priorities) {
			return Promise.reject("No valid priority list was provided");
		}
		mPropertyBag.reference = getFlexReferenceForControl(mPropertyBag.control);
		return Storage.contextBasedAdaptation.reorder({
			layer: mPropertyBag.layer,
			flexObjects: mPropertyBag.parameters,
			reference: mPropertyBag.reference,
			parentVersion: Versions.getVersionsModel({ layer: mPropertyBag.layer, reference: mPropertyBag.reference }).getProperty("/displayedVersion")
		}).then(function (oResponse) {
			return handleResponseForVersioning(oResponse, 204, mPropertyBag);
		});
	};

	/**
	 * Load list of context-based adapations with priority
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {Promise} Promise that resolves with the list of context-based adaptations
	 */
	ContextBasedAdaptationsAPI.load = function (mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		mPropertyBag.reference = getFlexReferenceForControl(mPropertyBag.control);
		return Storage.contextBasedAdaptation.load({
			layer: mPropertyBag.layer,
			flexObject: mPropertyBag.parameters,
			reference: mPropertyBag.reference,
			version: Versions.getVersionsModel({ layer: mPropertyBag.layer, reference: mPropertyBag.reference }).getProperty("/displayedVersion")
		}).then(function (oAdaptations) {
			if (!oAdaptations) {
				oAdaptations = { adaptations: [] };
			}
			return new JSONModel(oAdaptations);
		});
	};
	return ContextBasedAdaptationsAPI;
});