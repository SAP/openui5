/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/apply/_internal/flexState/compVariants/Utils",
	"sap/ui/fl/Utils"
], function(
	_omit,
	FlexState,
	ManifestUtils,
	ChangesController,
	CompVariantState,
	ChangePersistenceFactory,
	LayerUtils,
	CompVariantsUtils,
	Utils
) {
	"use strict";

	/**
	 * @namespace sap.ui.fl.apply._internal.flexState.FlexObjectState
	 * @since 1.83
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var FlexObjectState = {};

	function initFlexStateAndSetReference(mPropertyBag) {
		mPropertyBag.reference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.selector);

		return FlexState.initialize({
			componentId: mPropertyBag.componentId || Utils.getAppComponentForControl(mPropertyBag.selector).getId(),
			reference: mPropertyBag.reference,
			componentData: {},
			manifest: {}
		});
	}

	function getCompVariantEntities(mPropertyBag) {
		var mCompEntities = FlexState.getCompVariantsMap(mPropertyBag.reference);
		var aEntities = [];
		for (var sPersistencyKey in mCompEntities) {
			var mCompVariantsOfPersistencyKey = mCompEntities[sPersistencyKey];
			for (var sId in mCompVariantsOfPersistencyKey.byId) {
				aEntities.push(mCompVariantsOfPersistencyKey.byId[sId]);
			}
		}
		return LayerUtils.filterChangeOrChangeDefinitionsByCurrentLayer(aEntities, mPropertyBag.currentLayer);
	}

	function saveCompEntities(mPropertyBag) {
		var sReference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.selector);
		return CompVariantState.persistAll(sReference);
	}

	function getChangePersistence(mPropertyBag) {
		if (!mPropertyBag.reference) {
			var oAppComponent = ChangesController.getAppComponentForSelector(mPropertyBag.selector);
			mPropertyBag.reference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		}
		return ChangePersistenceFactory.getChangePersistenceForComponent(mPropertyBag.reference);
	}

	function getChangePersistenceEntities(mPropertyBag) {
		var oChangePersistence = getChangePersistence(mPropertyBag);

		return oChangePersistence.getChangesForComponent(_omit(mPropertyBag, ["invalidateCache", "selector"]), mPropertyBag.invalidateCache)

		.then(function(aPersistedChanges) {
			var aDirtyChanges = [];
			if (mPropertyBag.includeDirtyChanges) {
				aDirtyChanges = oChangePersistence.getDirtyChanges();
			}
			return aPersistedChanges.concat(aDirtyChanges);
		});
	}

	function saveChangePersistenceEntities(mPropertyBag, oAppComponent) {
		var oFlexController = ChangesController.getFlexControllerInstance(mPropertyBag.selector);
		var oDescriptorFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);

		return oFlexController.saveAll(oAppComponent, mPropertyBag.skipUpdateCache, mPropertyBag.draft)
			.then(oDescriptorFlexController.saveAll.bind(oDescriptorFlexController, oAppComponent, mPropertyBag.skipUpdateCache, mPropertyBag.draft));
	}

	/**
	 * Collects changes from the different states within the <code>sap.ui.fl</code>-library.
	 * This includes the flexState entities as well as the <code>sap.ui.fl.ChangePersistence</code>.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Control} mPropertyBag.control - Retrieves the associated flex persistence
	 * @param {boolean} mPropertyBag.invalidateCache - Flag if the cache should be invalidated
	 * @param {boolean} mPropertyBag.includeCtrlVariants - Flag if control variant change should be included
	 * @param {boolean} mPropertyBag.includeDirtyChanges - Flag if dirty UI changes should be included
	 * @returns {Promise<sap.ui.fl.Change[]>} Flex objects, containing changes, compVariants & changes as well as ctrl_variant and changes
	 */
	FlexObjectState.getFlexObjects = function (mPropertyBag) {
		return initFlexStateAndSetReference(mPropertyBag)
			.then(function () {
				var aCompVariantEntities = getCompVariantEntities(mPropertyBag);
				var aChangePersistenceEntities = getChangePersistenceEntities(mPropertyBag);

				return Promise.all([
					aCompVariantEntities,
					aChangePersistenceEntities
				]).then(function (aEntities) {
					return aEntities[0] // compVariant entities (changes of type defaultVariant / standardVariant, variant)
						.concat(aEntities[1]); // ChangePersistence entities (change, ctrl_variant, ctrl_variant_change, ctrl_variant_management_change)
				});
			});
	};

	/**
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector to retrieve the associated flex persistence
	 * @param {object} [mPropertyBag.appDescriptor] - Manifest that belongs to the current running component
	 * @param {string} [mPropertyBag.siteId] - ID of the site belonging to the current running component
	 * @param {string} [mPropertyBag.layer] - Specifies a single layer for loading change; if this parameter is set, the max layer filtering is not applied
	 * @param {boolean} [mPropertyBag.ignoreMaxLayerParameter] - Indicates that changes are to be loaded without layer filtering
	 * @param {boolean} [mPropertyBag.includeVariants] - Indicates that smart variants are to be included
	 * @param {string} [mPropertyBag.cacheKey] - Key to validate the cache entry stored on client side
	 * @param {boolean} [mPropertyBag.invalidateCache] - Indicates whether the cache is to be invalidated
	 */
	FlexObjectState.saveFlexObjects = function(mPropertyBag) {
		var oAppComponent = ChangesController.getAppComponentForSelector(mPropertyBag.selector);
		return Promise.all([
			saveCompEntities(mPropertyBag),
			saveChangePersistenceEntities(mPropertyBag, oAppComponent)
		])
		.then(function() {
			if (mPropertyBag.layer) {
				//TODO: sync the layer parameter name with new persistence and remove this line
				mPropertyBag.currentLayer = mPropertyBag.layer;
			}
			// with invalidation more parameters are required to make a new storage request
			mPropertyBag.componentId = oAppComponent.getId();
			mPropertyBag.invalidateCache = true;
			return FlexObjectState.getFlexObjects(_omit(mPropertyBag, "skipUpdateCache"));
		});
	};

	return FlexObjectState;
});