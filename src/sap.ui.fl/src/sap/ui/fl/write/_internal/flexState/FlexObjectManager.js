/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantMerger",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/write/_internal/condenser/Condenser",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils"
], function(
	_omit,
	JsControlTreeModifier,
	Reverter,
	CompVariant,
	FlexObjectFactory,
	States,
	DependencyHandler,
	UIChangesState,
	CompVariantMerger,
	VariantManagementState,
	FlexObjectState,
	FlexState,
	ManifestUtils,
	Settings,
	Version,
	Condenser,
	CompVariantState,
	Storage,
	Versions,
	Layer,
	LayerUtils,
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

	function saveChangePersistenceEntities(mPropertyBag, oAppComponent) {
		return FlexObjectManager.flexControllerSaveAll(
			mPropertyBag.reference,
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
	 * @param {boolean} [mPropertyBag.includeManifestChanges] - Flag if manifest changes should be included
	 * @param {boolean} [mPropertyBag.includeAnnotationChanges] - Flag if annotation changes should be included
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

		if (mPropertyBag.includeManifestChanges) {
			aRelevantFlexObjects = aRelevantFlexObjects.concat(
				FlexState.getAppDescriptorChanges(mPropertyBag.reference)
			);
		}

		if (mPropertyBag.includeAnnotationChanges) {
			aRelevantFlexObjects = aRelevantFlexObjects.concat(
				FlexState.getAnnotationChanges(mPropertyBag.reference)
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
	 * TODO: Harmonize with saveFlexObjects and remove this method
	 *
	 * Saves changes sequentially on the associated change persistence instance;
	 * This API must be only used in scenarios without draft (like personalization).
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector to retrieve the associated flex persistence
	 * @param {boolean} [mPropertyBag.skipUpdateCache] - Flag if the cache should be skipped
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} [mPropertyBag.dirtyChanges] - Dirty changes to be saved
	 * @returns {Promise<object>} Resolves with the backend response when all changes have been saved
	 */
	FlexObjectManager.saveFlexObjectsWithoutVersioning = async function(mPropertyBag) {
		// the same fallback is used in the ChangePersistence, but to update the state we need the changes also here
		const oAppComponent = Utils.getAppComponentForSelector(mPropertyBag.selector);
		const sReference = ManifestUtils.getFlexReferenceForSelector(mPropertyBag.selector);
		const aChanges = mPropertyBag.dirtyChanges || FlexObjectState.getDirtyFlexObjects(sReference);

		const oResponse = await FlexObjectManager.changePersistenceSaveDirtyChanges(sReference, oAppComponent, false, aChanges);

		if (oResponse?.response?.length) {
			var aFilenames = oResponse.response.map((oChangeJson) => oChangeJson.fileName);
			aChanges.forEach(function(oDirtyChange) {
				if (aFilenames.includes(oDirtyChange.getId())) {
					oDirtyChange.setState(States.LifecycleState.PERSISTED);
				}
			});
			FlexState.getFlexObjectsDataSelector().checkUpdate({reference: sReference});
		}
		return oResponse;
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
		const aAddedFlexObjects = FlexObjectManager.addDirtyFlexObjects(mPropertyBag.reference, aToBeDeletedFlexObjects);
		if (!aToBeRemovedDirtyFlexObjects.length && !aAddedFlexObjects.length) {
			const oFlexObjectsDataSelector = FlexState.getFlexObjectsDataSelector();
			oFlexObjectsDataSelector.checkUpdate({
				reference: mPropertyBag.reference
			});
		}
	};

	/**
	 * Restores previously deleted flex objects. They can be in state DELETED or NEW (when they were dirty and removed from the FlexState).
	 * Objects are restored to the state they were in before deletion.
	 * If the flex object was not persisted, it is added as a dirty object again.
	 * Deleting a change in the State NEW is done by just removing the change from the map instead of changing the state to DELETED.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} mPropertyBag.flexObjects - Flex objects to be restored
	 */
	FlexObjectManager.restoreDeletedFlexObjects = function(mPropertyBag) {
		const aDeletedFlexObjects = mPropertyBag.flexObjects.filter((oFlexObject) => (
			oFlexObject.getState() === States.LifecycleState.DELETED
			|| oFlexObject.getState() === States.LifecycleState.NEW
		));
		aDeletedFlexObjects.forEach((oFlexObject) => {
			oFlexObject.restorePreviousState();
		});

		const aDirtyFlexObjectsToBeAdded = aDeletedFlexObjects.filter((oFlexObject) => (
			oFlexObject.getState() !== States.LifecycleState.PERSISTED
		));
		FlexObjectManager.addDirtyFlexObjects(mPropertyBag.reference, aDirtyFlexObjectsToBeAdded);
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

	// ------- Old FlexController / ChangePersistence coding -------
	// TODO: refactor and harmonize

	async function revertChangesAndUpdateVariantModel(oAppComponent, sReference, aChanges) {
		if (aChanges.length !== 0) {
			await Reverter.revertMultipleChanges(
				// Always revert changes in reverse order
				[...aChanges].reverse(),
				{
					appComponent: oAppComponent,
					modifier: JsControlTreeModifier,
					reference: sReference
				}
			);
		}
	}

	async function removeOtherLayerChanges(oAppComponent, sLayer, bRemoveOtherLayerChanges, sReference) {
		if (bRemoveOtherLayerChanges && sLayer) {
			var aLayersToReset = Object.values(Layer).filter(function(sLayerToCheck) {
				return sLayerToCheck !== sLayer;
			});
			const aRemovedChanges = FlexObjectManager.removeDirtyFlexObjects({
				reference: sReference,
				layers: aLayersToReset,
				component: oAppComponent
			});
			await revertChangesAndUpdateVariantModel(oAppComponent, sReference, aRemovedChanges);
			return aRemovedChanges;
		}
		return undefined;
	}

	function deleteNotSavedChanges(aChanges, aCondensedChanges, bAlreadyDeletedViaCondense, sReference) {
		aChanges.filter(function(oChange) {
			return !aCondensedChanges.some(function(oCondensedChange) {
				return oChange.getId() === oCondensedChange.getId();
			});
		}).forEach(function(oChange) {
			if (bAlreadyDeletedViaCondense) {
				removeChange(oChange, sReference);
				// Remove also from Cache if the persisted change is still there (e.g. navigate away and back to the app)
				FlexState.updateStorageResponse(sReference, [{flexObject: oChange.convertToFileContent(), type: "delete"}]);
			} else {
				FlexObjectManager.deleteFlexObjects({
					reference: sReference,
					flexObjects: [oChange]
				});
			}
		});
	}

	function checkIfOnlyOne(aChanges, sFunctionName) {
		var aProperties = aChanges.map(function(oChange) {
			return oChange[sFunctionName]();
		});
		var aUniqueProperties = aProperties.filter(function(sValue, iIndex, aProperties) {
			return aProperties.indexOf(sValue) === iIndex;
		});

		return aUniqueProperties.length === 1;
	}

	function canGivenChangesBeCondensed(oAppComponent, aChanges, bCondenseAnyLayer) {
		var bCondenserEnabled = false;

		if (!oAppComponent || !checkIfOnlyOne(aChanges, "getLayer")) {
			return false;
		}

		if (bCondenseAnyLayer) {
			bCondenserEnabled = true;
		} else {
			var sLayer = aChanges[0].getLayer();
			if ([Layer.CUSTOMER, Layer.PUBLIC, Layer.USER].includes(sLayer)) {
				bCondenserEnabled = true;
			}
		}

		var oUriParameters = new URLSearchParams(window.location.search);
		if (oUriParameters.has("sap-ui-xx-condense-changes")) {
			bCondenserEnabled = oUriParameters.get("sap-ui-xx-condense-changes") === "true";
		}

		return bCondenserEnabled;
	}

	function isBackendCondensingEnabled() {
		return Settings.getInstanceOrUndef()?.getIsCondensingEnabled();
	}

	function massUpdateCacheAndDirtyState(aDirtyChanges, bSkipUpdateCache, sReference) {
		aDirtyChanges.forEach(function(oDirtyChange) {
			updateCacheAndDirtyState(oDirtyChange, bSkipUpdateCache, sReference);
		});
		FlexState.getFlexObjectsDataSelector().checkUpdate({reference: sReference});
	}

	function updateCacheAndDeleteUnsavedChanges(aAllChanges, aCondensedChanges, bSkipUpdateCache, bAlreadyDeletedViaCondense, sReference) {
		massUpdateCacheAndDirtyState(aCondensedChanges, bSkipUpdateCache, sReference);
		deleteNotSavedChanges(aAllChanges, aCondensedChanges, bAlreadyDeletedViaCondense, sReference);
	}

	function getAllRelevantChangesForCondensing(aDirtyChanges, aDraftFilenames, bCondenseAnyLayer, sLayer, sReference) {
		if (!aDirtyChanges.length && !bCondenseAnyLayer) {
			return [];
		}

		// Only consider changes that are persisted, on the same layer, part of the current draft (if applicable)
		// and have the same reference (relevant for app variants)
		const aRelevantChanges = FlexState.getFlexObjectsDataSelector().get({reference: sReference})
		.filter(function(oChange) {
			// CompVariants are currently saved separately and should not be part of the condense request
			// TODO: Remove CompVariant special handling todos#5
			if (oChange instanceof CompVariant) {
				return false;
			}
			if (oChange.getFlexObjectMetadata().reference !== sReference) {
				return false;
			}
			if (sLayer === Layer.CUSTOMER && aDraftFilenames) {
				return oChange.getState() === States.LifecycleState.PERSISTED && aDraftFilenames.includes(oChange.getId());
			}
			return oChange.getState() === States.LifecycleState.PERSISTED
				&& LayerUtils.compareAgainstCurrentLayer(oChange.getLayer(), sLayer) === 0;
		});
		return aRelevantChanges.concat(aDirtyChanges);
	}

	function checkLayerAndSingleTransportRequest(aDirtyChanges) {
		if (aDirtyChanges.length) {
			var aRequests = getRequests(aDirtyChanges);
			var bCheckLayer = true;
			if (Settings.getInstanceOrUndef()?.getHasPersoConnector()) {
				// Created public fl-Variant as default variant will created public and user changes
				// no single request can be used, because CF needs PersoConnector and KeyuserConntector
				var aLayers = getLayers(aDirtyChanges);
				bCheckLayer = aLayers.length === 1;
			}
			return aRequests.length === 1 && bCheckLayer;
		}
		return true;
	}

	function executeWriteAndRemoveCalls(sCurrentLayer, sRequest, sParentVersion, bSkipUpdateCache, aAllChanges, aCondensedChanges, sReference) {
		let pRemoveCallsPromise = Promise.resolve();
		const aDeletedChanges = aAllChanges.filter((oChange) => oChange.getState() === States.LifecycleState.DELETED);
		const aNewChanges = aCondensedChanges.filter((oCondensedChange) => (oCondensedChange.getState() !== States.LifecycleState.DELETED));

		// "remove" only supports a single change; multiple calls are required
		if (aDeletedChanges.length) {
			pRemoveCallsPromise = saveSequenceOfDirtyChanges(aDeletedChanges, bSkipUpdateCache, sParentVersion, sReference);
		}

		// "write" supports multiple changes at once
		return pRemoveCallsPromise.then(function() {
			if (aNewChanges.length) {
				return Storage.write({
					layer: sCurrentLayer,
					flexObjects: prepareDirtyChanges(aNewChanges),
					transport: sRequest,
					isLegacyVariant: false,
					parentVersion: sParentVersion
				}).then(function(oResponse) {
					updateCacheAndDeleteUnsavedChanges(aAllChanges, aNewChanges, bSkipUpdateCache, false, sReference);
					return oResponse;
				});
			}
			return deleteNotSavedChanges(aAllChanges, aCondensedChanges, false, sReference);
		});
	}

	function performSingleSaveAction(oDirtyChange, oFirstChange, sParentVersion) {
		switch (oDirtyChange.getState()) {
			case States.LifecycleState.NEW:
				if (sParentVersion !== undefined) {
					sParentVersion = oDirtyChange === oFirstChange ? sParentVersion : Version.Number.Draft;
				}
				return Storage.write({
					layer: oDirtyChange.getLayer(),
					flexObjects: [oDirtyChange.convertToFileContent()],
					transport: oDirtyChange.getRequest(),
					parentVersion: sParentVersion
				});
			case States.LifecycleState.DELETED:
				return Storage.remove({
					flexObject: oDirtyChange.convertToFileContent(),
					layer: oDirtyChange.getLayer(),
					transport: oDirtyChange.getRequest(),
					parentVersion: sParentVersion
				});
			default:
				return Promise.resolve();
		}
	}

	/**
	 * Saves a sequence of dirty changes by calling the appropriate back-end method
	 * (create for new changes, deleteChange for deleted changes);
	 * to ensure the correct order, the methods are called sequentially;
	 * after a change was saved successfully, it is removed from the dirty changes and the cache is updated.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aDirtyChanges - Array of dirty changes to be saved
	 * @param {boolean} [bSkipUpdateCache] If true, then the dirty change shall be saved for the new created app variant, but not for the current app;
	 * therefore, the cache update of the current app is skipped because the dirty change is not saved for the running app.
	 * @param {string} [sParentVersion] - Indicates if changes should be written as a draft and on which version the changes should be based on
	 * @returns {Promise<object>} resolving with the collected storage response after all changes have been saved
	 */
	async function saveSequenceOfDirtyChanges(aDirtyChanges, bSkipUpdateCache, sParentVersion, sReference) {
		var oFirstNewChange;
		if (sParentVersion) {
			// in case of changes saved for a draft only the first writing operation must have the parentVersion targeting the basis
			// followup changes must point the existing draft created with the first request
			var aNewChanges = aDirtyChanges.filter(function(oChange) {
				return oChange.getState() === States.LifecycleState.NEW;
			});
			oFirstNewChange = [].concat(aNewChanges).shift();
		}

		// A successful save operation returns the flexObject in the response
		// The flexObjects are returned to the calling function where they will be set to persisted
		const oCollectedResponse = {
			response: []
		};

		for (const oDirtyChange of aDirtyChanges) {
			const oResponse = await performSingleSaveAction(oDirtyChange, oFirstNewChange, sParentVersion);
			updateCacheAndDirtyState(oDirtyChange, bSkipUpdateCache, sReference);
			if (oResponse?.response) {
				oCollectedResponse.response.push(...oResponse.response);
			}
		}
		FlexState.getFlexObjectsDataSelector().checkUpdate({reference: sReference});
		return oCollectedResponse;
	}

	function removeChange(oChange, sReference) {
		FlexState.removeDirtyFlexObjects(sReference, [oChange]);
		deleteChangeInMap(oChange, sReference);
	}

	function deleteChangeInMap(oChange, sReference) {
		var sChangeKey = oChange.getId();
		DependencyHandler.removeChangeFromMap(FlexObjectState.getLiveDependencyMap(sReference), sChangeKey);
		DependencyHandler.removeChangeFromDependencies(FlexObjectState.getLiveDependencyMap(sReference), sChangeKey);
	}

	function getRequests(aDirtyChanges) {
		var aRequests = [];

		aDirtyChanges.forEach(function(oChange) {
			var sRequest = oChange.getRequest();
			if (aRequests.indexOf(sRequest) === -1) {
				aRequests.push(sRequest);
			}
		});

		return aRequests;
	}

	function getLayers(aDirtyChanges) {
		var aLayers = [];

		aDirtyChanges.forEach(function(oChange) {
			var sLayer = oChange.getLayer();
			if (aLayers.indexOf(sLayer) === -1) {
				aLayers.push(sLayer);
			}
		});

		return aLayers;
	}

	function prepareDirtyChanges(aDirtyChanges) {
		var aChanges = [];

		aDirtyChanges.forEach(function(oChange) {
			aChanges.push(oChange.convertToFileContent());
		});

		return aChanges;
	}

	/**
	 * Updates the cache with the dirty change passed and removes it from the array of dirty changes if present.
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oDirtyChange Dirty change which was saved
	 * @param {boolean} [bSkipUpdateCache] If true, then the dirty change shall be saved for the new created app variant, but not for the current app
	 * therefore, the cache update of the current app is skipped
	 */
	function updateCacheAndDirtyState(oDirtyChange, bSkipUpdateCache, sReference) {
		if (!bSkipUpdateCache) {
			switch (oDirtyChange.getState()) {
				case States.LifecycleState.NEW:
					FlexState.updateStorageResponse(sReference, [{
						type: "add",
						flexObject: oDirtyChange.convertToFileContent()
					}]);
					break;
				case States.LifecycleState.DELETED:
					FlexState.updateStorageResponse(sReference, [{
						type: "delete",
						flexObject: oDirtyChange.convertToFileContent()
					}]);
					break;
				case States.LifecycleState.UPDATED:
					FlexState.updateStorageResponse(sReference, [{
						type: "update",
						flexObject: oDirtyChange.convertToFileContent()
					}]);
					break;
				default:
			}
			oDirtyChange.setState(States.LifecycleState.PERSISTED);
		}
	}

	/**
	 * Saves all changes of a persistence instance.
	 *
	 * @param {sap.ui.core.UIComponent} [oAppComponent] - AppComponent instance
	 * @param {boolean} [bSkipUpdateCache=false] - Indicates the cache should not be updated
	 * @param {boolean} [bDraft=false] - Indicates if changes should be written as a draft
	 * @param {string} [sLayer] - Layer for which the changes should be saved
	 * @param {boolean} [bRemoveOtherLayerChanges=false] - Whether to remove changes on other layers before saving
	 * @param {boolean} [bCondenseAnyLayer] - This will enable condensing regardless of the current layer
	 * @returns {Promise} resolving with an array of responses or rejecting with the first error
	 * @public
	 */
	FlexObjectManager.flexControllerSaveAll = async function(
		sReference,
		oAppComponent,
		bSkipUpdateCache,
		bDraft,
		sLayer,
		bRemoveOtherLayerChanges,
		bCondenseAnyLayer
	) {
		var sParentVersion;
		var aDraftFilenames;
		if (bDraft) {
			var oVersionModel = Versions.getVersionsModel({
				reference: sReference,
				layer: Layer.CUSTOMER // only the customer layer has draft active
			});
			sParentVersion = oVersionModel.getProperty("/persistedVersion");
			aDraftFilenames = oVersionModel.getProperty("/draftFilenames");
		}
		await removeOtherLayerChanges(oAppComponent, sLayer, bRemoveOtherLayerChanges, sReference);
		const oResult = await FlexObjectManager.changePersistenceSaveDirtyChanges(
			sReference,
			oAppComponent,
			bSkipUpdateCache,
			undefined,
			sParentVersion,
			aDraftFilenames,
			bCondenseAnyLayer,
			sLayer
		);
		if (bDraft) {
			var mPropertyBag = {
				reference: sReference,
				layer: Layer.CUSTOMER // only the customer layer has draft active
			};
			// TODO: array as response is bad practice, should be changed to an object
			if (oResult?.response && oResult.response.length > 0) {
				var aDraftFilenames = [];
				if (Array.isArray(oResult.response)) {
					oResult.response.forEach(function(change) {
						aDraftFilenames.push(change.fileName);
					});
				}
				mPropertyBag.draftFilenames = aDraftFilenames;
				Versions.onAllChangesSaved(mPropertyBag);
			} else {
				// need to update version model when condensing send post request with a delete change and afterwards call flex/data request with right version parameter
				return Versions.updateModelFromBackend(mPropertyBag);
			}
		}
		return oResult;
	};

	/**
	 * Saves the passed or all dirty changes by calling the appropriate back-end method
	 * (create for new changes, deleteChange for deleted changes);
	 * to ensure the correct order, the methods are called sequentially;
	 * after a change was saved successfully, it is removed from the dirty changes and the cache is updated.
	 * If all changes are new they are condensed before they are passed to the Storage. For this the App Component is necessary.
	 * Condensing is enabled by default for CUSTOMER and USER layers,
	 * but can be overruled with the URL Parameter 'sap-ui-xx-condense-changes'
	 *
	 * @param {string} sReference - Flex reference of the application
	 * @param {sap.ui.core.UIComponent} [oAppComponent] - AppComponent instance
	 * @param {boolean} [bSkipUpdateCache] - If true, then the dirty change shall be saved for the new created app variant, but not for the current app;
	 * therefore, the cache update of the current app is skipped because the dirty change is not saved for the running app.
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} [aChanges] - If passed only those changes are saved
	 * @param {string} sParentVersion - Parent version
	 * @param {string[]} [aDraftFilenames] - Filenames from persisted changes draft version
	 * @param {boolean} [bCondenseAnyLayer] - This will enable condensing regardless of the current layer
	 * @param {string} [sLayer] - Layer for which the changes should be saved
	 * @returns {Promise<object>} Resolving with the storage response after all changes have been saved
	 */
	FlexObjectManager.changePersistenceSaveDirtyChanges = function(
		sReference,
		oAppComponent,
		bSkipUpdateCache,
		aChanges,
		sParentVersion,
		aDraftFilenames,
		bCondenseAnyLayer,
		sLayer
	) {
		const aDirtyChanges = aChanges || FlexObjectState.getDirtyFlexObjects(sReference);
		const sCurrentLayer = aDirtyChanges.length && aDirtyChanges[0].getLayer() || sLayer;
		const aRelevantChangesForCondensing = getAllRelevantChangesForCondensing(
			aDirtyChanges,
			aDraftFilenames,
			bCondenseAnyLayer,
			sCurrentLayer,
			sReference
		);
		const bIsCondensingEnabled = (
			isBackendCondensingEnabled()
			&& canGivenChangesBeCondensed(oAppComponent, aRelevantChangesForCondensing, bCondenseAnyLayer)
		);
		const aAllFlexObjects = bIsCondensingEnabled ? aRelevantChangesForCondensing : aDirtyChanges;
		const aChangesClone = aAllFlexObjects.slice(0);
		const aRequests = getRequests(aDirtyChanges);

		// Condensing is only allowed if all dirty changes belong to the same Transport Request
		if (checkLayerAndSingleTransportRequest(aDirtyChanges)) {
			const oCondensedChangesPromise = canGivenChangesBeCondensed(oAppComponent, aChangesClone, bCondenseAnyLayer)
				? Condenser.condense(oAppComponent, aChangesClone)
				: Promise.resolve(aChangesClone);
			return oCondensedChangesPromise.then(function(aCondensedChanges) {
				const sRequest = aRequests[0];
				if (bIsCondensingEnabled) {
					return Storage.condense({
						allChanges: aAllFlexObjects,
						condensedChanges: aCondensedChanges,
						layer: sCurrentLayer,
						transport: sRequest,
						isLegacyVariant: false,
						parentVersion: sParentVersion
					}).then(function(oResponse) {
						updateCacheAndDeleteUnsavedChanges(aAllFlexObjects, aCondensedChanges, bSkipUpdateCache, true, sReference);
						return oResponse;
					});
				}
				return executeWriteAndRemoveCalls(
					sCurrentLayer,
					sRequest,
					sParentVersion,
					bSkipUpdateCache,
					aAllFlexObjects,
					aCondensedChanges,
					sReference
				);
			});
		}
		return saveSequenceOfDirtyChanges(aDirtyChanges, bSkipUpdateCache, sParentVersion, sReference);
	};

	return FlexObjectManager;
});