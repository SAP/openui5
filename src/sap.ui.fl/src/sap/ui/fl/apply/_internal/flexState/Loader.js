/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/ObjectPath",
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/initial/_internal/StorageUtils"
], function(
	ObjectPath,
	ManagedObject,
	ManifestUtils,
	Settings,
	ApplyStorage,
	StorageUtils
) {
	"use strict";

	function getIdIsLocalTrueObject(vSelector) {
		if (typeof vSelector === "string") {
			vSelector = {id: vSelector};
		}
		vSelector.idIsLocal = true;

		return vSelector;
	}

	function migrateSelectorFlags(bMigrationNeeded, mFlexData) {
		if (bMigrationNeeded) {
			[
				mFlexData.changes,
				mFlexData.variantChanges,
				mFlexData.variantDependentControlChanges,
				mFlexData.variantManagementChanges
			]
			.flat()
			.filter((oFlexObject) => (
				oFlexObject.selector
				&& !oFlexObject.selector.idIsLocal
			))
			.forEach(function(oFlexObject) {
				oFlexObject.selector = getIdIsLocalTrueObject(oFlexObject.selector);

				if (oFlexObject.dependentSelector) {
					Object.keys(oFlexObject.dependentSelector).forEach((sCategory) => {
						const vDependentSelector = oFlexObject.dependentSelector[sCategory];
						if (Array.isArray(vDependentSelector)) {
							oFlexObject.dependentSelector[sCategory] = vDependentSelector.map(getIdIsLocalTrueObject);
						} else {
							oFlexObject.dependentSelector[sCategory] = getIdIsLocalTrueObject(vDependentSelector);
						}
					});
				}
			});
		}

		return mFlexData;
	}

	function filterInvalidFileNames(mFlexData) {
		StorageUtils.getAllFlexObjectNamespaces().forEach(function(vKey) {
			const aFlexItems = ObjectPath.get(vKey, mFlexData);
			if (aFlexItems) {
				ObjectPath.set(vKey, aFlexItems.filter((oFlexItem) => {
					let oTemporaryInstance;
					try {
						oTemporaryInstance = new ManagedObject(oFlexItem.fileName);
					} catch (error) {
						return false;
					}
					oTemporaryInstance.destroy();
					return true;
				}), mFlexData);
			}
		});
		return mFlexData;
	}

	function isMigrationNeeded(oManifest) {
		return oManifest && !!ManifestUtils.getOvpEntry(oManifest);
	}

	function formatFlexData(mFlexData) {
		// TODO: rename "changes" everywhere to avoid oResponse.changes.changes calls
		return {
			changes: mFlexData,
			cacheKey: mFlexData.cacheKey
		};
	}

	function getSideId(oComponentData) {
		if (oComponentData?.startupParameters && Array.isArray(oComponentData.startupParameters.hcpApplicationId)) {
			return oComponentData.startupParameters.hcpApplicationId[0];
		}
	}

	/**
	 * Removes the changes that should be deactivated and the deactivate changes from the Flex Data.
	 * This is the equivalent of deleting changes from the backend.
	 * Example Scenario: When creating an annotation rename change, any control based rename changes should be removed.
	 * But Developer changes can't be deleted from the backend, so they are deactivated.
	 *
	 * @param {object} mFlexData - Flex Data as returned from the Storage
	 * @returns {object} Flex Data without the deactivate and deactivated changes
	 */
	function applyDeactivateChanges(mFlexData) {
		const sDeactivateChangeType = "deactivateChanges";
		const aToBeDeactivatedIds = mFlexData.changes.map((oChange) => {
			if (oChange.changeType === sDeactivateChangeType) {
				return [oChange.fileName, ...oChange.content.changeIds];
			}
		})
		.flat()
		.filter(Boolean);

		// Filter all changes that should be deactivated (also already includes the id of the deactivate changes)
		if (aToBeDeactivatedIds.length) {
			StorageUtils.getAllFlexObjectNamespaces().forEach(function(vKey) {
				const aFlexItems = ObjectPath.get(vKey, mFlexData);
				if (aFlexItems.length) {
					ObjectPath.set(vKey, aFlexItems.filter((oFlexItem) => !aToBeDeactivatedIds.includes(oFlexItem.fileName)), mFlexData);
				}
			});
		}
		return mFlexData;
	}

	/**
	 * Class for loading Flex Data from the backend via the Connectors.
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.Loader
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.flexState
	 */
	return {
		/**
		 * Provides the flex data for a given application based on the configured connectors.
		 * This function needs a manifest object, async hints and either an ID to an instantiated component or component data as parameter.
		 *
		 * The property <code>partialFlexData</code> contains the flexData except the data from flexibility-bundle.json or changes-bundle.json.
		 * This is needed in case descriptor changes are required in a maniFirst scenario before the component and thus the bundle can be loaded.
		 *
		 * @param {object} mPropertyBag - Contains additional data needed for loading changes
		 * @param {object} mPropertyBag.manifest - ManifestObject that belongs to current component
		 * @param {object} mPropertyBag.reference - Flex Reference
		 * @param {string} mPropertyBag.componentData - Component data of the current component
		 * @param {object} [mPropertyBag.reInitialize] - Flag if the application is reinitialized even if it was loaded before
		 * @param {object} [mPropertyBag.asyncHints] - Async hints passed from the app index to the component processing
		 * @param {number} [mPropertyBag.version] - Number of the version in which the state should be initialized
		 * @param {string} [mPropertyBag.adaptationId] - Context-based adaptation for which the state should be initialized
		 * @param {object} [mPropertyBag.partialFlexData] - Contains current flexstate for this reference, indicator to reload bundles from storage
		 * @param {boolean} [mPropertyBag.allContexts] - Includes also restricted context
		 * @returns {Promise<object>} resolves with the change file for the given component from the Storage
		 */
		loadFlexData(mPropertyBag) {
			var sComponentName = ManifestUtils.getBaseComponentNameFromManifest(mPropertyBag.manifest);

			if (mPropertyBag.partialFlexData) {
				return ApplyStorage.completeFlexData({
					reference: mPropertyBag.reference,
					componentName: sComponentName,
					partialFlexData: mPropertyBag.partialFlexData
				}).then(formatFlexData);
			}

			// the cache key cannot be used in case of a reinitialization
			var sCacheKey = mPropertyBag.reInitialize ? undefined : ManifestUtils.getCacheKeyFromAsyncHints(mPropertyBag.reference, mPropertyBag.asyncHints);

			return ApplyStorage.loadFlexData({
				preview: ManifestUtils.getPreviewSectionFromAsyncHints(mPropertyBag.asyncHints),
				reference: mPropertyBag.reference,
				componentName: sComponentName,
				cacheKey: sCacheKey,
				siteId: getSideId(mPropertyBag.componentData),
				appDescriptor: mPropertyBag.manifest.getRawJson ? mPropertyBag.manifest.getRawJson() : mPropertyBag.manifest,
				version: mPropertyBag.version,
				allContexts: mPropertyBag.allContexts,
				adaptationId: mPropertyBag.adaptationId
			})
			.then(applyDeactivateChanges.bind())
			.then(filterInvalidFileNames.bind())
			.then(migrateSelectorFlags.bind(undefined, isMigrationNeeded(mPropertyBag.manifest)))
			.then(formatFlexData);
		},

		/**
		 * Load the names of variants' authors for a given application.
		 *
		 * @param {string} sReference - Flex reference of application
		 * @returns {Promise<object>} Resolving with a list of maps between user's ID and name
		 */
		loadVariantsAuthors(sReference) {
			// the settings are available due to previous loadFlexData calls or
			// not available due to an async hint stating that no changes are available, thus also no author mapping needed
			const oSettings = Settings.getInstanceOrUndef();
			return oSettings?.getIsVariantAuthorNameAvailable() ? ApplyStorage.loadVariantsAuthors(sReference) : Promise.resolve({});
		}
	};
});
