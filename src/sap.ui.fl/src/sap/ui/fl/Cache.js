/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/Utils",
	"sap/base/Log"
],
function(
	LrepConnector,
	FlexState,
	Utils,
	Log
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
	var Cache = function () {};

	function _getChangeArray(sComponentName) {
		return FlexState.getFlexObjectsFromStorageResponse(sComponentName).changes;
	}

	function _concatControlVariantIdWithCacheKey(sCacheKey, sControlVariantIds) {
		if (!sControlVariantIds) {
			return sCacheKey;
		}
		return sCacheKey === Cache.NOTAG ?
			sCacheKey.replace(/>$/, ''.concat('-', sControlVariantIds, '>')) :
			sCacheKey.concat('-', sControlVariantIds);
	}

	function _trimEtag(sCacheKey) {
		return sCacheKey.replace(/(^W\/|")/g, '');
	}

	Cache.NOTAG = "<NoTag>";

	/**
	 * Clears whole entries stored in the cache.
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	Cache.clearEntries = function () {
		// TODO remove.. (used in tests)
		FlexState.clearState();
	};

	/**
	 * Gets the data from the FlexState for a given reference.
	 * If bInvalidateCache is set the FlexState is cleared and the data is fetched again.
	 *
	 * @param {map} mComponent - Contains component data needed for reading changes
	 * @param {string} mComponent.name - Name of the component
	 * @param {object} [mPropertyBag] - Contains additional data needed for reading changes
	 * @param {string} [mPropertyBag.componentId] - ID of the current component, needed if bInvalidataCache is set
	 * @param {boolean} bInvalidateCache - should the cache be invalidated
	 * @returns {Promise} resolves with the change file for the given component, either from cache or back end
	 *
	 * @public
	 */
	Cache.getChangesFillingCache = function (mComponent, mPropertyBag, bInvalidateCache) {
		var oPromise = Promise.resolve();
		if (bInvalidateCache) {
			oPromise = FlexState.clearAndInitialize(mPropertyBag);
		}

		return oPromise.then(function() {
			return FlexState.getStorageResponse(mComponent.name);
		})
		.catch(function() {
			return {};
		});
	};

	/**
	 * Function to retrieve the cache key of the SAPUI5 flexibility request of a given application
	 *
	 * @param {map} mComponent - component map
	 * @param {string} mComponent.name - Name of the application component
	 * @param {string} mComponent.appVersion - Version of the application component
	 * @param {object} oAppComponent - Application component
	 * @return {Promise} Returns the promise resolved with the determined cache key
	 *
	 * @private
	 * @restricted sap.ui.fl
	 *
	 */
	Cache.getCacheKey = function (mComponent, oAppComponent) {
		if (!mComponent || !mComponent.name || !oAppComponent) {
			Log.warning("Not all parameters were passed to determine a flexibility cache key.");
			return Promise.resolve(Cache.NOTAG);
		}
		return this.getChangesFillingCache(mComponent)
		.then(function (oWrappedChangeFileContent) {
			if (oWrappedChangeFileContent && oWrappedChangeFileContent.cacheKey) {
				return _trimEtag(oWrappedChangeFileContent.cacheKey);
			}

			return Cache.NOTAG;
		})
		.then(function(sCacheKey) {
			// concat current control variant ids to cachekey if available
			var oVariantModel = oAppComponent.getModel(Utils.VARIANT_MODEL_NAME);
			var aCurrentControlVariantIds = oVariantModel ? oVariantModel.getCurrentControlVariantIds() : [];
			return _concatControlVariantIdWithCacheKey(sCacheKey, aCurrentControlVariantIds.join("-"));
		});
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
		var aChanges = _getChangeArray(oComponent.name);

		if (!aChanges) {
			return;
		}
		aChanges.push(oChange);
	};

	/**
	 * Syncs the passed variant management section with the component's cache entry.
	 *
	 * @param {object} oComponent - Contains component data needed for adding change
	 * @param {string} oComponent.name - Name of the component
	 * @param {object} oVariantControllerFileContent - Variant Controller applicable to the passed component
	 * @public
	 */
	Cache.setVariantManagementSection = function (oComponent, oVariantControllerFileContent) {
		var oFlexObjects = FlexState.getFlexObjectsFromStorageResponse(oComponent.name);

		if (!oFlexObjects.variantSection) {
			return;
		}
		oFlexObjects.variantSection = oVariantControllerFileContent;
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
		var aChanges = _getChangeArray(oComponent.name);

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
		var aChanges = _getChangeArray(oComponent.name);

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
	 * @param {object} oComponent - Component data needed for adding change
	 * @param {string} oComponent.name - Name of the component
	 * @param {string} oComponent.appVersion - Current running version of application
	 * @param {string[]} aChangeNames - Array of names of the changes to be deleted
	 * @public
	 */
	Cache.removeChanges = function (oComponent, aChangeNames) {
		var oEntry = FlexState.getFlexObjectsFromStorageResponse(oComponent.name);
		oEntry.changes = oEntry.changes.filter(function(oChange) {
			return aChangeNames.indexOf(oChange.fileName) === -1;
		});
		var oVariantSection = oEntry.variantSection;
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
	 * @param {string} sReference - The reference of the application for which the personalization should be retrieved
	 * @param {string} sAppVersion - Currently running version of the application
	 * @param {string} sContainerKey - The key of the container in which the personalization was stored
	 * @param {string} [sItemName] - The item name under which the personalization was stored
	 * @returns {Promise} Promise resolving with the object stored under the passed container key and item name,
	 * or undefined in case no entry was stored for these;
	 * in case no sItemName was passed all entries known for the container key
	 */
	Cache.getPersonalization = function (sReference, sContainerKey, sItemName) {
		var mComponent = {
			name: sReference
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
	 * @param {object} mPersonalization - Object with information about the personalization
	 * @param {string} mPersonalization.reference - The reference of the application for which the personalization should be stored
	 * @param {string} mPersonalization.containerKey - The key of the container in which the personalization should stored
	 * @param {string} mPersonalization.itemName - The name under which the personalization should be stored
	 * @param {string} mPersonalization.content - The personalization content to be stored
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
		var oEntry = FlexState.getFlexObjectsFromStorageResponse(mPersonalization.reference);
		var oPersonalizationSubsection = oEntry.ui2personalization;
		if (!oPersonalizationSubsection[mPersonalization.containerKey]) {
			oPersonalizationSubsection[mPersonalization.containerKey] = [];
		}

		oPersonalizationSubsection[mPersonalization.containerKey].push(mPersonalization);
	};

	/**
	 * Deletes the personalization for a given reference
	 *
	 * @param {string} sReference - The reference of the application for which the personalization should be deleted
	 * @param {string} sContainerKey - The key of the container for which the personalization should be deleted
	 * @param {string} sItemName - The name under which the personalization should be deleted
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
		var oGetAllItemsPromise = Cache.getPersonalization(sReference, sContainerKey);
		var oGetItemPromise = Cache.getPersonalization(sReference, sContainerKey, sItemName);

		return Promise.all([oGetAllItemsPromise, oGetItemPromise]).then(function (aParams) {
			var aItems = aParams[0];
			var oToBeDeletedItem = aParams[1];
			var nIndexOfItem = aItems.indexOf(oToBeDeletedItem);
			aItems.splice(nIndexOfItem, 1);
		});
	};

	return Cache;
}, /* bExport= */true);