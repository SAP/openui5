/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/ObjectPath",
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/Utils"
],
function(
	ObjectPath,
	Log,
	FlexState,
	ControlVariantApplyAPI,
	Utils
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
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var Cache = function() {};

	function getChangeCategory(oChangeDefinition) {
		switch (oChangeDefinition.fileType) {
			case "change":
				if (oChangeDefinition.selector && oChangeDefinition.selector.persistencyKey) {
					return ["comp", "changes"];
				}
				if (oChangeDefinition.variantReference) {
					return "variantDependentControlChanges";
				}
				return "changes";
			case "ctrl_variant":
				return "variants";
			case "ctrl_variant_change":
				return "variantChanges";
			case "ctrl_variant_management_change":
				return "variantManagementChanges";
			case "variant":
				return ["comp", "variants"];
			default:
				return undefined;
		}
	}

	function _getArray(sComponentName, oChange) {
		// FIXME Don't mutate the storage response
		var mStorageResponse = FlexState.getFlexObjectsFromStorageResponse(sComponentName);
		var vPath = getChangeCategory(oChange);
		return ObjectPath.get(vPath, mStorageResponse);
	}

	function concatControlVariantIdWithCacheKey(sCacheKey, sControlVariantIds) {
		if (!sControlVariantIds) {
			return sCacheKey;
		}
		return sCacheKey.concat("-", sControlVariantIds);
	}

	function _trimEtag(sCacheKey) {
		return sCacheKey.replace(/(^W\/|")/g, "");
	}

	Cache.NOTAG = "<NoTag>";

	/**
	 * Clears whole entries stored in the cache.
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	Cache.clearEntries = function() {
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
	 * @param {string} [mPropertyBag.version] - Number of the version being processed
	 * @param {boolean} bInvalidateCache - should the cache be invalidated
	 * @returns {Promise} resolves with the change file for the given component, either from cache or back end
	 */
	Cache.getChangesFillingCache = function(mComponent, mPropertyBag, bInvalidateCache) {
		var oPromise = Promise.resolve();
		if (bInvalidateCache) {
			oPromise = FlexState.update(mPropertyBag);
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
	 * @param {object} oAppComponent - Application component
	 * @return {Promise} Returns the promise resolved with the determined cache key
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 *
	 */
	Cache.getCacheKey = async function(mComponent, oAppComponent) {
		let sCacheKey = Cache.NOTAG;
		if (!mComponent || !mComponent.name || !oAppComponent) {
			Log.warning("Not all parameters were passed to determine a flexibility cache key.");
		} else {
			const oWrappedChangeFileContent = await this.getChangesFillingCache(mComponent);
			if (oWrappedChangeFileContent && oWrappedChangeFileContent.cacheKey) {
				sCacheKey = _trimEtag(oWrappedChangeFileContent.cacheKey);

				// Concat current control variant ids to cache key
				if (Utils.isApplicationComponent(oAppComponent) || Utils.isEmbeddedComponent(oAppComponent)) {
					const oVariantModel = await ControlVariantApplyAPI.getVariantModel(oAppComponent);
					// If there are no changes, the standard variant is created after the variant management control is instantiated
					// When the cache key is calculated before this happens, the standard variant id is unknown
					// To avoid inconsistencies between page load and navigation scenarios, all standard variants are filtered
					var aVariantManagementControlIds = oVariantModel.getVariantManagementControlIds();
					var aCurrentControlVariantIds = oVariantModel.getCurrentControlVariantIds()
					.filter(function(sVariantId) {
						// FIXME: The standard variant flag should be part of the variant instance
						// This can be changed once the variant data selector is ready
						// For now rely on the fact that standard variants have the same name as the vm control
						return !aVariantManagementControlIds.includes(sVariantId);
					});
					sCacheKey = concatControlVariantIdWithCacheKey(sCacheKey, aCurrentControlVariantIds.join("-"));
				}
			}
		}

		return sCacheKey;
	};

	/**
	 * Add a change for the given component to the cached changes.
	 *
	 * @param {object} oComponent - Contains component data needed for adding change
	 * @param {string} oComponent.name - Name of the component
	 * @param {object} oChange - The change in JSON format
	 */
	Cache.addChange = function(oComponent, oChange) {
		var aChanges = _getArray(oComponent.name, oChange);

		if (!aChanges) {
			return;
		}
		aChanges.push(oChange);

		FlexState.getFlexObjectsDataSelector().checkUpdate({ reference: oComponent.name });
	};

	/**
	 * Updates a change for the given component in the cached changes.
	 *
	 * @param {object} oComponent - Contains component data needed for adding change
	 * @param {string} oComponent.name - Name of the component
	 * @param {object} oChange - The change in JSON format
	 */
	Cache.updateChange = function(oComponent, oChange) {
		var aChanges = _getArray(oComponent.name, oChange);

		if (!aChanges) {
			return;
		}

		for (var i = 0; i < aChanges.length; i++) {
			if (aChanges[i].fileName === oChange.fileName) {
				aChanges.splice(i, 1, oChange);
				break;
			}
		}

		FlexState.getFlexObjectsDataSelector().checkUpdate({ reference: oComponent.name });
	};

	/**
	 * Delete a change for the given component from the cached changes.
	 *
	 * @param {object} oComponent - Contains component data needed for adding change
	 * @param {string} oComponent.name - Name of the component
	 * @param {object} oChange - The change in JSON format
	 */
	Cache.deleteChange = function(oComponent, oChange) {
		var aChanges = _getArray(oComponent.name, oChange);

		if (!aChanges) {
			return;
		}

		for (var i = 0; i < aChanges.length; i++) {
			if (aChanges[i].fileName === oChange.fileName) {
				aChanges.splice(i, 1);
				break;
			}
		}

		FlexState.getFlexObjectsDataSelector().checkUpdate({ reference: oComponent.name });
	};

	/**
	 * Remove changes for the given component from the cached changes.
	 *
	 * @param {object} oComponent - Component data needed for adding change
	 * @param {string} oComponent.name - Name of the component
	 * @param {string[]} aChangeNames - Array of names of the changes to be deleted
	 */
	Cache.removeChanges = function(oComponent, aChangeNames) {
		var oEntry = FlexState.getFlexObjectsFromStorageResponse(oComponent.name);

		if (!oEntry) {
			return;
		}

		oEntry.changes = oEntry.changes.filter(function(oChange) {
			return aChangeNames.indexOf(oChange.fileName) === -1;
		});

		FlexState.getFlexObjectsDataSelector().checkUpdate({ reference: oComponent.name });
	};

	return Cache;
}, /* bExport= */true);