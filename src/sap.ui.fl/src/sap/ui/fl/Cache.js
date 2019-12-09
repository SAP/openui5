/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/apply/_internal/connectors/StaticFileConnector",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/write/_internal/CompatibilityConnector",
	"sap/ui/fl/Utils",
	"sap/base/strings/formatMessage",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/ObjectPath"
],
function(
	LrepConnector,
	StaticFileConnector,
	FlexState,
	CompatibilityConnector,
	Utils,
	formatMessage,
	Log,
	jQuery,
	ObjectPath
) {
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
	 * @private
	 * @ui5-restricted sap.ui.fl
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
	 * @private
	 * @ui5-restricted sap.ui.fl
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
	 * @ui5-restricted sap.ui.fl
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
	 * loadChanges method of the CompatibilityConnector.
	 *
	 * @param {map} mComponent - Contains component data needed for reading changes
	 * @param {string} mComponent.name - Name of the component
	 * @param {string} mComponent.appVersion - Current running version of application
	 * @param {map} [mPropertyBag] - Contains additional data needed for reading changes
	 * @param {object} [mPropertyBag.appDescriptor] - Manifest that belongs to actual component
	 * @param {string} [mPropertyBag.siteId] - <code>sideId</code> that belongs to actual component
	 * @param {string} [mPropertyBag.cacheKey] - key to validate the client side stored cache entry
	 * @param {string} [mPropertyBag.appName] - name where bundled changes from the application development are stored
	 * @param {boolean} bInvalidateCache - should the cache be invalidated
	 * @returns {Promise} resolves with the change file for the given component, either from cache or back end
	 *
	 * @public
	 */
	Cache.getChangesFillingCache = function (mComponent, mPropertyBag, bInvalidateCache) {
		var sComponentName = mComponent.name;
		var sAppVersion = mComponent.appVersion || Utils.DEFAULT_APP_VERSION;
		var oCacheEntry = Cache.getEntry(sComponentName, sAppVersion);
		var oCurrentLoadChanges;
		mPropertyBag = mPropertyBag || {};
		if (oCacheEntry.promise && !bInvalidateCache) {
			return oCacheEntry.promise;
		}

		// in case of no changes present according to async hints
		if (mPropertyBag.cacheKey === "<NO CHANGES>") {
			// TODO: handle the "no cache" scenario in the connectors
			oCurrentLoadChanges = StaticFileConnector.loadFlexData({
				reference: sComponentName,
				appVersion: mComponent.appVersion,
				componentName: mPropertyBag.appName
			}).then(function (oData) {
				oCacheEntry.file = {
					changes: oData,
					componentClassName: sComponentName
				};
				return oCacheEntry.file;
			});
			oCacheEntry.promise = oCurrentLoadChanges;
			return oCurrentLoadChanges;
		}

		var oChangesLoadingPromise = CompatibilityConnector.loadChanges(mComponent, mPropertyBag)
		.catch(function (oError) {
			var sMessageText = "";
			if (oError.messages && oError.messages.length !== 0 && oError.messages[0].text) {
				sMessageText = oError.messages[0].text;
			}
			var sErrorMessage = formatMessage("Loading changes for {0} failed!\nError code: {1}\nMessage: {2}", mComponent.name, oError.code || "", sMessageText);
			// if the back end is not reachable we still cache the results in a valid way because the url request is
			// cached by the browser in its negative cache anyway.
			Log.error(sErrorMessage);
			return Promise.resolve({
				changes: {
					changes: [],
					variantSection: {},
					ui2personalization: {}
				}
			});
		});

		oCacheEntry.promise = oChangesLoadingPromise.then(function (mChanges) {
			oCacheEntry.file = mChanges;

			// correct place to initialize maps yet to be defined
			FlexState.clearState(sComponentName);
			FlexState._initForReferenceWithData(
				Object.assign({
					reference: sComponentName,
					storageResponse: mChanges,
					component: {
						id: mPropertyBag.componentId || mPropertyBag.component && mPropertyBag.component.getId && mPropertyBag.component.getId()
					}
				})
			);

			return oCacheEntry.file;
		}, function (err) {
			Cache._deleteEntry(sComponentName, sAppVersion);
			throw err;
		});

		return oCacheEntry.promise;
	};

	Cache.NOTAG = "<NoTag>";

	Cache._trimEtag = function(sCacheKey) {
		return sCacheKey.replace(/(^W\/|")/g, '');
	};

	Cache._concatControlVariantIdWithCacheKey = function (sCacheKey, sControlVariantIds) {
		if (!sControlVariantIds) {
			return sCacheKey;
		}
		return sCacheKey === Cache.NOTAG ?
			sCacheKey.replace(/>$/, ''.concat('-', sControlVariantIds, '>')) :
			sCacheKey.concat('-', sControlVariantIds);
	};

	/**
	 * Function to retrieve the cache key of the SAPUI5 flexibility request of a given application
	 *
	 * @param {map} mComponent - component map
	 * @param {string} mComponent.name Name of the application component
	 * @param {string} mComponent.appVersion Version of the application component
	 * @param {object} oAppComponent - Application component
	 * @return {Promise} Returns the promise resolved with the determined cache key
	 *
	 * @private
	 * @restricted sap.ui.fl
	 *
	 */
	Cache.getCacheKey = function (mComponent, oAppComponent) {
		if (!mComponent || !mComponent.name || !mComponent.appVersion || !oAppComponent) {
			Log.warning("Not all parameters were passed to determine a flexibility cache key.");
			return Promise.resolve(Cache.NOTAG);
		}
		return this.getChangesFillingCache(mComponent)
			.then(function (oWrappedChangeFileContent) {
				if (oWrappedChangeFileContent && oWrappedChangeFileContent.etag) {
					return Cache._trimEtag(oWrappedChangeFileContent.etag);
				}

				return Cache.NOTAG;
			})
			.then(function(sCacheKey) {
				// concat current control variant ids to cachekey if available
				var oVariantModel = oAppComponent.getModel(Utils.VARIANT_MODEL_NAME);
				var aCurrentControlVariantIds = oVariantModel ? oVariantModel.getCurrentControlVariantIds() : [];
				return Cache._concatControlVariantIdWithCacheKey(sCacheKey, aCurrentControlVariantIds.join("-"));
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
	 * Syncs the passed variant management section with the component's cache entry.
	 *
	 * @param {sap.ui.core.Component} oComponent - Cache entry's component
	 * @param {object} oVariantControllerFileContent Variant Controller applicable to the passed component
	 * @public
	 */
	Cache.setVariantManagementSection = function (oComponent, oVariantControllerFileContent) {
		var sComponentName = oComponent.name;
		var sAppVersion = oComponent.appVersion || Utils.DEFAULT_APP_VERSION;
		var oEntry = Cache.getEntry(sComponentName, sAppVersion);

		if (!ObjectPath.get("file.changes.variantSection", oEntry)) {
			return;
		}

		oEntry.file.changes.variantSection = oVariantControllerFileContent;
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
	 * Remove changes for the given component from the cached changes.
	 *
	 * @param {object} oComponent Component data needed for adding change
	 * @param {string} oComponent.name Name of the component
	 * @param {string} oComponent.appVersion Current running version of application
	 * @param {string[]} aChangeNames Array of names of the changes to be deleted
	 * @public
	 */
	Cache.removeChanges = function (oComponent, aChangeNames) {
		var oEntry = Cache.getEntry(oComponent.name, oComponent.appVersion);
		oEntry.file.changes.changes = oEntry.file.changes.changes.filter(function(oChange) {
			return aChangeNames.indexOf(oChange.fileName) === -1;
		});
		var oVariantSection = oEntry.file.changes.variantSection;
		Object.keys(oVariantSection).forEach(function(sId) {
			oVariantSection[sId].variants.forEach(function(oVariant) {
				oVariant.controlChanges = oVariant.controlChanges.filter(function(oChange) {
					return aChangeNames.indexOf(oChange.getFileName()) === -1;
				});
			});
		});
	};

	/**
	 * Retrieve a personalization object stored for an application under a given container ID and item name;
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
		return this.getChangesFillingCache(mComponent).then(function (oResponse) {
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