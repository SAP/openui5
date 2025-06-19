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
			Object.keys(oDataToRestore).forEach((sPersistencyKey) => {
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

	function removeFlexObjectFromDependencyHandler(sReference, oFlexObject) {
		if (oFlexObject.isValidForDependencyMap()) {
			DependencyHandler.removeChangeFromMap(FlexObjectState.getLiveDependencyMap(sReference), oFlexObject.getId());
			DependencyHandler.removeChangeFromDependencies(FlexObjectState.getLiveDependencyMap(sReference), oFlexObject.getId());
		}
	}

	function getOrCreateFlexObject(vFlexObject) {
		return (
			typeof vFlexObject.isA === "function"
			&& vFlexObject.isA("sap.ui.fl.apply._internal.flexObjects.FlexObject")
		)
			? vFlexObject
			: FlexObjectFactory.createFromFileContent(vFlexObject);
	}

	async function removeOtherLayerChanges(oAppComponent, sLayer, sReference) {
		const aLayersToReset = Object.values(Layer).filter((sLayerToCheck) => sLayerToCheck !== sLayer);
		const aRemovedChanges = FlexObjectManager.removeDirtyFlexObjects({
			reference: sReference,
			layers: aLayersToReset,
			component: oAppComponent
		});
		if (aRemovedChanges.length) {
			await Reverter.revertMultipleChanges(
				// Always revert changes in reverse order
				[...aRemovedChanges].reverse(),
				{
					appComponent: oAppComponent,
					modifier: JsControlTreeModifier,
					reference: sReference
				}
			);
		}
	}

	function checkIfOnlyOne(aChanges, sFunctionName) {
		return aChanges
		.map((oChange) => oChange[sFunctionName]())
		.filter((vValue, iIndex, aArray) => aArray.indexOf(vValue) === iIndex).length === 1;
	}

	function canGivenChangesBeCondensed(oAppComponent, aChanges, bCondenseAnyLayer) {
		if (!oAppComponent || !checkIfOnlyOne(aChanges, "getLayer")) {
			return false;
		}

		const oUriParameters = new URLSearchParams(window.location.search);
		if (oUriParameters.has("sap-ui-xx-condense-changes")) {
			return oUriParameters.get("sap-ui-xx-condense-changes") === "true";
		}

		return bCondenseAnyLayer || [Layer.CUSTOMER, Layer.PUBLIC, Layer.USER].includes(aChanges[0].getLayer());
	}

	function updateCacheAndDeleteUnsavedChanges(aAllChanges, aCondensedChanges, bSkipUpdateCache, bAlreadyDeletedViaCondense, sReference) {
		aCondensedChanges.forEach((oDirtyChange) => {
			updateCacheAndDirtyState(oDirtyChange, bSkipUpdateCache, sReference);
		});
		FlexState.getFlexObjectsDataSelector().checkUpdate({reference: sReference});

		aAllChanges.filter((oChange) => {
			return !aCondensedChanges.some((oCondensedChange) => oChange.getId() === oCondensedChange.getId());
		}).forEach((oChange) => {
			if (bAlreadyDeletedViaCondense) {
				FlexState.removeDirtyFlexObjects(sReference, [oChange]);
				removeFlexObjectFromDependencyHandler(sReference, oChange);

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

	function getAllRelevantChangesForCondensing(aDirtyChanges, aDraftFilenames, bCondenseAnyLayer, sLayer, sReference) {
		if (!aDirtyChanges.length && !bCondenseAnyLayer) {
			return [];
		}

		// Only consider changes that are persisted, on the same layer, part of the current draft (if applicable)
		// and have the same reference (relevant for app variants)
		const aRelevantChanges = FlexState.getFlexObjectsDataSelector().get({reference: sReference})
		.filter((oChange) => {
			// CompVariants are currently saved separately and should not be part of the condense request
			// TODO: Remove CompVariant special handling todos#5
			if (oChange instanceof CompVariant) {
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

	async function saveSequenceOfDirtyChanges(aDirtyChanges, bSkipUpdateCache, sParentVersion, sReference) {
		let oFirstNewChange;
		if (sParentVersion) {
			// in case of changes saved for a draft only the first writing operation must have the parentVersion targeting the basis
			// followup changes must point the existing draft created with the first request
			[oFirstNewChange] = aDirtyChanges.filter((oChange) => oChange.getState() === States.LifecycleState.NEW);
		}

		const oCollectedResponse = {
			response: []
		};

		for (const oDirtyChange of aDirtyChanges) {
			const oPropertyBag = {
				layer: oDirtyChange.getLayer(),
				transport: oDirtyChange.getRequest(),
				parentVersion: sParentVersion
			};
			let oStorageResponse;
			if (oDirtyChange.getState() === States.LifecycleState.NEW) {
				if (oPropertyBag.parentVersion !== undefined) {
					oPropertyBag.parentVersion = oDirtyChange === oFirstNewChange ? oPropertyBag.parentVersion : Version.Number.Draft;
				}
				oPropertyBag.flexObjects = [oDirtyChange.convertToFileContent()];
				oStorageResponse = await Storage.write(oPropertyBag);
			} else if (oDirtyChange.getState() === States.LifecycleState.DELETED) {
				oPropertyBag.flexObject = oDirtyChange.convertToFileContent();
				oStorageResponse = await Storage.remove(oPropertyBag);
			}
			updateCacheAndDirtyState(oDirtyChange, bSkipUpdateCache, sReference);

			if (oStorageResponse?.response) {
				oCollectedResponse.response.push(...oStorageResponse.response);
			}
		}
		FlexState.getFlexObjectsDataSelector().checkUpdate({reference: sReference});
		return oCollectedResponse;
	}

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
	 * Saves the passed or all dirty changes by calling the appropriate back-end method
	 * (create for new changes, deleteChange for deleted changes);
	 * to ensure the correct order, the methods are called sequentially;
	 * after a change was saved successfully, it is removed from the dirty changes and the cache is updated.
	 * If all changes are new they are condensed before they are passed to the Storage. For this the App Component is necessary.
	 * Condensing is enabled by default for CUSTOMER and USER layers,
	 * but can be overruled with the URL Parameter 'sap-ui-xx-condense-changes'
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} mPropertyBag.dirtyFlexObjects - If passed only those changes are saved
	 * @param {string} mPropertyBag.layer - Layer for which the changes should be saved
	 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent - AppComponent instance
	 * @param {boolean} [mPropertyBag.skipUpdateCache] - If true, the cache update of the current app is skipped
	 * @param {string} mPropertyBag.parentVersion - Parent version
	 * @param {string[]} [mPropertyBag.draftFilenames] - Filenames from persisted changes draft version
	 * @param {boolean} [mPropertyBag.condenseAnyLayer] - This will enable condensing regardless of the current layer
	 * @returns {Promise<object>} Resolving with the storage response after all changes have been saved
	 */
	async function triggerSaveRequest(mPropertyBag) {
		const aRelevantChangesForCondensing = getAllRelevantChangesForCondensing(
			mPropertyBag.dirtyFlexObjects,
			mPropertyBag.draftFilenames,
			mPropertyBag.condenseAnyLayer,
			mPropertyBag.layer,
			mPropertyBag.reference
		);
		const bIsCondensingEnabled = (
			Settings.getInstanceOrUndef()?.getIsCondensingEnabled()
			&& canGivenChangesBeCondensed(mPropertyBag.appComponent, aRelevantChangesForCondensing, mPropertyBag.condenseAnyLayer)
		);
		const aAllFlexObjects = bIsCondensingEnabled ? aRelevantChangesForCondensing : mPropertyBag.dirtyFlexObjects;
		const aChangesClone = aAllFlexObjects.slice(0);

		// if there are multiple backends or transport requests, all changes must be saved separately
		if (
			checkIfOnlyOne(mPropertyBag.dirtyFlexObjects, "getRequest")
			&& (Settings.getInstanceOrUndef()?.getHasPersoConnector() ? checkIfOnlyOne(mPropertyBag.dirtyFlexObjects, "getLayer") : true)
		) {
			const aCondensedChanges = canGivenChangesBeCondensed(mPropertyBag.appComponent, aChangesClone, mPropertyBag.condenseAnyLayer) ?
				await Condenser.condense(mPropertyBag.appComponent, aChangesClone) : aChangesClone;

			let oResponse;
			const sRequest = aChangesClone[0].getRequest();
			if (bIsCondensingEnabled) {
				oResponse = await Storage.condense({
					allChanges: aAllFlexObjects,
					condensedChanges: aCondensedChanges,
					layer: mPropertyBag.layer,
					transport: sRequest,
					isLegacyVariant: false,
					parentVersion: mPropertyBag.parentVersion
				});
			} else {
				const aDeletedChanges = aAllFlexObjects.filter((oChange) => oChange.getState() === States.LifecycleState.DELETED);
				const aNewChanges = aCondensedChanges.filter((oChange) => (oChange.getState() !== States.LifecycleState.DELETED));

				// "remove" only supports a single change; multiple calls are required
				if (aDeletedChanges.length) {
					await saveSequenceOfDirtyChanges(
						aDeletedChanges, mPropertyBag.skipUpdateCache, mPropertyBag.parentVersion, mPropertyBag.reference
					);
				}

				// "write" supports multiple changes at once
				if (aNewChanges.length) {
					oResponse = await Storage.write({
						layer: mPropertyBag.layer,
						flexObjects: aNewChanges.map((oChange) => oChange.convertToFileContent()),
						transport: sRequest,
						isLegacyVariant: false,
						parentVersion: mPropertyBag.parentVersion
					});
				}
			}
			updateCacheAndDeleteUnsavedChanges(
				aAllFlexObjects,
				aCondensedChanges,
				mPropertyBag.skipUpdateCache,
				bIsCondensingEnabled,
				mPropertyBag.reference
			);
			return oResponse || { response: [] };
		}
		return saveSequenceOfDirtyChanges(
			mPropertyBag.dirtyFlexObjects,
			mPropertyBag.skipUpdateCache,
			mPropertyBag.parentVersion,
			mPropertyBag.reference
		);
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
	 * @param {string} [mPropertyBag.adaptationId] - Adaptation to load into Flex State after saving (e.g. undefined when exiting RTA)
	 * @param {boolean} [mPropertyBag.version] - The version for which the objects are retrieved if the Cache should be invalidated
	 * @returns {Promise<sap.ui.fl.apply._internal.flexObjects.FlexObject[]>} Flex objects, containing changes, compVariants & changes as well as ctrl_variant and changes
	 */
	FlexObjectManager.getFlexObjects = async function(mPropertyBag) {
		mPropertyBag.reference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.selector);
		if (mPropertyBag.invalidateCache) {
			const oAppComponent = Utils.getAppComponentForSelector(mPropertyBag.selector);
			mPropertyBag.componentId = oAppComponent.getId();
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
		const sReference = ManifestUtils.getFlexReferenceForSelector(mPropertyBag.selector);
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
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} [mPropertyBag.flexObjects] - Dirty flex objects to be saved
	 * @param {boolean} [mPropertyBag.skipUpdateCache] - Indicates if cache update should be skipped
	 * @param {string} [mPropertyBag.layer] - Specifies a single layer for saving changes
	 * @param {boolean} [mPropertyBag.includeCtrlVariants] - Indicates that control variants are to be included
	 * @param {boolean} [mPropertyBag.removeOtherLayerChanges=false] - Whether to remove changes on other layers before saving
	 * @param {boolean} [mPropertyBag.condenseAnyLayer] - Can be passed to overrule the layer restriction for condensing changes.
	 * @returns {Promise<sap.ui.fl.apply._internal.flexObjects.FlexObject[]>} Resolves with the storage response containing the saved flex objects
	 */
	FlexObjectManager.saveFlexObjects = async function(mPropertyBag) {
		const oAppComponent = Utils.getAppComponentForSelector(mPropertyBag.selector);
		const sReference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.selector);
		await CompVariantState.persistAll(sReference);

		const bConsiderDraftHandling = mPropertyBag.layer === Layer.CUSTOMER;
		const oVersionModel = bConsiderDraftHandling && Versions.getVersionsModel({
			reference: sReference,
			layer: mPropertyBag.layer
		});
		if (mPropertyBag.removeOtherLayerChanges && mPropertyBag.layer) {
			await removeOtherLayerChanges(oAppComponent, mPropertyBag.layer, sReference);
		}

		const aFlexObjectsToBeSaved = mPropertyBag.flexObjects || FlexObjectState.getDirtyFlexObjects(sReference);
		if (!aFlexObjectsToBeSaved.length) {
			return { response: [] };
		}

		const oResult = await triggerSaveRequest({
			reference: sReference,
			layer: mPropertyBag.layer || aFlexObjectsToBeSaved[0].getLayer(),
			dirtyFlexObjects: aFlexObjectsToBeSaved,
			skipUpdateCache: mPropertyBag.skipUpdateCache,
			condenseAnyLayer: mPropertyBag.condenseAnyLayer,
			appComponent: oAppComponent,
			parentVersion: oVersionModel ? oVersionModel.getProperty("/persistedVersion") : undefined,
			draftFilenames: oVersionModel ? oVersionModel.getProperty("/draftFilenames") : undefined
		});

		if (bConsiderDraftHandling) {
			Versions.updateAfterSave({
				reference: sReference,
				layer: mPropertyBag.layer,
				backendResponse: oResult
			});
		}
		return oResult;
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
		mPropertyBag.flexObjects.forEach((oFlexObject) => {
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
				oResponse.response.forEach((oChangeContent) => {
					aFileNames.push(oChangeContent.fileName);
				});
			}
			const aChangesToRevert = aFlexObjects.filter((oChange) => {
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