/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/model/json/JSONModel"
], function (
	Settings,
	ManifestUtils,
	FlexUtils,
	Storage,
	Versions,
	JSONModel
) {
	"use strict";

	var _mInstances = {};

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
	 * Initializes the context-based adaptations for a given control and layer
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {sap.ui.model.json.JSONModel} - Model of adaptations enhanced with additional properties
	 */
	ContextBasedAdaptationsAPI.initialize = function (mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		var sReference = getFlexReferenceForControl(mPropertyBag.control);
		mPropertyBag.reference = sReference;
		var sLayer = mPropertyBag.layer;
		return Settings.getInstance()
			.then(function(oSettings) {
				var bContextBasedAdaptationsEnabled = oSettings.isContextBasedAdaptationEnabled();
				var oAdaptationsPromise = bContextBasedAdaptationsEnabled ? ContextBasedAdaptationsAPI.load(mPropertyBag) : Promise.resolve({adaptations: []});
				return oAdaptationsPromise;
			})
			.then(function(oAdaptations) {
				return ContextBasedAdaptationsAPI.createModel(oAdaptations.adaptations);
			})
			.then(function(oModel) {
				_mInstances[sReference] = _mInstances[sReference] || {};
				_mInstances[sReference][sLayer] = _mInstances[sReference][sLayer] || {};
				_mInstances[sReference][sLayer] = oModel;
				return _mInstances[sReference][sLayer];
			});
	};

	/**
	 * Initializes and creates an new adaptation Model
	 * @param {string[]} aAdaptations - List of adaptations from backend
	 * @returns {sap.ui.model.json.JSONModel} - Model of adaptations enhanced with additional properties
	 */
	ContextBasedAdaptationsAPI.createModel = function(aAdaptations) {
		if (!Array.isArray(aAdaptations)) {
			throw Error("Adaptations model can only be initialized with an array of adaptations");
		}
		var oModel = new JSONModel({
			adaptations: aAdaptations,
			count: aAdaptations.length,
			displayedAdaptation: aAdaptations.length > 0 ? aAdaptations[0] : {}
		});
		oModel.updateAdaptations = function(aAdaptations) {
			oModel.setProperty("/adaptations", aAdaptations);
			oModel.setProperty("/count", aAdaptations.length);
			if (aAdaptations.length > 0) {
				var oDisplayedAdaptation = oModel.getProperty("/adaptations/0/"); //TODO: might be changed in future
				oModel.setProperty("/displayedAdaptation", oDisplayedAdaptation);
			}
			oModel.updateBindings(true);
		};
		oModel.insertAdaptation = function(oNewAdaptation) {
			aAdaptations = oModel.getProperty("/adaptations");
			aAdaptations.splice(oNewAdaptation.priority, 0, oNewAdaptation);
			delete oNewAdaptation.priority;
			oModel.updateAdaptations(aAdaptations);
		};
		return oModel;
	};

	/**
	 * Returns adaptations model given reference id and layer.
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {sap.ui.model.json.JSONModel} - Model of adaptations enhanced with additional properties
	 */
	ContextBasedAdaptationsAPI.getAdaptationsModel = function(mPropertyBag) {
		if (!mPropertyBag.layer) {
			throw Error("No layer was provided");
		}
		if (!mPropertyBag.control) {
			throw Error("No control was provided");
		}
		mPropertyBag.reference = getFlexReferenceForControl(mPropertyBag.control);
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;
		if (!ContextBasedAdaptationsAPI.hasAdaptationsModel(mPropertyBag)) {
			throw Error("Adaptations model for reference '" + sReference + "' and layer '" + sLayer + "' were not initialized.");
		}
		return _mInstances[sReference][sLayer];
	};

	/**
	 * Checks if adaptations model for a given reference and layer exists.
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {boolean} checks if an adaptation model exists for this reference and layer
	 */
	ContextBasedAdaptationsAPI.hasAdaptationsModel = function(mPropertyBag) {
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;
		return _mInstances[sReference] && _mInstances[sReference][sLayer];
	};

	ContextBasedAdaptationsAPI.clearInstances = function() {
		_mInstances = {};
	};

	/**
	 * Create new context-based adaptation and saves it in the backend
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @param {object} mPropertyBag.contextBasedAdaptation - Parameters for new adaptation
	 * @param {string} mPropertyBag.contextBasedAdaptation.title - Title of the new adaptation
	 * @param {object} mPropertyBag.contextBasedAdaptation.contexts - Contexts of the new adaptation, for example roles for which the adaptation is created
	 * @param {object} mPropertyBag.contextBasedAdaptation.priority - Priority of the new adaptation
	 * @param {object} mPropertyBag.contextBasedAdaptation.priority - ID of the new adaptation
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
			var oModel = this.getAdaptationsModel(mPropertyBag);
			oModel.insertAdaptation(mPropertyBag.contextBasedAdaptation);
			return handleResponseForVersioning(oResponse, 201, mPropertyBag);
		}.bind(this));
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
	 * @returns {Promise<object>} Promise that resolves with the list of context-based adaptations
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
			return oAdaptations;
		});
	};
	return ContextBasedAdaptationsAPI;
});