/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/Utils"], function (Utils) {
	"use strict";

	/**
	 * Helper object to access a change from the back end.
	 * Access helper object for each change (and variant) fetched from the back end
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
	 * Clears whole entries stored in the cache.
	 *
	 * @protected
	 * @sap-restricted sap.ui.fl
	 */
	Cache.clearEntries = function () {
		Cache._entries = {};
	};

	/**
	 * Returns the entry stored in the cache and creates an entry if needed.
	 *
	 * @param {string} sComponentName - Name of the application component
	 * @param {string} sAppVersion - Current running version of application
	 * @return {object} Cache entry of specific application component and application version
	 *
	 * @protected
	 */
	Cache.getEntry = function (sComponentName, sAppVersion) {
		if (!Cache._entries[sComponentName]) {
			Cache._entries[sComponentName] = {};
		}
		if (!Cache._entries[sComponentName][sAppVersion]) {
			Cache._entries[sComponentName][sAppVersion] = {
				file: {
					changes: {
						changes: [],
						contexts: []
					}
				}
			};
		}
		return Cache._entries[sComponentName][sAppVersion];
	};

	/**
	 * Clears a single entry stored in the cache for a specific application component and application version.
	 *
	 * @param {string} sComponentName - Name of the application component
	 * @param {string} sAppVersion - Current running version of application
	 *
	 * @protected
	 * @sap-restricted sap.ui.fl
	 */
	Cache.clearEntry = function (sComponentName, sAppVersion) {
		Cache.getEntry(sComponentName, sAppVersion);
		Cache._entries[sComponentName][sAppVersion] = {};
	};

	/**
	 * Deletes a single entry stored in the cache for a specific application component and application version.
	 *
	 * @param {string} sComponentName - Name of the application component
	 * @param {string} sAppVersion - Current running version of application
	 *
	 * @private
	 * @sap-restricted sap.ui.fl
	 */
	Cache._deleteEntry = function (sComponentName, sAppVersion) {
		if (Cache._entries[sComponentName] && Cache._entries[sComponentName][sAppVersion]) {
			delete Cache._entries[sComponentName][sAppVersion];
		}
		if (jQuery.isEmptyObject(Cache._entries[sComponentName])) {
			delete Cache._entries[sComponentName];
		}
	};

	/**
	 * This method retrieves the changes for a given
	 * component. It answers all subsequent calls with the same promise, which
	 * will resolve with the same result. In the success case, it will keep the
	 * promise to resolve all calls in future event loop execution paths with
	 * the same result. In case of an error, it will delete the initial promise
	 * to give calls from future execution paths the chance to re-request the
	 * changes from the back end.
	 *
	 * If the cache is not active, the method just delegates the call to the
	 * loadChanges method of the given LrepConnector.
	 *
	 * @param {sap.ui.fl.LrepConnector} oLrepConnector - LrepConnector instance to retrieve the changes with
	 * @param {object} oComponent - Contains component data needed for reading changes
	 * @param {string} oComponent.name - Name of the component
	 * @param {string} oComponent.appVersion - Current running version of application
	 * @param {map} [mPropertyBag] - Contains additional data needed for reading changes
	 * @param {object} [mPropertyBag.appDescriptor] - Manifest that belongs to actual component
	 * @param {string} [mPropertyBag.siteId] - <code>sideId<code> that belongs to actual component
	 * @returns {Promise} resolves with the change file for the given component, either from cache or back end
	 *
	 * @public
	 */
	Cache.getChangesFillingCache = function (oLrepConnector, oComponent, mPropertyBag) {
		if (!this.isActive()) {
			return oLrepConnector.loadChanges(oComponent, mPropertyBag);
		}
		var sComponentName = oComponent.name;
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

		var sAppVersion = oComponent.appVersion || Utils.DEFAULT_APP_VERSION;
		var oCacheEntry = Cache.getEntry(sComponentName, sAppVersion);

		if (oCacheEntry.promise) {
			return oCacheEntry.promise;
		}

		var currentLoadChanges = oLrepConnector.loadChanges(oComponent, mPropertyBag).then(function (mChanges) {
			if (mChanges && mChanges.changes && mChanges.changes.settings && mChanges.changes.settings.switchedOnBusinessFunctions) {
				mChanges.changes.settings.switchedOnBusinessFunctions.forEach(function(sValue) {
				Cache._switches[sValue] = true;
				});
			}
			oCacheEntry.file = mChanges;
			return oCacheEntry.file;
		}, function (err) {
			Cache._deleteEntry(sComponentName, sAppVersion);
			throw err;
		});

		oCacheEntry.promise = currentLoadChanges;

		return currentLoadChanges;
	};

	/**
	 * @private
	 * @param {object} oComponent - Contains component data needed for getting change array
	 * @param {string} oComponent.name - Name of the component
	 * @param {string} oComponent.appVersion - Current running version of application
	 * @returns {array} Array of changes
	 */
	Cache._getChangeArray = function (oComponent) {
		var sComponentName = oComponent.name;
		var sAppVersion = oComponent.appVersion || Utils.DEFAULT_APP_VERSION;
		var oEntry = Cache.getEntry(sComponentName, sAppVersion);
		return oEntry.file.changes.changes;
	};

	/**
	 * Add a change for the given component to the cached changes.
	 *
	 * @param {object} oComponent - Contains component data needed for adding change
	 * @param {string} oComponent.name - Name of the component
	 * @param {string} oComponent.appVersion - Current running version of application
	 * @param {object} oChange - The change in JSON format
	 * @public
	 */
	Cache.addChange = function (oComponent, oChange) {
		var aChanges = Cache._getChangeArray(oComponent);

		if (!aChanges) {
			return;
		}

		aChanges.push(oChange);
	};

	/**
	 * Updates a change for the given component in the cached changes.
	 *
	 * @param {object} oComponent - Contains component data needed for adding change
	 * @param {string} oComponent.name - Name of the component
	 * @param {string} oComponent.appVersion - Current running version of application
	 * @param {object} oChange - The change in JSON format
	 * @public
	 */
	Cache.updateChange = function (oComponent, oChange) {
		var aChanges = Cache._getChangeArray(oComponent);

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
	 * @param {object} oComponent - Contains component data needed for adding change
	 * @param {string} oComponent.name - Name of the component
	 * @param {string} oComponent.appVersion - Current running version of application
	 * @param {object} oChangeDefinition - The change in JSON format
	 * @public
	 */
	Cache.deleteChange = function (oComponent, oChangeDefinition) {
		var aChanges = Cache._getChangeArray(oComponent);

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
