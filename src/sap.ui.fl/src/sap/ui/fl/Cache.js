/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/Utils"
], function(
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

	return Cache;
}, /* bExport= */true);