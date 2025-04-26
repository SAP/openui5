/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/condenser/Condenser",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils"
], function(
	Log,
	CompVariant,
	States,
	DependencyHandler,
	FlexObjectState,
	FlexState,
	Version,
	Settings,
	Condenser,
	FlexObjectManager,
	Storage,
	Layer,
	LayerUtils
) {
	"use strict";

	/**
	 * Helper object to access a change from the back end. Access helper object for each change (and variant) which was fetched from the back end
	 *
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.25.0
	 * @private
	 * @param {object} mComponent - Component data to initiate <code>ChangePersistence</code> instance
	 * @param {string} mComponent.name - Name of the component this instance is responsible for
	 */
	var ChangePersistence = function(mComponent) {
		this._mComponent = mComponent;

		if (!this._mComponent || !this._mComponent.name) {
			Log.error("The Control does not belong to an SAPUI5 component. Personalization and changes for this control might not work as expected.");
			throw new Error("Missing component name.");
		}

		this._oMessagebundle = undefined;
	};

	ChangePersistence.prototype._deleteNotSavedChanges = function(aChanges, aCondensedChanges, bAlreadyDeletedViaCondense) {
		aChanges.filter(function(oChange) {
			return !aCondensedChanges.some(function(oCondensedChange) {
				return oChange.getId() === oCondensedChange.getId();
			});
		}).forEach(function(oChange) {
			if (bAlreadyDeletedViaCondense) {
				this.removeChange(oChange);
				// Remove also from Cache if the persisted change is still there (e.g. navigate away and back to the app)
				FlexState.updateStorageResponse(this._mComponent.name, [{flexObject: oChange.convertToFileContent(), type: "delete"}]);
			} else {
				FlexObjectManager.deleteFlexObjects({
					reference: this._mComponent.name,
					flexObjects: [oChange]
				});
			}
		}.bind(this));
	};

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
		return Settings.getInstanceOrUndef()?.isCondensingEnabled();
	}

	function updateCacheAndDeleteUnsavedChanges(aAllChanges, aCondensedChanges, bSkipUpdateCache, bAlreadyDeletedViaCondense) {
		this._massUpdateCacheAndDirtyState(aCondensedChanges, bSkipUpdateCache);
		this._deleteNotSavedChanges(aAllChanges, aCondensedChanges, bAlreadyDeletedViaCondense);
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
			if (Settings.getInstanceOrUndef() && Settings.getInstanceOrUndef().hasPersoConnector()) {
				// Created public fl-Variant as default variant will created public and user changes
				// no single request can be used, because CF needs PersoConnector and KeyuserConntector
				var aLayers = getLayers(aDirtyChanges);
				bCheckLayer = aLayers.length === 1;
			}
			return aRequests.length === 1 && bCheckLayer;
		}
		return true;
	}

	function executeWriteAndRemoveCalls(sCurrentLayer, sRequest, sParentVersion, bSkipUpdateCache, aAllChanges, aCondensedChanges) {
		let pRemoveCallsPromise = Promise.resolve();
		const aDeletedChanges = aAllChanges.filter((oChange) => oChange.getState() === States.LifecycleState.DELETED);
		const aNewChanges = aCondensedChanges.filter((oCondensedChange) => (oCondensedChange.getState() !== States.LifecycleState.DELETED));

		// "remove" only supports a single change; multiple calls are required
		if (aDeletedChanges.length) {
			pRemoveCallsPromise = this.saveSequenceOfDirtyChanges(aDeletedChanges, bSkipUpdateCache, sParentVersion);
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
					updateCacheAndDeleteUnsavedChanges.call(this, aAllChanges, aNewChanges, bSkipUpdateCache);
					return oResponse;
				}.bind(this));
			}
			return this._deleteNotSavedChanges(aAllChanges, aCondensedChanges);
		}.bind(this));
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
	ChangePersistence.prototype.saveDirtyChanges = function(
		oAppComponent,
		bSkipUpdateCache,
		aChanges,
		sParentVersion,
		aDraftFilenames,
		bCondenseAnyLayer,
		sLayer
	) {
		const sReference = this._mComponent.name;
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
						updateCacheAndDeleteUnsavedChanges.call(this, aAllFlexObjects, aCondensedChanges, bSkipUpdateCache, true);
						return oResponse;
					}.bind(this));
				}
				return executeWriteAndRemoveCalls.call(
					this,
					sCurrentLayer,
					sRequest,
					sParentVersion,
					bSkipUpdateCache,
					aAllFlexObjects,
					aCondensedChanges
				);
			}.bind(this));
		}
		return this.saveSequenceOfDirtyChanges(aDirtyChanges, bSkipUpdateCache, sParentVersion);
	};

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
	ChangePersistence.prototype.saveSequenceOfDirtyChanges = async function(aDirtyChanges, bSkipUpdateCache, sParentVersion) {
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
			this._updateCacheAndDirtyState(oDirtyChange, bSkipUpdateCache);
			if (oResponse?.response) {
				oCollectedResponse.response.push(...oResponse.response);
			}
		}
		FlexState.getFlexObjectsDataSelector().checkUpdate({reference: this._mComponent.name});
		return oCollectedResponse;
	};

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
	 * Updates the cache with the dirty change passed and removes it from the array of dirty changes if present.
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oDirtyChange Dirty change which was saved
	 * @param {boolean} [bSkipUpdateCache] If true, then the dirty change shall be saved for the new created app variant, but not for the current app
	 * therefore, the cache update of the current app is skipped
	 */
	ChangePersistence.prototype._updateCacheAndDirtyState = function(oDirtyChange, bSkipUpdateCache) {
		if (!bSkipUpdateCache) {
			switch (oDirtyChange.getState()) {
				case States.LifecycleState.NEW:
					FlexState.updateStorageResponse(this._mComponent.name, [{
						type: "add",
						flexObject: oDirtyChange.convertToFileContent()
					}]);
					break;
				case States.LifecycleState.DELETED:
					FlexState.updateStorageResponse(this._mComponent.name, [{
						type: "delete",
						flexObject: oDirtyChange.convertToFileContent()
					}]);
					break;
				case States.LifecycleState.UPDATED:
					FlexState.updateStorageResponse(this._mComponent.name, [{
						type: "update",
						flexObject: oDirtyChange.convertToFileContent()
					}]);
					break;
				default:
			}
			oDirtyChange.setState(States.LifecycleState.PERSISTED);
		}
	};

	/**
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aDirtyChanges - Array of dirty changes
	 * @param {boolean} [bSkipUpdateCache]-  If <code>true</code>, then the dirty change shall be saved for the newly created app variant, but not for the current app;
	 * therefore, the cache update of the current app is skipped because the dirty change is not saved for the running app.
	 */
	ChangePersistence.prototype._massUpdateCacheAndDirtyState = function(aDirtyChanges, bSkipUpdateCache) {
		aDirtyChanges.forEach(function(oDirtyChange) {
			this._updateCacheAndDirtyState(oDirtyChange, bSkipUpdateCache);
		}, this);
		FlexState.getFlexObjectsDataSelector().checkUpdate({reference: this._mComponent.name});
	};

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

	ChangePersistence.prototype.removeChange = function(oChange) {
		FlexState.removeDirtyFlexObjects(this._mComponent.name, [oChange]);
		this._deleteChangeInMap(oChange);
	};

	/**
	 * Deletes a change object from the dependency map.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange change which has to be removed from the mapping
	 * @param {boolean} [bRunTimeCreatedChange] set if the change was created at runtime
	 * @private
	 */
	ChangePersistence.prototype._deleteChangeInMap = function(oChange, bRunTimeCreatedChange) {
		var sChangeKey = oChange.getId();
		DependencyHandler.removeChangeFromMap(FlexObjectState.getLiveDependencyMap(this._mComponent.name), sChangeKey);
		if (!bRunTimeCreatedChange) {
			DependencyHandler.removeChangeFromDependencies(FlexObjectState.getLiveDependencyMap(this._mComponent.name), sChangeKey);
		}
	};

	return ChangePersistence;
});