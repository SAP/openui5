/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/Utils"
], function(
	ChangePersistenceFactory,
	Storage,
	Utils
) {
	"use strict";

	var _mInstances = {};


	function _doesDraftExist(aVersions) {
		return aVersions.some(function(oVersion) {
			return oVersion.versionNumber === 0;
		});
	}

	function _updateInstanceAfterDraftActivation(aVersions, oVersion) {
		if (_doesDraftExist(aVersions)) {
			aVersions.shift();
		}
		aVersions.splice(0, 0, oVersion);
		return aVersions;
	}

	/**
	 *
	 *
	 * @namespace sap.ui.fl.write._internal.Versions
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var Versions = {};

	/**
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @returns {Promise<sap.ui.fl.Versions[]>} Promise resolving with a list of versions if available;
	 * rejects if an error occurs or the layer does not support draft handling
	 */
	Versions.initialize = function(mPropertyBag) {
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;

		if (_mInstances[sReference] && _mInstances[sReference][sLayer]) {
			return Promise.resolve(_mInstances[sReference][sLayer]);
		}

		return Storage.versions.load(mPropertyBag)
			.then(function (aVersions) {
				_mInstances[sReference] = _mInstances[sReference] || {};
				_mInstances[sReference][sLayer] = aVersions;
				return _mInstances[sReference][sLayer];
			});
	};

	/**
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @returns {Promise<sap.ui.fl.Versions[]>} Promise resolving with a list of versions if available;
	 * rejects if an error occurs or the layer does not support draft handling
	 */
	Versions.getVersions = function(mPropertyBag) {
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;

		if (!_mInstances[sReference] || !_mInstances[sReference][sLayer]) {
			throw Error("Versions for reference '" + sReference + "' and layer '" + sLayer + "' were not initialized.");
		}

		return _mInstances[sReference][sLayer];
	};

	Versions.clearInstances = function() {
		_mInstances = {};
	};

	/**
	 * Sets a draft in case it is not already present; This function must be called after a save operation to ensure a correct versions state in the session.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 */
	Versions.ensureDraftVersionExists = function(mPropertyBag) {
		var sReference = Utils.normalizeReference(mPropertyBag.reference);
		var aVersions = _mInstances[sReference][mPropertyBag.layer];
		if (!_doesDraftExist(aVersions)) {
			_mInstances[sReference][mPropertyBag.layer].splice(0, 0, {versionNumber: 0});
		}
	};

	/**
	 * Activates the draft for a given application and layer.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @param {string} mPropertyBag.title - Title of the to be activated version
	 * @returns {Promise<sap.ui.fl.Version>} Promise resolving with the updated list of versions for the application
	 * when the version was activated;
	 * rejects if an error occurs or the layer does not support draft handling or there is no draft to activate
	 */
	Versions.activateDraft = function(mPropertyBag) {
		var aVersions = Versions.getVersions(mPropertyBag);
		var bDraftExists = _doesDraftExist(aVersions);

		var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(mPropertyBag.reference);
		var bDirtyChangesExist = oChangePersistence.getDirtyChanges().length > 0;
		var oSaveDirtyChangesPromise;
		if (bDirtyChangesExist) {
			// TODO: the handling should move to the FlexState as soon as it is ready
			oSaveDirtyChangesPromise = oChangePersistence.saveDirtyChanges(false, undefined, true);
		} else {
			oSaveDirtyChangesPromise = Promise.resolve();
		}

		if (!bDraftExists && !bDirtyChangesExist) {
			return Promise.reject("No draft exists");
		}

		return oSaveDirtyChangesPromise
		.then(Storage.versions.activate.bind(undefined, mPropertyBag))
		.then(function (oVersion) {
			return _updateInstanceAfterDraftActivation(aVersions, oVersion);
		});
	};

	/**
	 * Discards the draft for a given application and layer; dirty changes are only.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @param {string} mPropertyBag.appVersion - Version of the app
	 * @param {boolean} [mPropertyBag.updateState=false] - Flag if the state should be updated
	 * @returns {Promise<boolean>} Promise resolving with a flag if a discarding took place;
	 * rejects if an error occurs or the layer does not support draft handling
	 */
	Versions.discardDraft = function(mPropertyBag) {
		var aVersions = Versions.getVersions(mPropertyBag);
		var bDirtyChangesExistsAndDiscarded = false;

		if (mPropertyBag.updateState && mPropertyBag.appComponent) {
			// remove all dirty changes
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(mPropertyBag.reference, mPropertyBag.appVersion);
			var aDirtyChanges = oChangePersistence.getDirtyChanges();
			bDirtyChangesExistsAndDiscarded = aDirtyChanges.length > 0;
			// TODO: the handling should move to the FlexState as soon as it is ready
			aDirtyChanges.forEach(oChangePersistence.deleteChange, oChangePersistence);
		}

		if (!_doesDraftExist(aVersions)) {
			return bDirtyChangesExistsAndDiscarded;
		}

		return Storage.versions.discardDraft(mPropertyBag)
		.then(function () {
			aVersions.shift();
			return true;
		});
	};

	return Versions;
});
