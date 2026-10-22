/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexObjects/VariantChange",
	"sap/ui/fl/apply/_internal/flexObjects/VariantManagementChange",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/write/_internal/condenser/Condenser",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils"
], function(
	_omit,
	JsControlTreeModifier,
	Reverter,
	FlexObjectFactory,
	States,
	VariantChange,
	VariantManagementChange,
	DependencyHandler,
	UIChangesState,
	CompVariantManagementState,
	VariantManagementState,
	FlexObjectState,
	FlexState,
	ManifestUtils,
	Settings,
	StorageUtils,
	Version,
	Condenser,
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

	function checkIfNotMoreThanOne(aChanges, sFunctionName) {
		return aChanges.length === 0 || aChanges
		.map((oChange) => oChange[sFunctionName]())
		.filter((vValue, iIndex, aArray) => aArray.indexOf(vValue) === iIndex).length === 1;
	}

	async function checkIfOneConnectorForAllLayers(mFlexObjectsPerLayer) {
		const aUniqueLayers = Object.keys(mFlexObjectsPerLayer);
		if (aUniqueLayers.length <= 1) {
			return true;
		}
		const oFirstConnector = await StorageUtils.getWriteConnectorConfigByLayer(aUniqueLayers.shift());
		for (const sLayer of aUniqueLayers) {
			const oConnector = await StorageUtils.getWriteConnectorConfigByLayer(sLayer);
			if (oFirstConnector !== oConnector) {
				return false;
			}
		}
		return true;
	}

	function canGivenChangesBeCondensed(oAppComponent, aFlexObjects, bCondenseAnyLayer) {
		if (!oAppComponent) {
			return false;
		}
		const aVariantRelatedChanges = [];
		const aOtherFlexObjects = [];
		aFlexObjects.forEach((oFlexObject) => {
			if (oFlexObject instanceof VariantChange || oFlexObject instanceof VariantManagementChange) {
				aVariantRelatedChanges.push(oFlexObject);
			} else {
				aOtherFlexObjects.push(oFlexObject);
			}
		});

		// Variant related changes do not interfere with any other kind of flex object, so we can check them individually
		// with this the save as public view scenario, where a user layer setFavorite change is also created, is also enabled for condensing
		if (!checkIfNotMoreThanOne(aVariantRelatedChanges, "getLayer") || !checkIfNotMoreThanOne(aOtherFlexObjects, "getLayer")) {
			return false;
		}

		const oUriParameters = new URLSearchParams(window.location.search);
		if (oUriParameters.has("sap-ui-xx-condense-changes")) {
			return oUriParameters.get("sap-ui-xx-condense-changes") === "true";
		}

		return bCondenseAnyLayer || [Layer.CUSTOMER, Layer.PUBLIC, Layer.USER].includes(aFlexObjects[0].getLayer());
	}

	function applyCacheUpdates(sReference, aUpdates) {
		if (aUpdates.length) {
			// FlexState.update only takes care of updating the storage response and runtime persistence for new or removed FlexObjects
			// For updated FlexObjects, the cache needs to be updated as well, which is done by calling checkUpdate on the selector
			FlexState.getFlexObjectsDataSelector().checkUpdate({ reference: sReference });
			FlexState.update(sReference, aUpdates);
		}
	}

	function collectUpdatesAndDeleteUnsavedChanges(aAllChanges, aCondensedChanges, bSkipUpdateCache, bAlreadyDeletedViaCondense, sReference, sComponentId) {
		const aUpdates = aCondensedChanges.map((oDirtyChange) => createStorageUpdate(oDirtyChange, bSkipUpdateCache))
		.filter(Boolean);
		const aRemovedChanges = [];

		aAllChanges.filter((oChange) => !aCondensedChanges.some((oCondensedChange) => oChange.getId() === oCondensedChange.getId()))
		.forEach((oChange) => {
			aRemovedChanges.push(oChange);
			if (bAlreadyDeletedViaCondense) {
				removeFlexObjectFromDependencyHandler(sReference, oChange);
				// Remove also from Cache if the persisted change is still there (e.g. navigate away and back to the app)
				aUpdates.push({ type: "delete", flexObject: oChange.convertToFileContent() });
			}
		});
		if (aRemovedChanges.length) {
			if (bAlreadyDeletedViaCondense) {
				FlexState.removeDirtyFlexObjects(sReference, aRemovedChanges);
			} else {
				FlexObjectManager.deleteFlexObjects({
					reference: sReference,
					componentId: sComponentId,
					flexObjects: aRemovedChanges
				});
			}
		}
		return aUpdates;
	}

	function getAllRelevantChangesForCondensing(aDirtyChanges, aDraftFilenames, bCondenseAnyLayer, sLayer, sReference) {
		if (!aDirtyChanges.length && !bCondenseAnyLayer) {
			return [];
		}

		// Only consider changes that are persisted, on the same layer, part of the current draft (if applicable)
		// and have the same reference (relevant for app variants)
		const aRelevantChanges = FlexState.getFlexObjectsDataSelector().get({ reference: sReference })
		.filter((oChange) => {
			if (sLayer === Layer.CUSTOMER && aDraftFilenames) {
				return oChange.getState() === States.LifecycleState.PERSISTED && aDraftFilenames.includes(oChange.getId());
			}
			return oChange.getState() === States.LifecycleState.PERSISTED
				&& LayerUtils.compareAgainstCurrentLayer(oChange.getLayer(), sLayer) === 0;
		});
		return aRelevantChanges.concat(aDirtyChanges);
	}

	async function saveSequenceOfDirtyChanges(aDirtyChanges, bSkipUpdateCache, sParentVersion) {
		let oFirstNewChange;
		if (sParentVersion) {
			// in case of changes saved for a draft only the first writing operation must have the parentVersion targeting the basis
			// followup changes must point the existing draft created with the first request
			[oFirstNewChange] = aDirtyChanges.filter((oChange) => oChange.getState() === States.LifecycleState.NEW);
		}

		const oResult = {
			response: [],
			updates: []
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
			} else if (oDirtyChange.getState() === States.LifecycleState.UPDATED) {
				oPropertyBag.flexObject = oDirtyChange.convertToFileContent();
				oStorageResponse = await Storage.update(oPropertyBag);
			}

			const oUpdate = createStorageUpdate(oDirtyChange, bSkipUpdateCache);
			if (oUpdate) {
				oResult.updates.push(oUpdate);
			}

			if (oStorageResponse?.response) {
				oResult.response.push(...oStorageResponse.response);
			}
		}
		return oResult;
	}

	function createStorageUpdate(oDirtyChange, bSkipUpdateCache) {
		if (!bSkipUpdateCache) {
			let oUpdate;
			switch (oDirtyChange.getState()) {
				case States.LifecycleState.NEW:
					oUpdate = {
						type: "add",
						flexObject: oDirtyChange.convertToFileContent()
					};
					break;
				case States.LifecycleState.DELETED:
					oUpdate = {
						type: "delete",
						flexObject: oDirtyChange.convertToFileContent()
					};
					break;
				case States.LifecycleState.UPDATED:
					oUpdate = {
						type: "update",
						flexObject: oDirtyChange.convertToFileContent()
					};
					break;
				default:
			}
			oDirtyChange.setState(States.LifecycleState.PERSISTED);
			return oUpdate;
		}
		return undefined;
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
		const mFlexObjectsPerLayer = aAllFlexObjects.reduce((mChanges, oFlexObject) => {
			const sLayer = oFlexObject.getLayer();
			mChanges[sLayer] ||= [];
			mChanges[sLayer].push(oFlexObject);
			return mChanges;
		}, {});

		// if there are multiple connectors or transport requests, all changes must be saved separately
		if (
			checkIfNotMoreThanOne(mPropertyBag.dirtyFlexObjects, "getRequest") &&
			await checkIfOneConnectorForAllLayers(mFlexObjectsPerLayer)
		) {
			const aChangesClone = aAllFlexObjects.slice(0);
			let aCondensedChanges = aChangesClone;
			// if condensing is enabled, the changes were already checked for condensing.
			// Otherwise aChangesClone only holds the dirty changes, which were not checked yet.
			if (bIsCondensingEnabled || canGivenChangesBeCondensed(mPropertyBag.appComponent, aChangesClone, mPropertyBag.condenseAnyLayer)) {
				aCondensedChanges = await Condenser.condense(mPropertyBag.appComponent, aChangesClone);
			}

			const oResponse = {
				response: []
			};
			const aUpdates = [];
			const sRequest = aChangesClone[0].getRequest();
			const aLayerEntries = Object.entries(mFlexObjectsPerLayer)
			.sort(([sLayerA], [sLayerB]) => LayerUtils.getLayerIndex(sLayerA) - LayerUtils.getLayerIndex(sLayerB));
			if (bIsCondensingEnabled) {
				for (const [sLayer, aLayerChanges] of aLayerEntries) {
					const oCurrentResponse = await Storage.condense({
						allChanges: aLayerChanges,
						condensedChanges: aCondensedChanges.filter((oChange) => oChange.getLayer() === sLayer),
						layer: sLayer,
						transport: sRequest,
						isLegacyVariant: false,
						parentVersion: mPropertyBag.parentVersion
					});
					if (oCurrentResponse?.response) {
						oResponse.response.push(...oCurrentResponse.response);
					}
				}
			} else {
				for (const [sLayer, aLayerChanges] of aLayerEntries) {
					const aDeletedChanges = aLayerChanges.filter((oChange) => oChange.getState() === States.LifecycleState.DELETED);
					const aCondensedLayerChanges = aCondensedChanges.filter((oChange) => oChange.getLayer() === sLayer);
					const oGroupedChanges = Object.groupBy(aCondensedLayerChanges, (oChange) => oChange.getState());

					// "remove" and "update" only support a single change; multiple calls are required
					if (aDeletedChanges.length || oGroupedChanges[States.LifecycleState.UPDATED]?.length) {
						const oSequenceResult = await saveSequenceOfDirtyChanges(
							[...aDeletedChanges, ...oGroupedChanges[States.LifecycleState.UPDATED] || []],
							mPropertyBag.skipUpdateCache,
							mPropertyBag.parentVersion
						);
						aUpdates.push(...oSequenceResult.updates);
					}

					// "write" supports multiple changes at once
					if (oGroupedChanges[States.LifecycleState.NEW]?.length) {
						const oCurrentResponse = await Storage.write({
							layer: sLayer,
							flexObjects: oGroupedChanges[States.LifecycleState.NEW].map((oChange) => oChange.convertToFileContent()),
							transport: sRequest,
							isLegacyVariant: false,
							parentVersion: mPropertyBag.parentVersion
						});
						if (oCurrentResponse?.response) {
							oResponse.response.push(...oCurrentResponse.response);
						}
					}
				}
			}
			aUpdates.push(...collectUpdatesAndDeleteUnsavedChanges(
				aAllFlexObjects,
				aCondensedChanges,
				mPropertyBag.skipUpdateCache,
				bIsCondensingEnabled,
				mPropertyBag.reference,
				mPropertyBag.appComponent.getId()
			));
			applyCacheUpdates(mPropertyBag.reference, aUpdates);
			return oResponse;
		}
		const oResult = await saveSequenceOfDirtyChanges(
			mPropertyBag.dirtyFlexObjects,
			mPropertyBag.skipUpdateCache,
			mPropertyBag.parentVersion
		);
		applyCacheUpdates(mPropertyBag.reference, oResult.updates);
		return { response: oResult.response };
	}

	/**
	 * Collects changes from the different states within the <code>sap.ui.fl</code> library.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Retrieves the associated flex persistence
	 * @param {string} [mPropertyBag.currentLayer] - Specifies a single layer to filter all returned flex objects by, including ctrl variant changes
	 * @param {boolean} [mPropertyBag.invalidateCache] - Flag if the cache should be invalidated
	 * @param {boolean} [mPropertyBag.includeCtrlVariants] - Flag if all control variant changes should be included - otherwise only initially applied UIChanges are included
	 * @param {boolean} [mPropertyBag.includeManifestChanges] - Flag if manifest changes should be included
	 * @param {boolean} [mPropertyBag.includeAnnotationChanges] - Flag if annotation changes should be included
	 * @param {boolean} [mPropertyBag.onlyCurrentVariants] - Flag if only current variants should be included. Is only considered if includeCtrlVariants is true
	 * @returns {Promise<sap.ui.fl.apply._internal.flexObjects.FlexObject[]>} Flex objects, containing changes, compVariants & changes as well as ctrl_variant and changes
	 */
	FlexObjectManager.getFlexObjects = async function(mPropertyBag) {
		const sReference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.selector);
		if (mPropertyBag.invalidateCache) {
			const oAppComponent = Utils.getAppComponentForSelector(mPropertyBag.selector);
			await FlexState.reinitialize({ ...mPropertyBag, reference: sReference, componentId: oAppComponent.getId() });
		}

		let aRelevantFlexObjects = UIChangesState.getVariantIndependentUIChanges(sReference)
		.concat(CompVariantManagementState.getCompEntities({ ...mPropertyBag, reference: sReference }));

		// getInitialUIChanges will only add variant related UIChanges from the initial variants,
		// with includeCtrlVariants set all variant related flex objects are added
		// onlyCurrentVariants is only valid in combination with includeCtrlVariants,
		// will add all variants, all variant management changes, and all UIChanges of all initial variants
		if (!mPropertyBag.includeCtrlVariants) {
			aRelevantFlexObjects = aRelevantFlexObjects.concat(
				VariantManagementState.getInitialUIChanges({ reference: sReference, includeDirtyChanges: true })
			);
		} else if (!mPropertyBag.onlyCurrentVariants) {
			aRelevantFlexObjects = aRelevantFlexObjects.concat(
				VariantManagementState.getVariantDependentFlexObjects(sReference)
			);
		} else {
			aRelevantFlexObjects = aRelevantFlexObjects.concat(
				VariantManagementState.getAllCurrentFlexObjects({ reference: sReference })
			);
		}

		if (mPropertyBag.includeManifestChanges) {
			aRelevantFlexObjects = aRelevantFlexObjects.concat(
				FlexState.getAppDescriptorChanges(sReference)
			);
		}

		if (mPropertyBag.includeAnnotationChanges) {
			aRelevantFlexObjects = aRelevantFlexObjects.concat(
				FlexState.getAnnotationChanges(sReference)
			);
		}

		if (mPropertyBag.currentLayer) {
			aRelevantFlexObjects = aRelevantFlexObjects.filter((oFlexObject) => {
				return oFlexObject.getLayer() === mPropertyBag.currentLayer;
			});
		}

		return aRelevantFlexObjects;
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
		return FlexObjectState.getDirtyFlexObjects(sReference).length > 0;
	};

	/**
	 * Adds new dirty flex objects.
	 *
	 * @param {string} sReference - Flex reference of the application
	 * @param {string} sComponentId - ID of the component
	 * @param {object[]} aFlexObjects - JSON object representation of flex objects or flex object instances
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} The prepared flex objects
	 * @public
	 */
	FlexObjectManager.addDirtyFlexObjects = function(sReference, sComponentId, aFlexObjects) {
		return FlexState.addDirtyFlexObjects(sReference, aFlexObjects.map(getOrCreateFlexObject), sComponentId);
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
	 * @param {string} [mPropertyBag.reference] - Flex reference of the application
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
		const sReference = mPropertyBag.reference || ManifestUtils.getFlexReferenceForControl(mPropertyBag.selector);

		const bConsiderDraftHandling = mPropertyBag.layer === Layer.CUSTOMER;
		const oVersionModel = bConsiderDraftHandling && Versions.getVersionsModel({
			reference: sReference,
			layer: mPropertyBag.layer
		});
		const bVersioningEnabled = oVersionModel && oVersionModel.getProperty("/versioningEnabled");
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
			parentVersion: bVersioningEnabled ? oVersionModel.getProperty("/persistedVersion") : undefined,
			draftFilenames: bVersioningEnabled ? oVersionModel.getProperty("/draftFilenames") : undefined
		});

		if (bConsiderDraftHandling && bVersioningEnabled) {
			await Versions.updateAfterSave({
				reference: sReference,
				layer: mPropertyBag.layer,
				backendResponse: oResult,
				version: mPropertyBag.version
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
	 * @param {string} mPropertyBag.componentId - Id of the application instance
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
		const aAddedFlexObjects = FlexObjectManager.addDirtyFlexObjects(mPropertyBag.reference, mPropertyBag.componentId, aToBeDeletedFlexObjects);
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
	 * @param {string} mPropertyBag.componentId - Id of the application instance
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
		FlexObjectManager.addDirtyFlexObjects(mPropertyBag.reference, mPropertyBag.componentId, aDirtyFlexObjectsToBeAdded);
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
	 * @param {function(boolean):void} [mPropertyBag.setBusy] - Optional callback invoked to request showing (<code>true</code>) or hiding (<code>false</code>) a busy indicator while the reset is running.
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
		if (mPropertyBag.setBusy) {
			mParams.setBusy = mPropertyBag.setBusy;
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
			if (!aChangesToRevert.length) {
				return;
			}
			FlexState.update(sReference, aChangesToRevert.map((oFlexObject) => {
				return { flexObject: oFlexObject.convertToFileContent(), type: "delete" };
			}));

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
	};

	return FlexObjectManager;
});