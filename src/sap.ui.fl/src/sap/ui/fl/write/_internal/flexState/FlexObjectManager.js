/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantMerger",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/requireAsync",
	"sap/ui/fl/Utils"
], function(
	_omit,
	JsControlTreeModifier,
	Reverter,
	FlexObjectFactory,
	States,
	DependencyHandler,
	UIChangesState,
	CompVariantMerger,
	VariantManagementState,
	FlexObjectState,
	FlexState,
	ManifestUtils,
	CompVariantState,
	Storage,
	Versions,
	LayerUtils,
	requireAsync,
	Utils
) {
	"use strict";

	/**
	 * Central class for operations on the flex states and flex objects.
	 *
	 * @namespace
	 * @alias sap.ui.fl.write._internal.flexState.FlexObjectManager
	 * @since 1.83
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	const FlexObjectManager = {};

	function getCompVariantEntities(mPropertyBag) {
		const aEntities = [];
		const mCompEntities = FlexState.getCompVariantsMap(mPropertyBag.reference);
		for (const sPersistencyKey in mCompEntities) {
			const mCompVariantsOfPersistencyKey = mCompEntities[sPersistencyKey];
			for (const sId in mCompVariantsOfPersistencyKey.byId) {
				aEntities.push(mCompVariantsOfPersistencyKey.byId[sId]);
			}
		}
		return LayerUtils.filterChangeOrChangeDefinitionsByCurrentLayer(aEntities, mPropertyBag.currentLayer);
	}

	// Enhance CompVariantsMap with external data and standard variant after FlexState was cleared and reinitialized
	function updateCompEntities(mPropertyBag) {
		const mCompEntities = FlexState.getCompVariantsMap(mPropertyBag.reference);
		const oDataToRestore = FlexState.getInitialNonFlCompVariantData(mPropertyBag.reference);
		if (oDataToRestore) {
			Object.keys(oDataToRestore).forEach(function(sPersistencyKey) {
				mCompEntities._initialize(
					sPersistencyKey,
					oDataToRestore[sPersistencyKey].variants,
					oDataToRestore[sPersistencyKey].controlId
				);
				CompVariantMerger.merge(
					sPersistencyKey,
					mCompEntities[sPersistencyKey],
					oDataToRestore[sPersistencyKey].standardVariant
				);
			});
		}
	}

	function saveCompEntities(mPropertyBag) {
		var sReference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.selector);
		return CompVariantState.persistAll(sReference);
	}

	function removeFlexObjectFromDependencyHandler(sReference, oFlexObject) {
		if (oFlexObject.isValidForDependencyMap()) {
			DependencyHandler.removeChangeFromMap(FlexObjectState.getLiveDependencyMap(sReference), oFlexObject.getId());
			DependencyHandler.removeChangeFromDependencies(FlexObjectState.getLiveDependencyMap(sReference), oFlexObject.getId());
		}
	}

	async function saveChangePersistenceEntities(mPropertyBag, oAppComponent) {
		const FlexControllerFactory = await requireAsync("sap/ui/fl/FlexControllerFactory");
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

	function getOrCreateFlexObject(vFlexObject) {
		return (
			typeof vFlexObject.isA === "function"
			&& vFlexObject.isA("sap.ui.fl.apply._internal.flexObjects.FlexObject")
		)
			? vFlexObject
			: FlexObjectFactory.createFromFileContent(vFlexObject);
	}

	/**
	 * Takes an array of FlexObjects and filters out any hidden variant and changes on those hidden variants
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aFlexObjects - FlexObjects to be filtered
	 * @param {string} sReference - Flex reference of the application
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Filtered list of FlexObjects
	 */
	FlexObjectManager.filterHiddenFlexObjects = function(aFlexObjects, sReference) {
		const aFilteredFlexObjects = VariantManagementState.filterHiddenFlexObjects(aFlexObjects, sReference);
		return CompVariantState.filterHiddenFlexObjects(aFilteredFlexObjects, sReference);
	};

	/**
	 * Collects changes from the different states within the <code>sap.ui.fl</code> library.
	 * This includes the flexState entities as well as the <code>sap.ui.fl.ChangePersistence</code>.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Retrieves the associated flex persistence
	 * @param {string} [mPropertyBag.currentLayer] - Specifies a single layer to filtering changes (without filtering ctrl variant changes)
	 * @param {boolean} [mPropertyBag.invalidateCache] - Flag if the cache should be invalidated
	 * @param {boolean} [mPropertyBag.includeCtrlVariants] - Flag if all control variant changes should be included - otherwise only initially applied UIChanges are included
	 * @param {boolean} [mPropertyBag.onlyCurrentVariants] - Flag if only current variants should be included. Is only considered if includeCtrlVariants is true
	 * @param {boolean} [mPropertyBag.version] - The version for which the objects are retrieved if the Cache should be invalidated
	 * @returns {Promise<sap.ui.fl.apply._internal.flexObjects.FlexObject[]>} Flex objects, containing changes, compVariants & changes as well as ctrl_variant and changes
	 */
	FlexObjectManager.getFlexObjects = async function(mPropertyBag) {
		mPropertyBag.reference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.selector);
		if (mPropertyBag.invalidateCache) {
			await FlexState.update(mPropertyBag);
			updateCompEntities(mPropertyBag);
		}

		let aRelevantFlexObjects = UIChangesState.getVariantIndependentUIChanges(mPropertyBag.reference);

		// getInitialUIChanges will only add variant related UIChanges from the initial variants,
		// with includeCtrlVariants set all variant related flex objects are added
		// onlyCurrentVariants is only valid in combination with includeCtrlVariants,
		// will add all variants, all variant management changes, and all UIChanges of all initial variants
		if (!mPropertyBag.includeCtrlVariants) {
			aRelevantFlexObjects = aRelevantFlexObjects.concat(
				VariantManagementState.getInitialUIChanges({reference: mPropertyBag.reference, includeDirtyChanges: true})
			);
		} else if (!mPropertyBag.onlyCurrentVariants) {
			aRelevantFlexObjects = aRelevantFlexObjects.concat(
				VariantManagementState.getVariantDependentFlexObjects(mPropertyBag.reference)
			);
		} else {
			aRelevantFlexObjects = aRelevantFlexObjects.concat(
				VariantManagementState.getAllCurrentFlexObjects({reference: mPropertyBag.reference})
			);
		}

		if (mPropertyBag.currentLayer) {
			aRelevantFlexObjects = aRelevantFlexObjects.filter((oFlexObject) => {
				return oFlexObject.getLayer() === mPropertyBag.currentLayer;
			});
		}

		return aRelevantFlexObjects.concat(getCompVariantEntities(mPropertyBag));
	};

	/**
	 * Checks if dirty flex objects exist for the flex persistence associated with the selector control;
	 * Includes dirty changes on the descriptor as well as dirty changes on SmartVariantManagement of the application.
	 *
	 * @param {object} mPropertyBag Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector To retrieve the associated flex persistence
	 * @returns {boolean} <code>true</code> if dirty flex objects exist
	 */
	FlexObjectManager.hasDirtyFlexObjects = function(mPropertyBag) {
		var sReference = ManifestUtils.getFlexReferenceForSelector(mPropertyBag.selector);
		return FlexObjectState.getDirtyFlexObjects(sReference).length > 0 || CompVariantState.hasDirtyChanges(sReference);
	};

	/**
	 * Adds new dirty flex objects.
	 *
	 * @param {string} sReference - Flex reference of the application
	 * @param {object[]} aFlexObjects - JSON object representation of flex objects or flex object instances
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} The prepared flex objects
	 * @public
	 */
	FlexObjectManager.addDirtyFlexObjects = function(sReference, aFlexObjects) {
		return FlexState.addDirtyFlexObjects(sReference, aFlexObjects.map(getOrCreateFlexObject));
	};

	/**
	 * Removes unsaved flex objects.
	 *
	 * @param {object} mPropertyBag - Properties to determine the flex objects to be removed
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {string|string[]} [mPropertyBag.layers] - Layer or multiple layers for which flex objects shall be deleted. If omitted, flex objects on all layers are considered.
	 * @param {sap.ui.core.Component} [mPropertyBag.component] - Component instance, required if oControl is specified
	 * @param {string} [mPropertyBag.control] - Control for which the flex objects should be deleted. If omitted, all flex objects for the reference are considered.
	 * @param {string} [mPropertyBag.generator] - Generator of flex objects
	 * @param {string[]} [mPropertyBag.changeTypes] - Types of flex objects
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} The flex objects that were removed
	 */
	FlexObjectManager.removeDirtyFlexObjects = function(mPropertyBag) {
		const aLayers = [].concat(mPropertyBag.layers || []);
		const aDirtyFlexObjects = FlexObjectState.getDirtyFlexObjects(mPropertyBag.reference);

		const aFlexObjectsToBeRemoved = aDirtyFlexObjects.filter((oFlexObject) => {
			let bChangeValid = true;

			if (aLayers.length && !aLayers.includes(oFlexObject.getLayer())) {
				return false;
			}
			if (mPropertyBag.generator && oFlexObject.getSupportInformation().generator !== mPropertyBag.generator) {
				return false;
			}
			if (mPropertyBag.control) {
				const sSelectorId = JsControlTreeModifier.getControlIdBySelector(oFlexObject.getSelector(), mPropertyBag.component);
				bChangeValid = mPropertyBag.control.getId() === sSelectorId;
			}
			if (mPropertyBag.changeTypes) {
				bChangeValid &&= mPropertyBag.changeTypes.includes(oFlexObject.getChangeType());
			}

			return bChangeValid;
		});

		return FlexState.removeDirtyFlexObjects(mPropertyBag.reference, aFlexObjectsToBeRemoved);
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
	FlexObjectManager.saveFlexObjects = async function(mPropertyBag) {
		var oAppComponent = Utils.getAppComponentForSelector(mPropertyBag.selector);
		mPropertyBag.reference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.selector);
		await saveCompEntities(mPropertyBag);
		await saveChangePersistenceEntities(mPropertyBag, oAppComponent);

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
		return FlexObjectManager.getFlexObjects(_omit(mPropertyBag, "skipUpdateCache"));
	};

	/**
	 * Removes the provided flex objects from the FlexState and dependency handler and sets them to be deleted.
	 * If a flex object is dirty it will only be removed from the FlexState.
	 * Otherwise the next call to save dirty flex objects will remove them from the persistence.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} mPropertyBag.flexObjects - Flex objects to be deleted
	 */
	FlexObjectManager.deleteFlexObjects = function(mPropertyBag) {
		const aDirtyFlexObjects = FlexObjectState.getDirtyFlexObjects(mPropertyBag.reference);

		const aToBeDeletedFlexObjects = [];
		const aToBeRemovedDirtyFlexObjects = [];
		mPropertyBag.flexObjects.forEach(function(oFlexObject) {
			if (aDirtyFlexObjects.indexOf(oFlexObject) > -1 && oFlexObject.getState() === States.LifecycleState.NEW) {
				aToBeRemovedDirtyFlexObjects.push(oFlexObject);
			} else {
				oFlexObject.markForDeletion();
				aToBeDeletedFlexObjects.push(oFlexObject);
			}
			removeFlexObjectFromDependencyHandler(mPropertyBag.reference, oFlexObject);
		});
		FlexState.removeDirtyFlexObjects(mPropertyBag.reference, aToBeRemovedDirtyFlexObjects);
		FlexObjectManager.addDirtyFlexObjects(mPropertyBag.reference, aToBeDeletedFlexObjects);
	};

	/**
	 * Reset flex objects on the server.
	 * If the reset is performed for an entire component, a browser reload is required.
	 * If the reset is performed for a control or change type, this function also triggers a reversion of deleted UI changes.
	 * The to be deleted flexObjects can be filtered by selectorIds, changeTypes or generator.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.layer - Layer for which changes shall be deleted
	 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent - Component instance
	 * @param {string} [mPropertyBag.generator] - Generator of changes
	 * @param {string[]} [mPropertyBag.selectorIds] - Selector IDs in local format
	 * @param {string[]} [mPropertyBag.changeTypes] - Types of changes
	 *
	 * @returns {Promise<undefined>} Resolves after the deletion took place
	 */
	FlexObjectManager.resetFlexObjects = async function(mPropertyBag) {
		const sReference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.appComponent);
		const aFlexObjects = await FlexObjectManager.getFlexObjects({
			selector: mPropertyBag.appComponent,
			currentLayer: mPropertyBag.layer,
			includeCtrlVariants: true
		});
		const mParams = {
			reference: sReference,
			layer: mPropertyBag.layer,
			changes: aFlexObjects
		};
		if (mPropertyBag.generator) {
			mParams.generator = mPropertyBag.generator;
		}
		if (mPropertyBag.selectorIds) {
			mParams.selectorIds = mPropertyBag.selectorIds;
		}
		if (mPropertyBag.changeTypes) {
			mParams.changeTypes = mPropertyBag.changeTypes;
		}
		const oResponse = await Storage.reset(mParams);

		if (mPropertyBag.selectorIds || mPropertyBag.changeTypes || mPropertyBag.generator) {
			const aFileNames = [];
			if (oResponse?.response?.length > 0) {
				oResponse.response.forEach(function(oChangeContent) {
					aFileNames.push(oChangeContent.fileName);
				});
			}
			const aChangesToRevert = aFlexObjects.filter(function(oChange) {
				return aFileNames.indexOf(oChange.getId()) !== -1;
			});
			FlexState.updateStorageResponse(sReference, aChangesToRevert.map((oFlexObject) => {
				return { flexObject: oFlexObject.convertToFileContent(), type: "delete" };
			}));

			if (aChangesToRevert.length) {
				await Reverter.revertMultipleChanges(
					// Always revert changes in reverse order
					[...aChangesToRevert].reverse(),
					{
						appComponent: mPropertyBag.appComponent,
						modifier: JsControlTreeModifier,
						reference: sReference
					}
				);
			}
		}
	};

	return FlexObjectManager;
});