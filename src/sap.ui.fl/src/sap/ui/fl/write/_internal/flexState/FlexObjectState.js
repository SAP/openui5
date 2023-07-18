/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantMerger",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils"
], function(
	_omit,
	States,
	CompVariantMerger,
	VariantManagementState,
	FlexState,
	ManifestUtils,
	ControlVariantApplyAPI,
	CompVariantState,
	Versions,
	FlexControllerFactory,
	ChangePersistenceFactory,
	LayerUtils,
	Utils
) {
	"use strict";

	/**
	 * @namespace
	 * @alias sap.ui.fl.write._internal.flexState.FlexObjectState
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
		// Enhance CompVariantsMap with external data and standard variant after FlexState has been cleared and reinitialized
		if (mPropertyBag.invalidateCache) {
			var oDataToRestore = FlexState.getInitialNonFlCompVariantData(mPropertyBag.reference);
			if (oDataToRestore) {
				Object.keys(oDataToRestore).forEach(function(sPersistencyKey) {
					mCompEntities._initialize(sPersistencyKey, oDataToRestore[sPersistencyKey].variants, oDataToRestore[sPersistencyKey].controlId);
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
			mPropertyBag.reference = ManifestUtils.getFlexReferenceForSelector(mPropertyBag.selector);
		}
		return ChangePersistenceFactory.getChangePersistenceForComponent(mPropertyBag.reference);
	}

	/**
	 * Removes variant-dependent changes belonging to variants which are currently not selected
	 *
	 * @param {array} aChanges - List of changes to check
	 * @param {sap.ui.fl.Control} oControl - Control for which the changes are being checked
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} List of variant-dependent changes belonging to the currently selected variants
	 */
	 function filterChangesByCurrentVariants(aChanges, oControl) {
		// 1. Get current variant references
		var oComponent = Utils.getAppComponentForControl(oControl);
		var oModel = oComponent.getModel(ControlVariantApplyAPI.getVariantModelName());
		var aVariantManagementReferences;
		if (oModel) {
			var sFlexReference = oModel && oModel.sFlexReference;
			aVariantManagementReferences = VariantManagementState.getVariantManagementReferences(sFlexReference);
		} else {
			aVariantManagementReferences = [];
		}

		if (aVariantManagementReferences.length === 0) {
			return aChanges;
		}

		var aCurrentVariantReferences = aVariantManagementReferences.map(function(sVMReference) {
			return oModel.getCurrentVariantReference(sVMReference);
		});

		// 2. Remove variant-dependent changes not assigned to a current variant reference
		// only changes of type 'change' are relevant for this filter
		// 'ctrl_variants' also have a variant reference, but should not be filtered
		return aChanges.filter(function(oChange) {
			return oChange.getFileType() !== "change"
				|| aCurrentVariantReferences.some(function(sCurrentVariantReference) {
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
				if (mPropertyBag.currentLayer) {
					aDirtyChanges = aDirtyChanges.filter(function(oChange) {
						return oChange.getLayer() === mPropertyBag.currentLayer;
					});
				}
			}
			var aChanges = aPersistedChanges.concat(aDirtyChanges);
			if (mPropertyBag.onlyCurrentVariants) {
				return filterChangesByCurrentVariants(aChanges, mPropertyBag.selector);
			}
			return aChanges;
		});
	}

	function saveChangePersistenceEntities(mPropertyBag, oAppComponent) {
		var oFlexController = FlexControllerFactory.createForSelector(mPropertyBag.selector);

		return oFlexController.saveAll(
			oAppComponent,
			mPropertyBag.skipUpdateCache,
			mPropertyBag.draft,
			mPropertyBag.layer,
			mPropertyBag.removeOtherLayerChanges,
			mPropertyBag.condenseAnyLayer
		);
	}

	/**
	 * Collects changes from the different states within the <code>sap.ui.fl</code> library.
	 * This includes the flexState entities as well as the <code>sap.ui.fl.ChangePersistence</code>.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Retrieves the associated flex persistence
	 * @param {string} [mPropertyBag.layer] - Specifies a single layer for loading change; if this parameter is set, the max layer filtering is not applied
	 * @param {string} [mPropertyBag.currentLayer] - Specifies a single layer to filtering changes (without filtering ctrl variant changes)
	 * @param {boolean} [mPropertyBag.invalidateCache] - Flag if the cache should be invalidated
	 * @param {boolean} [mPropertyBag.includeCtrlVariants] - Flag if control variant changes should be included
	 * @param {boolean} [mPropertyBag.includeDirtyChanges] - Flag if dirty UI changes should be included
	 * @param {boolean} [mPropertyBag.version] - The version for which the objects are retrieved
	 * @returns {Promise<sap.ui.fl.apply._internal.flexObjects.FlexObject[]>} Flex objects, containing changes, compVariants & changes as well as ctrl_variant and changes
	 */
	FlexObjectState.getFlexObjects = function(mPropertyBag) {
		return initFlexStateAndSetReference(mPropertyBag)
		.then(function() {
			return getChangePersistenceEntities(mPropertyBag);
		}).then(function(aChangePersistenceEntities) {
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
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Flex objects, containing changes, compVariants & changes as well as ctrl_variant and changes
	 */
	FlexObjectState.getDirtyFlexObjects = function(mPropertyBag) {
		mPropertyBag.includeDirtyChanges = true;
		var oChangePersistence = getChangePersistence(mPropertyBag);
		var aChangePersistenceEntities = oChangePersistence.getDirtyChanges();
		var aCompVariantEntities = getCompVariantEntities(mPropertyBag);
		return aChangePersistenceEntities.concat(aCompVariantEntities).filter(function(oFlexObject) {
			return oFlexObject.getState() !== States.LifecycleState.PERSISTED;
		});
	};

	/**
	 * Checks if dirty flex objects exist for the flex persistence associated with the selector control;
	 * Includes dirty changes on the descriptor as well as dirty changes on SmartVariantManagement of the application.
	 *
	 * @param {object} mPropertyBag Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector To retrieve the associated flex persistence
	 * @returns {boolean} <code>true</code> if dirty flex objects exist
	 */
	FlexObjectState.hasDirtyFlexObjects = function(mPropertyBag) {
		var sReference = ManifestUtils.getFlexReferenceForSelector(mPropertyBag.selector);
		if (ChangePersistenceFactory.getChangePersistenceForComponent(sReference).getDirtyChanges().length > 0) {
			return true;
		}
		return CompVariantState.hasDirtyChanges(sReference);
	};

	/**
	 * Save Flex objects and reload Flex State
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
	 * @param {string} [mPropertyBag.version] - Version to load into Flex State after saving (e.g. undefined when exiting RTA)
	 * @param {string} [mPropertyBag.adaptationId] - Adaptation to load into Flex State after saving (e.g. undefined when exiting RTA)
	 * @returns {Promise<sap.ui.fl.apply._internal.flexObjects.FlexObject[]>} Flex objects, containing changes, compVariants & changes as well as ctrl_variant and changes
	 */
	FlexObjectState.saveFlexObjects = function(mPropertyBag) {
		var oAppComponent = Utils.getAppComponentForSelector(mPropertyBag.selector);
		mPropertyBag.reference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.selector);
		return saveCompEntities(mPropertyBag)
		.then(saveChangePersistenceEntities.bind(this, mPropertyBag, oAppComponent))
		.then(function() {
			if (mPropertyBag.version !== undefined && Versions.hasVersionsModel(mPropertyBag)) {
				var oModel = Versions.getVersionsModel(mPropertyBag);
				mPropertyBag.version = oModel.getProperty("/displayedVersion");
			}
			if (mPropertyBag.layer) {
				// TODO: sync the layer parameter name with new persistence and remove this line
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