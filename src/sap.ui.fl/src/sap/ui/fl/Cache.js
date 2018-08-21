/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/Utils",
	"sap/base/strings/formatMessage",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/LoaderExtensions"
], function(LrepConnector, Utils, formatMessage, Log, jQuery, LoaderExtensions) {
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

	Cache._oFlexDataPromise = undefined;

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
	 * Returns the last cached flex data request promise
	 *
	 * @returns {Promise} Promise of a flex data request
	 *
	 * @protected
	 */
	Cache.getFlexDataPromise = function () {
		return Cache._oFlexDataPromise;
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
	 * @param {string} sAppVersion - Currently running version of application
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
						contexts: [],
						variantSection: {},
						ui2personalization: {}
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
	 * @param {map} mComponent - Contains component data needed for reading changes
	 * @param {string} mComponent.name - Name of the component
	 * @param {string} mComponent.appVersion - Current running version of application
	 * @param {map} [mPropertyBag] - Contains additional data needed for reading changes
	 * @param {object} [mPropertyBag.appDescriptor] - Manifest that belongs to actual component
	 * @param {string} [mPropertyBag.siteId] - <code>sideId</code> that belongs to actual component
	 * @param {string} [mPropertyBag.cacheKey] - key to validate the client side stored cache entry
	 * @param {string} [mPropertyBag.url] - address to which the request for change should be sent in case the data is not cached
	 * @param {string} [mPropertyBag.appName] - name where bundled changes from the application development are stored
	 * @param {boolean} bInvalidateCache - should the cache be invalidated
	 * @returns {Promise} resolves with the change file for the given component, either from cache or back end
	 *
	 * @public
	 */
	Cache.getChangesFillingCache = function (oLrepConnector, mComponent, mPropertyBag, bInvalidateCache) {
		var sComponentName = mComponent.name;
		var sAppVersion = mComponent.appVersion || Utils.DEFAULT_APP_VERSION;
		var oCacheEntry = Cache.getEntry(sComponentName, sAppVersion);

		if (oCacheEntry.promise && !bInvalidateCache) {
			return oCacheEntry.promise;
		}

		var oChangesBundleLoadingPromise = Cache._getChangesFromBundle(mPropertyBag);

		// in case of no changes present according to async hints
		if (mPropertyBag && mPropertyBag.cacheKey === "<NO CHANGES>") {
			var currentLoadChanges = oChangesBundleLoadingPromise.then(function (aChanges) {
				oCacheEntry.file = {
					changes: {
						changes : aChanges,
						contexts : [],
						variantSection : {},
						ui2personalization : {}
					},
					componentClassName: sComponentName
				};
				return oCacheEntry.file;
			});
			oCacheEntry.promise = currentLoadChanges;
			return currentLoadChanges;
		}

		var oFlexDataPromise = oLrepConnector.loadChanges(mComponent, mPropertyBag);
		var oChangesLoadingPromise = oFlexDataPromise.then(function (oResult) {
			return oResult;
		}, function (oError) {
			// if the back end is not reachable we still cache the results in a valid way because the url request is
			// cached by the browser in its negative cache anyway.
			var sErrorMessage = formatMessage("flexibility service is not available:\nError message: {0}", oError.status);
			Log.error(sErrorMessage);
			return Promise.resolve({
				changes: {
					changes: [],
					contexts: [],
					variantSection: {},
					ui2personalization: {}
				}
			});
		});

		var currentLoadChanges = Promise.all([oChangesBundleLoadingPromise, oChangesLoadingPromise]).then(function (aValues) {
			var aChangesFromBundle = aValues[0];
			var mChanges = aValues[1];

			if (mChanges && mChanges.changes) {
				if (mChanges.changes.settings && mChanges.changes.settings.switchedOnBusinessFunctions) {
					mChanges.changes.settings.switchedOnBusinessFunctions.forEach(function (sValue) {
						Cache._switches[sValue] = true;
					});
				}

				mChanges.changes.changes = aChangesFromBundle.concat(mChanges.changes.changes);
			}
			oCacheEntry.file = mChanges;
			return oCacheEntry.file;
		}, function (err) {
			Cache._deleteEntry(sComponentName, sAppVersion);
			throw err;
		});

		oCacheEntry.promise = currentLoadChanges;
		Cache._oFlexDataPromise = oFlexDataPromise;

		return currentLoadChanges;
	};

	/**
	 * Function to get the changes-bundle.json file stored in the application sources.
	 * This data is returned only in case it is part of the application preload or in debug mode.
	 * In case no debugging takes place and the file is not loaded an empty list is returned.
	 *
	 * @param {map} mPropertyBag
	 * @param {string} mPropertyBag.appName Fully qualified name of the application
	 * @return {Promise} Promise resolving with an array of changes stored in the application source code
	 *
	 * @private
	 */
	Cache._getChangesFromBundle = function (mPropertyBag) {
		var bChangesBundleDeterminable = mPropertyBag && mPropertyBag.appName;

		if (!bChangesBundleDeterminable) {
			return Promise.resolve([]);
		}

		var sResourcePath = mPropertyBag.appName.replace(/\./g, "/") + "/changes/changes-bundle.json";
		var bChangesBundleLoaded = !!sap.ui.loader._.getModuleState(sResourcePath);
		if (bChangesBundleLoaded) {
			return Promise.resolve(LoaderExtensions.loadResource(sResourcePath));
		} else {
			if (!sap.ui.getCore().getConfiguration().getDebug()) {
				return Promise.resolve([]);
			}

			// try to load the source in case a debugging takes place and the component could have no Component-preload
			try {
				return Promise.resolve(LoaderExtensions.loadResource(sResourcePath));
			} catch (e) {
				Log.warning("flexibility did not find a changesBundle.json  for the application");
				return Promise.resolve([]);
			}
		}
	};


	Cache.NOTAG = "<NoTag>";

	/**
	 * Function to retrieve the cache key of the SAPUI5 flexibility request of a given application
	 *
	 * @param {map} mComponent
	 * @param {string} mComponent.name Name of the application component
	 * @param {string} mComponent.appVersion Version of the application component
	 * @return {Promise} Returns the promise resolved with the determined cache key
	 *
	 * @private
	 * @restricted sap.ui.fl
	 *
	 */
	Cache.getCacheKey = function (mComponent) {
		if (!mComponent || !mComponent.name || !mComponent.appVersion) {
			Log.warning("Not all parameters were passed to determine a flexibility cache key.");
			return Promise.resolve(Cache.NOTAG);
		}
		return this.getChangesFillingCache(LrepConnector.createConnector(), mComponent).then(function (oWrappedChangeFileContent) {
			if (oWrappedChangeFileContent && oWrappedChangeFileContent.etag) {
				return oWrappedChangeFileContent.etag;
			} else {
				return Cache.NOTAG;
			}
		});
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



	/**
	 * Retrievea a personalization object stored for an application under a given container ID and item name;
	 * in case no itemName is given all items for the given container key are returned.
	 *
	 * @param {string} sReference The reference of the application for which the personalization should be retrieved
	 * @param {string} sAppVersion Currently running version of the application
	 * @param {string} sContainerKey The key of the container in which the personalization was stored
	 * @param {string} [sItemName] The item name under which the personalization was stored
	 * @returns {Promise} Promise resolving with the object stored under the passed container key and item name,
	 * or undefined in case no entry was stored for these;
	 * in case no sItemName was passed all entries known for the container key
	 */
	Cache.getPersonalization = function (sReference, sAppVersion, sContainerKey, sItemName) {
		var mComponent = {
			name: sReference,
			appVersion: sAppVersion
		};
		return this.getChangesFillingCache(LrepConnector.createConnector(), mComponent).then(function (oResponse) {
			if (!oResponse || !oResponse.changes || !oResponse.changes.ui2personalization ||
				!oResponse.changes.ui2personalization[sContainerKey]) {
				// return undefined in case there is no personalization for the item or an empty array if a list was requested
				return sItemName ? undefined : [];
			}

			if (!sItemName) {
				return oResponse.changes.ui2personalization[sContainerKey] || [];
			}

			return oResponse.changes.ui2personalization[sContainerKey].filter(function (oEntry) {
				return oEntry.itemName === sItemName;
			})[0];
		});
	};

	/**
	 * Stores a personalization object for an application under a given key pair.
	 *
	 * @param {map} mPersonalization
	 * @param {string} mPersonalization.reference The reference of the application for which the personalization should be stored
	 * @param {string} mPersonalization.containerKey The key of the container in which the personalization should stored
	 * @param {string} mPersonalization.itemName The name under which the personalization should be stored
	 * @param {string} mPersonalization.content The personalization content to be stored
	 * @returns {Promise} Promise resolving with the object stored under the passed container key and item name,
	 * or undefined in case no entry was stored for these
	 */
	Cache.setPersonalization = function (mPersonalization) {
		if (!mPersonalization || !mPersonalization.reference ||
			!mPersonalization.containerKey || !mPersonalization.itemName || !mPersonalization.content) {
			return Promise.reject("not all mandatory properties were provided for the storage of the personalization");
		}

		return LrepConnector.createConnector().send("/sap/bc/lrep/ui2personalization/", "PUT", mPersonalization, {})
			.then(this._addPersonalizationToEntries.bind(this, mPersonalization));
	};

	Cache._addPersonalizationToEntries = function (mPersonalization) {
		Object.keys(this._entries[mPersonalization.reference]).forEach(function (sVersion) {
			var oEntry = this._entries[mPersonalization.reference][sVersion];
			var oPersonalizationSubsection = oEntry.file.changes.ui2personalization;
			if (!oPersonalizationSubsection[mPersonalization.containerKey]) {
				oPersonalizationSubsection[mPersonalization.containerKey] = [];
			}

			oPersonalizationSubsection[mPersonalization.containerKey].push(mPersonalization);
		}.bind(this));
	};

	/**
	 * Deletes the personalization for a given reference
	 *
	 * @param {string} sReference The reference of the application for which the personalization should be deleted
	 * @param {string} sContainerKey The key of the container for which the personalization should be deleted
	 * @param {string} sItemName The name under which the personalization should be deleted
	 * @returns {Promise} Promise resolving in case the deletion request was successful
	 */
	Cache.deletePersonalization = function(sReference, sContainerKey, sItemName) {
		if (!sReference || !sContainerKey || !sItemName) {
			return Promise.reject("not all mandatory properties were provided for the storage of the personalization");
		}

		var sUrl = "/sap/bc/lrep/ui2personalization/?reference=";
		sUrl += sReference + "&containerkey=" + sContainerKey + "&itemname=" + sItemName;

		return LrepConnector.createConnector().send(sUrl, "DELETE", {})
			.then(this._removePersonalizationFromEntries.bind(this, sReference, sContainerKey, sItemName));
	};

	Cache._removePersonalizationFromEntries = function (sReference, sContainerKey, sItemName) {
		var aDeletionPromises = [];

		Object.keys(this._entries[sReference]).forEach(function (sAppVersion) {
			var oGetAllItemsPromise = this.getPersonalization(sReference, sAppVersion, sContainerKey);
			var oGetItemPromise = this.getPersonalization(sReference, sAppVersion, sContainerKey, sItemName);

			var oDeletionPromise = Promise.all([oGetAllItemsPromise, oGetItemPromise]).then(function (aParams) {
				var aItems = aParams[0];
				var oToBeDeletedItem = aParams[1];
				var nIndexOfItem = aItems.indexOf(oToBeDeletedItem);
				aItems.splice(nIndexOfItem, 1);
			});

			aDeletionPromises.push(oDeletionPromise);
		}.bind(this));

		return Promise.all(aDeletionPromises);
	};


	return Cache;
}, /* bExport= */true);