/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/Utils"], function (Utils) {
	"use strict";

	/**
	 * Helper object to access a change from the backend.
	 * Access helper object for each change (and variant) which was fetched from the backend
	 *
	 * @namespace
	 * @alias sap.ui.fl.Cache
	 * @experimental Since 1.25.0
	 * @author SAP SE
	 * @version ${version}
	 */
	var Cache = function () {
	};

	Cache._isOn = true;

	Cache._entries = {};

	Cache._switches = {};

	/**
	 * Get the list of the switched-on business functions from the flex response
	 *
	 * @returns {object} map which has switched-on business functions as its keys
	 *
	 * @public
	 */
	Cache.getSwitches = function () {
		return Cache._switches;
	};

	/**
	 * Indicates if the cache is active or not (for testing)
	 *
	 * @returns {boolean} Is Cache currently active or not
	 *
	 * @public
	 */
	Cache.isActive = function () {
		return Cache._isOn;
	};

	/**
	 * Sets the active state
	 *
	 * @param {boolean} bActive - cache active or not
	 *
	 * @public
	 */
	Cache.setActive = function (bActive) {
		Cache._isOn = bActive;
	};


	/**
	 * Returns the entries stored in the cache.
	 *
	 * @return {object} _entries - a map of flexibility references and server responses for the given entry
	 *
	 * @protected
	 */
	Cache.getEntries = function () {
		return Cache._entries;
	};

	/**
	 * This method retrieves the changes for a given
	 * component. It answers all subsequent calls with the same promise, which
	 * will resolve with the same result. In the success case, it will keep the
	 * promise to resolve all calls in future event loop execution paths with
	 * the same result. In case of an error, it will delete the initial promise
	 * to give calls from future execution paths the chance to re-request the
	 * changes from the backend.
	 *
	 * If the cache is not active, the method just delegates the call to the
	 * loadChanges method of the given LrepConnector.
	 *
	 * @param {sap.ui.fl.LrepConnector} oLrepConnector - LrepConnector instance to retrieve the changes with
	 * @param {string} sComponentName - the component name to retrieve the changes for
	 * @param {map} mPropertyBag - (optional) contains additional data that are needed for reading of changes
	 * - appDescriptor that belongs to actual component
	 * - siteId that belongs to actual component
	 * @returns {Promise} resolves with the change file for the given component, either from cache or backend
	 *
	 * @public
	 */
	Cache.getChangesFillingCache = function (oLrepConnector, sComponentName, mPropertyBag) {
		if (!this.isActive()) {
			return oLrepConnector.loadChanges(sComponentName, mPropertyBag);
		}

		// in case of no changes present according to async hints
		if (mPropertyBag && mPropertyBag.cacheKey === "<NO CHANGES>") {
			return Promise.resolve({
				changes: {
					changes : [],
					contexts : []
				},
				componentClassName: sComponentName
			});
		}

		var oCacheEntry = Cache._entries[sComponentName];

		if (!oCacheEntry) {
			oCacheEntry = Cache._entries[sComponentName] = {};
		}

		if (oCacheEntry.promise) {
			return oCacheEntry.promise;
		}

		var currentLoadChanges = oLrepConnector.loadChanges(sComponentName, mPropertyBag).then(function (mChanges) {
			if (oCacheEntry.file) {
				Utils.log.error('sap.ui.fl.Cache: Cached changes for component ' + sComponentName + ' overwritten.');
			}
			if (mChanges && mChanges.changes && mChanges.changes.settings && mChanges.changes.settings.switchedOnBusinessFunctions) {
			    mChanges.changes.settings.switchedOnBusinessFunctions.forEach(function(sValue) {
				Cache._switches[sValue] = true;
			    });
			}
			oCacheEntry.file = mChanges;
			return oCacheEntry.file;
		}, function (err) {
			delete oCacheEntry.promise;
			throw err;
		});

		oCacheEntry.promise = currentLoadChanges;

		return currentLoadChanges;
	};

	/**
	 * @private
	 *
	 * @param {string} sComponentName - name of the SAPUI5 component
	 * @returns {array} Array of changes
	 */
	Cache._getChangeArray = function (sComponentName) {
		var oEntry = Cache._entries[sComponentName];
		if (oEntry) {
			if (oEntry.file) {
				return oEntry.file.changes.changes;
			}
		}
	};

	/**
	 * Add a change for the given component to the cached changes.
	 *
	 * @param {string} sComponentName Name of the component
	 * @param {object} oChange The change in JSON format
	 * @public
	 */
	Cache.addChange = function (sComponentName, oChange) {
		var aChanges = Cache._getChangeArray(sComponentName);

		if (!aChanges) {
			return;
		}

		aChanges.push(oChange);
	};

	/**
	 * Updates a change for the given component in the cached changes.
	 *
	 * @param {string} sComponentName Name of the component
	 * @param {object} oChange The change in JSON format
	 * @public
	 */
	Cache.updateChange = function (sComponentName, oChange) {
		var aChanges = Cache._getChangeArray(sComponentName);

		if (!aChanges) {
			return;
		}

		for (var i = 0; i < aChanges.length; i++) {
			if (aChanges[i].fileName === oChange.fileName) {
				aChanges.splice(i, 1, oChange);
				break;
			}
		}
	};

	/**
	 * Delete a change for the given component from the cached changes.
	 *
	 * @param {string} sComponentName Name of the SAPUI5 component
	 * @param {object} oChangeDefinition The change in JSON format
	 * @public
	 */
	Cache.deleteChange = function (sComponentName, oChangeDefinition) {
		var aChanges = Cache._getChangeArray(sComponentName);

		if (!aChanges) {
			return;
		}

		for (var i = 0; i < aChanges.length; i++) {
			if (aChanges[i].fileName === oChangeDefinition.fileName) {
				aChanges.splice(i, 1);
				break;
			}
		}
	};

	return Cache;
}, /* bExport= */true);
