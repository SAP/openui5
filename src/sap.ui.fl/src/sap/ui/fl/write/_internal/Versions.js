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

	function isBackendDraftAvailable(mPropertyBag) {
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;
		return _mInstances[sReference] &&
			_mInstances[sReference][sLayer] &&
			_mInstances[sReference][sLayer].backendDraft;
	}

	function setBackendDraftAvailable(mPropertyBag, bBackendDraftAvailable) {
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;
		if (_mInstances[sReference]) {
			_mInstances[sReference][sLayer].backendDraft = bBackendDraftAvailable;
		}
	}

	// TODO: the handling should move to the FlexState as soon as it is ready
	function _removeDirtyChanges(mPropertyBag, oDirtyChangeInfo) {
		// remove all dirty changes
		var aDirtyChanges = [];
		var aChangePersistences = oDirtyChangeInfo.changePersistences;
		aChangePersistences.forEach(function (oChangePersistence) {
			aDirtyChanges = oChangePersistence.getDirtyChanges().concat();
			aDirtyChanges.forEach(function(oChange) {
				oChangePersistence.deleteChange(oChange, true);
			});
		});
		return aDirtyChanges.length > 0;
	}

	function _getDirtyChangesInfo(mPropertyBag) {
		var oDirtyChangesInfo = {
			dirtyChangesExist: false,
			changePersistences: []
		};

		if (mPropertyBag.reference) {
			var oChangePersistenceForAppDescriptorChanges = ChangePersistenceFactory.getChangePersistenceForComponent(mPropertyBag.reference, mPropertyBag.appVersion);
			if (oChangePersistenceForAppDescriptorChanges.getDirtyChanges().length > 0) {
				oDirtyChangesInfo.dirtyChangesExist = true;
				oDirtyChangesInfo.changePersistences.push(oChangePersistenceForAppDescriptorChanges);
			}
		}
		if (mPropertyBag.nonNormalizedReference) {
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(mPropertyBag.nonNormalizedReference, mPropertyBag.appVersion);
			if (oChangePersistence.getDirtyChanges().length > 0) {
				oDirtyChangesInfo.dirtyChangesExist = true;
				oDirtyChangesInfo.changePersistences.push(oChangePersistence);
			}
		}
		return oDirtyChangesInfo;
	}

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

		return Storage.versions.load(mPropertyBag)
			.then(function (aVersions) {
				_mInstances[sReference] = _mInstances[sReference] || {};
				_mInstances[sReference][sLayer] = aVersions;
				_mInstances[sReference][sLayer].backendDraft = _doesDraftExist(aVersions);
				return _mInstances[sReference][sLayer];
			});
	};

	/**
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @returns {array} Array with a list of versions if available;
	 * throws an error if versions were not initialized for the given reference and layer
	 */
	Versions.getVersions = function(mPropertyBag) {
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;

		if (!_mInstances[sReference] || !_mInstances[sReference][sLayer]) {
			throw Error("Versions for reference '" + sReference + "' and layer '" + sLayer + "' were not initialized.");
		}

		var oDirtyChangesInfo = _getDirtyChangesInfo(mPropertyBag);
		if (oDirtyChangesInfo.dirtyChangesExist) {
			this.ensureDraftVersionExists(mPropertyBag);
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
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested (this reference must not contain the ".Component" suffix)
	 * @param {string} mPropertyBag.nonNormalizedReference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.appVersion - Version of the app
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @param {string} mPropertyBag.title - Title of the to be activated version
	 * @param {string} mPropertyBag.appComponent - Application Component
	 * @returns {Promise<sap.ui.fl.Version>} Promise resolving with the updated list of versions for the application
	 * when the version was activated;
	 * rejects if an error occurs or the layer does not support draft handling or there is no draft to activate
	 */
	Versions.activateDraft = function(mPropertyBag) {
		var aVersions = Versions.getVersions(mPropertyBag);
		var bDraftExists = _doesDraftExist(aVersions);
		if (!bDraftExists) {
			return Promise.reject("No draft exists");
		}

		var oDirtyChangeInfo = _getDirtyChangesInfo(mPropertyBag);
		var aSaveDirtyChangesPromise = [];
		if (oDirtyChangeInfo.dirtyChangesExist) {
			// TODO: the handling should move to the FlexState as soon as it is ready
			var aChangePersistences = oDirtyChangeInfo.changePersistences;
			aSaveDirtyChangesPromise = aChangePersistences.map(function (oChangePersistence) {
				return oChangePersistence.saveDirtyChanges(mPropertyBag.appComponent, false, undefined, true);
			});
		}
		return Promise.all(aSaveDirtyChangesPromise)
		.then(Storage.versions.activate.bind(undefined, mPropertyBag))
		.then(function (oVersion) {
			setBackendDraftAvailable(mPropertyBag, false);
			return _updateInstanceAfterDraftActivation(aVersions, oVersion);
		});
	};

	/**
	 * Discards the draft for a given application and layer; dirty changes are only.
	 *
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested (this reference must not contain the ".Component" suffix)
	 * @param {string} mPropertyBag.nonNormalizedReference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @param {string} mPropertyBag.appVersion - Version of the app
	 * @returns {Promise<object>} Promise resolving to an object to indicate if a discarding took place on backend side and/or dirtychanges were discarded;
	 * rejects if an error occurs or the layer does not support draft handling
	 */
	Versions.discardDraft = function(mPropertyBag) {
		var aVersions = Versions.getVersions(mPropertyBag);
		var oDirtyChangesInfo = _getDirtyChangesInfo(mPropertyBag);
		// check if a draft existed when starting RTA (draft was loaded from the backend)
		if (isBackendDraftAvailable(mPropertyBag)) {
			return Storage.versions.discardDraft(mPropertyBag)
			.then(function () {
				aVersions.shift();
				setBackendDraftAvailable(mPropertyBag, false);
				// in case of a existing draft known by the backend;
				// we remove dirty changes only after successful DELETE request
				var bDirtyChangesRemoved = _removeDirtyChanges(mPropertyBag, oDirtyChangesInfo);
				return {
					backendChangesDiscarded: true,
					dirtyChangesDiscarded: bDirtyChangesRemoved
				};
			});
		}
		aVersions.shift();
		var bDirtyChangesRemoved = _removeDirtyChanges(mPropertyBag, oDirtyChangesInfo);
		return Promise.resolve({
			backendChangesDiscarded: false,
			dirtyChangesDiscarded: bDirtyChangesRemoved
		});
	};

	return Versions;
});
