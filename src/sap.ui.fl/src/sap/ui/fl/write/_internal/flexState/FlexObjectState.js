/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantMerger",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/apply/_internal/flexState/compVariants/Utils",
	"sap/ui/fl/Utils"
], function(
	_omit,
	FlexState,
	ManifestUtils,
	States,
	ChangesController,
	CompVariantState,
	CompVariantMerger,
	VariantManagementState,
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
		//Enhance CompVariantsMap with external data and standard variant after FlexState has been cleared and reinitialized
		if (mPropertyBag.invalidateCache) {
			var oDataToRestore = FlexState.getInitialNonFlCompVariantData(mPropertyBag.reference);
			if (oDataToRestore) {
				Object.keys(oDataToRestore).forEach(function(sPersistencyKey) {
					mCompEntities._initialize(sPersistencyKey, oDataToRestore[sPersistencyKey].variants);
					CompVariantMerger.merge(sPersistencyKey, mCompEntities[sPersistencyKey], oDataToRestore[sPersistencyKey].standardVariant);
				});
			}
		}

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

	/**
	 * Removes variant-dependent changes belonging to variants which are currently not selected
	 *
	 * @param {array} aChanges - List of changes to check
	 * @param {sap.ui.fl.Control} oControl - Control for which the changes are being checked
	 * @returns {sap.ui.fl.Change[]} List of variant-dependent changes belonging to the currently selected variants
	 */
	 function filterChangesByCurrentVariants(aChanges, oControl) {
		// 1. Get current variant references
		var oComponent = Utils.getAppComponentForControl(oControl);
		var oModel = oComponent.getModel(Utils.VARIANT_MODEL_NAME);
		var sFlexReference = oModel && oModel.sFlexReference;
		var aVariantManagementReferences = VariantManagementState.getVariantManagementReferences(sFlexReference);

		if (aVariantManagementReferences.length === 0) {
			return aChanges;
		}

		var aCurrentVariantReferences = aVariantManagementReferences.map(function(sVMReference) {
			return oModel.getCurrentVariantReference(sVMReference);
		});

		// 2. Remove variant-dependent changes not assigned to a current variant reference
		return aChanges.filter(function(oChange) {
			return aCurrentVariantReferences.some(function(sCurrentVariantReference) {
				return oChange.getVariantReference() === sCurrentVariantReference
					|| !oChange.getVariantReference();
			});
		});
	}

	function getChangePersistenceEntities(mPropertyBag) {
		var oChangePersistence = getChangePersistence(mPropertyBag);

		return oChangePersistence.getChangesForComponent(_omit(mPropertyBag, ["invalidateCache", "selector"]), mPropertyBag.invalidateCache)
			.then(function(aPersistedChanges) {
				var aDirtyChanges = [];
				if (mPropertyBag.includeDirtyChanges) {
					aDirtyChanges = oChangePersistence.getDirtyChanges();
				}
				var aChanges = aPersistedChanges.concat(aDirtyChanges);
				if (mPropertyBag.onlyCurrentVariants) {
					return filterChangesByCurrentVariants(aChanges, mPropertyBag.selector);
				}
				return aChanges;
			});
	}

	function saveChangePersistenceEntities(mPropertyBag, oAppComponent) {
		var oFlexController = ChangesController.getFlexControllerInstance(mPropertyBag.selector);
		var oDescriptorFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);

		return oFlexController.saveAll(
			oAppComponent,
			mPropertyBag.skipUpdateCache,
			mPropertyBag.draft,
			mPropertyBag.layer,
			mPropertyBag.removeOtherLayerChanges
		)
			.then(oDescriptorFlexController.saveAll.bind(
				oDescriptorFlexController,
				oAppComponent,
				mPropertyBag.skipUpdateCache,
				mPropertyBag.draft,
				mPropertyBag.layer,
				mPropertyBag.removeOtherLayerChanges
			));
	}

	/**
	 * Collects changes from the different states within the <code>sap.ui.fl</code> library.
	 * This includes the flexState entities as well as the <code>sap.ui.fl.ChangePersistence</code>.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Retrieves the associated flex persistence
	 * @param {boolean} mPropertyBag.invalidateCache - Flag if the cache should be invalidated
	 * @param {boolean} mPropertyBag.includeCtrlVariants - Flag if control variant changes should be included
	 * @param {boolean} mPropertyBag.includeDirtyChanges - Flag if dirty UI changes should be included
	 * @returns {Promise<sap.ui.fl.Change[]>} Flex objects, containing changes, compVariants & changes as well as ctrl_variant and changes
	 */
	FlexObjectState.getFlexObjects = function (mPropertyBag) {
		return initFlexStateAndSetReference(mPropertyBag)
			.then(function () {
				return getChangePersistenceEntities(mPropertyBag);
			}).then(function (aChangePersistenceEntities) {
				return getCompVariantEntities(mPropertyBag).concat(aChangePersistenceEntities);
			});
	};

	/**
	 * Collects modified changes from the different states within the <code>sap.ui.fl</code> library.
	 * This includes the flexState entities as well as the <code>sap.ui.fl.ChangePersistence</code>.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Retrieves the associated flex persistence
	 * @param {boolean} mPropertyBag.invalidateCache - Flag if the cache should be invalidated
	 * @param {boolean} mPropertyBag.includeCtrlVariants - Flag if control variant changes should be included
	 * @returns {sap.ui.fl.Change[]} Flex objects, containing changes, compVariants & changes as well as ctrl_variant and changes
	 */
	FlexObjectState.getDirtyFlexObjects = function (mPropertyBag) {
		mPropertyBag.includeDirtyChanges = true;
		var oChangePersistence = getChangePersistence(mPropertyBag);
		var aChangePersistenceEntities = oChangePersistence.getDirtyChanges();
		var aCompVariantEntities = getCompVariantEntities(mPropertyBag);
		return aChangePersistenceEntities.concat(aCompVariantEntities).filter(function(oFlexObject) {
			return oFlexObject.getState() !== States.PERSISTED;
		});
	};

	/**
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector to retrieve the associated flex persistence
	 * @param {object} [mPropertyBag.appDescriptor] - Manifest that belongs to the current running component
	 * @param {string} [mPropertyBag.siteId] - ID of the site belonging to the current running component
	 * @param {string} [mPropertyBag.layer] - Specifies a single layer for loading and saving changes
	 * @param {boolean} [mPropertyBag.ignoreMaxLayerParameter] - Indicates that changes are to be loaded without layer filtering
	 * @param {boolean} [mPropertyBag.includeCtrlVariants] - Indicates that control variants are to be included
	 * @param {string} [mPropertyBag.cacheKey] - Key to validate the cache entry stored on client side
	 * @param {boolean} [mPropertyBag.invalidateCache] - Indicates whether the cache is to be invalidated
	 * @param {boolean} [mPropertyBag.removeOtherLayerChanges=false] - Whether to remove changes on other layers before saving
	 * @returns {Promise<sap.ui.fl.Change[]>} Flex objects, containing changes, compVariants & changes as well as ctrl_variant and changes
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