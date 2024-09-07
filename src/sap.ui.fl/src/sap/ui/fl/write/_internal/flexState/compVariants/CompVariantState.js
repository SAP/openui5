/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/restricted/_pick",
	"sap/ui/core/Element",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariantRevertData",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/RevertData",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexObjects/UpdatableChange",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantMerger",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions"
], function(
	_omit,
	_pick,
	Element,
	Layer,
	Utils,
	CompVariant,
	CompVariantRevertData,
	FlexObjectFactory,
	RevertData,
	States,
	UpdatableChange,
	CompVariantMerger,
	FlexState,
	Version,
	Settings,
	Storage,
	Versions
) {
	"use strict";

	function isVersionIndependentOrInDraft(oChange, mPropertyBag) {
		var aDraftFilenames = getPropertyFromVersionsModel("/draftFilenames", mPropertyBag);
		if (aDraftFilenames) {
			return oChange.getState() === States.LifecycleState.NEW
			|| aDraftFilenames.includes(oChange.getId());
		}
		return true;
	}

	function getPropertyFromVersionsModel(sPropertyName, mPropertyBag) {
		var mPropertyBag = {
			reference: mPropertyBag.reference,
			layer: mPropertyBag.layer
		};
		if (Versions.hasVersionsModel(mPropertyBag)) {
			return Versions.getVersionsModel(mPropertyBag).getProperty(sPropertyName);
		}
		return undefined;
	}

	function isChangeUpdatable(oFlexObject, mPropertyBag) {
		var oChangeType = oFlexObject.getFlexObjectMetadata ? oFlexObject.getFlexObjectMetadata().changeType : oFlexObject.getChangeType();
		if (!["defaultVariant", "updateVariant"].includes(oChangeType)) {
			return false;
		}

		var bSameLayer = oFlexObject.getLayer() === mPropertyBag.layer;
		var sPackageName = oFlexObject.getFlexObjectMetadata().packageName;
		var bNotTransported = !sPackageName || sPackageName === "$TMP";

		return bSameLayer && bNotTransported && isVersionIndependentOrInDraft(oFlexObject, mPropertyBag);
	}

	function getSubSection(mMap, oFlexObject) {
		if (oFlexObject.isVariant && oFlexObject.isVariant()) {
			return mMap.variants;
		}

		var oChangeType = oFlexObject.getChangeType();
		switch (oChangeType) {
			case "defaultVariant":
				return mMap.defaultVariants;
			case "standardVariant":
				return mMap.standardVariants;
			default:
				return mMap.changes;
		}
	}

	function updateArrayByName(aObjectArray, oFlexObject) {
		for (var i = 0; i < aObjectArray.length; i++) {
			if (aObjectArray[i].fileName === oFlexObject.fileName) {
				aObjectArray.splice(i, 1, oFlexObject);
				break;
			}
		}
	}

	function updateObjectAndStorage(oFlexObject, oStoredResponse, sParentVersion, sReference) {
		return Storage.update({
			flexObject: oFlexObject.convertToFileContent(),
			layer: oFlexObject.getLayer(),
			transport: oFlexObject.getRequest(),
			parentVersion: sParentVersion
		}).then(function(result) {
			// update FlexObject and versionModel
			if (result && result.response) {
				oFlexObject.setResponse(result.response);
				if (sParentVersion) {
					Versions.onAllChangesSaved({
						reference: result.response.reference,
						layer: result.response.layer,
						draftFilenames: result.response.fileName
					});
				}
			} else {
				oFlexObject.setState(States.LifecycleState.PERSISTED);
			}
		}).then(function() {
			// update StorageResponse
			var aObjectArray = getSubSection(oStoredResponse.changes.comp, oFlexObject);
			var oFileContent = oFlexObject.convertToFileContent();
			FlexState.getFlexObjectsDataSelector().checkUpdate({ reference: sReference });
			updateArrayByName(aObjectArray, oFileContent);
			return oFileContent;
		});
	}

	function removeFromArrayById(aObjectArray, sObjectId) {
		for (var i = aObjectArray.length - 1; i >= 0; i--) {
			// aObjectArray can come from either back end response or flex state
			// In the first case, the fileName is a direct property of object
			// In the second case, it can be obtained from getId() function
			var sFileName = aObjectArray[i].fileName || (aObjectArray[i].getId() && aObjectArray[i].getId());
			if ((sFileName || aObjectArray[i].getId()) === sObjectId) {
				aObjectArray.splice(i, 1);
				break;
			}
		}
	}

	function removeFromCompVariantsMap(oFlexObject, mCompVariantsMapByPersistencyKey) {
		delete mCompVariantsMapByPersistencyKey.byId[oFlexObject.getId()];
		if (oFlexObject.getChangeType() === "standardVariant") {
			mCompVariantsMapByPersistencyKey.standardVariantChange = undefined;
		} else {
			removeFromArrayById(getSubSection(mCompVariantsMapByPersistencyKey, oFlexObject), oFlexObject.getId());
		}
	}

	function deleteObjectAndRemoveFromStorage(oFlexObject, mCompVariantsMapByPersistencyKey, oStoredResponse, sParentVersion, sReference) {
		var oFileContent = oFlexObject.convertToFileContent();
		return Storage.remove({
			flexObject: oFileContent,
			layer: oFlexObject.getLayer(),
			transport: oFlexObject.getRequest(),
			parentVersion: sParentVersion
		}).then(function() {
			// update CompVariantsMap
			removeFromCompVariantsMap(oFlexObject, mCompVariantsMapByPersistencyKey);
		}).then(Versions.updateModelFromBackend.bind(this, {
			reference: oFileContent.reference,
			layer: oFileContent.layer
		})).then(function() {
			// update StorageResponse
			removeFromArrayById(
				getSubSection(oStoredResponse.changes.comp, oFlexObject),
				oFileContent.fileName
			);
			FlexState.getFlexObjectsDataSelector().checkUpdate({ reference: sReference });
			return oFileContent;
		});
	}

	function getTexts(mPropertyBag) {
		var mInternalTexts = {};
		if (typeof (mPropertyBag.texts) === "object") {
			Object.keys(mPropertyBag.texts).forEach(function(key) {
				mInternalTexts[key] = {
					value: mPropertyBag.texts[key],
					type: "XFLD"
				};
			});
		}
		return mInternalTexts;
	}

	function needsPersistencyCall(oFlexObject) {
		return oFlexObject &&
			[States.LifecycleState.NEW, States.LifecycleState.UPDATED, States.LifecycleState.DELETED].includes(oFlexObject.getState());
	}

	function getAllCompVariantObjects(mCompVariantsMapByPersistencyKey) {
		return mCompVariantsMapByPersistencyKey.variants
		.concat(mCompVariantsMapByPersistencyKey.changes)
		.concat(mCompVariantsMapByPersistencyKey.defaultVariants)
		.concat(mCompVariantsMapByPersistencyKey.standardVariantChange);
	}

	function determineLayer(mPropertyBag) {
		// the SmartVariantManagementWriteAPI.addVariant-caller within sap.ui.rta provides a layer ...
		if (mPropertyBag.layer) {
			return mPropertyBag.layer;
		}

		// ... the SmartVariantManagementWriteAPI.add-caller cannot determine the layer on its own, but provides a isUserDependent flag
		if (mPropertyBag.isUserDependent) {
			return Layer.USER;
		}

		var sLayer = new URLSearchParams(window.location.search).get("sap-ui-layer") || "";
		sLayer = sLayer.toUpperCase();
		if (sLayer) {
			return sLayer;
		}

		// PUBLIC is only used for "public" variants
		if (!mPropertyBag.fileType === "variant") {
			return Layer.CUSTOMER;
		}

		var bPublicLayerAvailable = Settings.getInstanceOrUndef().isPublicLayerAvailable();
		return bPublicLayerAvailable ? Layer.PUBLIC : Layer.CUSTOMER;
	}

	function getVariantById(mPropertyBag) {
		var mCompVariantsByIdMap = FlexState.getCompVariantsMap(mPropertyBag.reference)._getOrCreate(mPropertyBag.persistencyKey);
		return mCompVariantsByIdMap.byId[mPropertyBag.id];
	}

	function ifVariantClearRevertData(oFlexObject) {
		if (oFlexObject instanceof CompVariant) {
			oFlexObject.removeAllRevertData();
		}
	}

	function revertVariantUpdate(oVariant, mPropertyBag) {
		oVariant.storeExecuteOnSelection(mPropertyBag.executeOnSelection);
		oVariant.storeFavorite(mPropertyBag.favorite);
		oVariant.storeContexts(mPropertyBag.contexts);
		oVariant.storeName(mPropertyBag.name);
		oVariant.storeContent(mPropertyBag.content || oVariant.getContent());
		return oVariant;
	}

	function revertVariantChange(oVariant, mPropertyBag) {
		oVariant.setExecuteOnSelection(mPropertyBag.executeOnSelection);
		oVariant.setFavorite(mPropertyBag.favorite);
		oVariant.setContexts(mPropertyBag.contexts);
		oVariant.setName(mPropertyBag.name);
		oVariant.setContent(mPropertyBag.content || oVariant.getContent());
		return oVariant;
	}

	function revertAllVariantUpdate(oVariant) {
		if (oVariant && oVariant.getRevertData().length) {
			let oRevertDataContent;
			oVariant.getRevertData().reverse().some((oRevertData) => {
				oRevertDataContent = oRevertData.getContent();
				return oRevertDataContent.previousAction === CompVariantState.updateActionType.SAVE;
			});
			revertVariantUpdate(
				oVariant,
				{
					name: oRevertDataContent.previousName,
					content: oRevertDataContent.previousContent,
					favorite: oRevertDataContent.previousFavorite,
					executeOnSelection: oRevertDataContent.previousExecuteOnSelection,
					contexts: oRevertDataContent.previousContexts
				}
			);
			oVariant.setState(oRevertDataContent.previousState);
		}
	}

	function setAuthor(oChangeSpecificData) {
		if (oChangeSpecificData.layer === Layer.VENDOR) {
			oChangeSpecificData.support = {
				user: "SAP"
			};
		} else if (Settings.getInstanceOrUndef() && Settings.getInstanceOrUndef().getUserId()) {
			oChangeSpecificData.support = {
				user: Settings.getInstanceOrUndef().getUserId()
			};
		}
	}

	function getSVMControls(sReference) {
		const mCompVariantsMap = FlexState.getCompVariantsMap(sReference);
		const aSVMControls = [];
		if (mCompVariantsMap) {
			Object.values(mCompVariantsMap).forEach(function(mMap) {
				const oSVMControl = mMap.controlId && Element.getElementById(mMap.controlId);
				if (oSVMControl) {
					aSVMControls.push(oSVMControl);
				}
			});
		}
		return aSVMControls;
	}

	/**
	 * CompVariant state class to handle the state of the compVariants and its changes.
	 * This class is in charge of updating the maps stored in the <code>sap.ui.fl.apply._internal.flexState.FlexState</code>.
	 *
	 * @namespace sap.ui.fl.write._internal.flexState.compVariants.CompVariantState
	 * @since 1.83
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var CompVariantState = {};

	CompVariantState.checkSVMControlsForDirty = function(sReference) {
		return getSVMControls(sReference).some((oSVMControl) => {
			return oSVMControl.getModified();
		});
	};

	/**
	 * Creates a change to set which variant should be selected at the application start-up.
	 *
	 * @param {object} mPropertyBag - Map of parameters, see below
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {string} mPropertyBag.persistencyKey - ID of the variant management internal identifier
	 * @param {string} mPropertyBag.defaultVariantId - ID of the variant which should be selected at start-up
	 * @param {string} [mPropertyBag.generator] - Generator of changes
	 * @param {string} [mPropertyBag.compositeCommand] - Name of the command calling the API
	 * @param {sap.ui.fl.Layer} [mPropertyBag.layer = Layer.USER] - Enables setDefault for the given layer
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject} Created or updated change object in charge for setting the default variant
	 */
	CompVariantState.setDefault = function(mPropertyBag) {
		var oContent = {
			defaultVariantName: mPropertyBag.defaultVariantId
		};
		// TODO: remove as soon as the development uses an IDE using rta which passes the correct parameter
		mPropertyBag.layer ||= new URLSearchParams(window.location.search).get("sap-ui-layer") || Layer.USER;

		var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference)._getOrCreate(mPropertyBag.persistencyKey);
		var sChangeType = "defaultVariant";
		var aDefaultVariantChanges = mCompVariantsMap.defaultVariants;
		var oChange = aDefaultVariantChanges[aDefaultVariantChanges.length - 1];

		if (!oChange || !isChangeUpdatable(oChange, mPropertyBag)) {
			var oChangeParameter = {
				fileName: Utils.createDefaultFileName(sChangeType),
				fileType: "change",
				changeType: sChangeType,
				layer: mPropertyBag.layer,
				content: oContent,
				namespace: Utils.createNamespace(mPropertyBag, "changes"),
				reference: mPropertyBag.reference,
				selector: {
					persistencyKey: mPropertyBag.persistencyKey
				},
				support: mPropertyBag.support || {}
			};
			oChangeParameter.adaptationId = mPropertyBag.changeSpecificData?.adaptationId;
			oChangeParameter.support.generator ||= `CompVariantState.${sChangeType}`;
			oChange = FlexObjectFactory.createFromFileContent(oChangeParameter, UpdatableChange);
			mCompVariantsMap.defaultVariants.push(oChange);
			mCompVariantsMap.byId[oChange.getId()] = oChange;
			oChange.addRevertInfo(new RevertData({
				type: CompVariantState.operationType.NewChange
			}));
			FlexState.addDirtyFlexObjects(mPropertyBag.reference, [oChange]);
		} else {
			oChange.addRevertInfo(new RevertData({
				type: CompVariantState.operationType.ContentUpdate,
				content: {
					previousState: oChange.getState(),
					previousContent: oChange.getContent()
				}
			}));
			oChange.setContent(oContent);
		}
		return oChange;
	};

	/**
	 * Reverts the last setDefaultVariantId operation done on a variant management.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {string} mPropertyBag.persistencyKey - ID of the variant management internal identifier
	 */
	CompVariantState.revertSetDefaultVariantId = function(mPropertyBag) {
		var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference)._getOrCreate(mPropertyBag.persistencyKey);
		var aDefaultVariantChanges = mCompVariantsMap.defaultVariants;
		var oChange = aDefaultVariantChanges[aDefaultVariantChanges.length - 1];
		var oRevertInfo = oChange.popLatestRevertInfo();
		if (oRevertInfo.getType() === CompVariantState.operationType.ContentUpdate) {
			oChange.setContent(oRevertInfo.getContent().previousContent);
			oChange.setState(oRevertInfo.getContent().previousState);
		} else {
			oChange.setState(States.LifecycleState.DELETED);
			mCompVariantsMap.defaultVariants.pop();
		}
	};

	/**
	 * Adds a new variant for a smart variant management, such as filter bar or table, and returns the ID of the new variant.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {string} mPropertyBag.persistencyKey - ID of the variant management internal identifier
	 * @param {boolean} [mPropertyBag.generator] - Name of the tool creating the variant for support analysis
	 * @param {boolean} [mPropertyBag.command] - Name of the sa.ui.rta-command for support analysis
	 * @param {object} mPropertyBag.changeSpecificData - Data set defining the object to be added
	 * @param {sap.ui.fl.Layer} mPropertyBag.changeSpecificData.layer - Layer to which the variant should be written
	 * @param {boolean} [mPropertyBag.changeSpecificData.id] - Id that should be used for the flex object
	 * @param {string} mPropertyBag.changeSpecificData.type - Type <filterVariant, tableVariant, etc>
	 * @param {object} mPropertyBag.changeSpecificData.texts - A map object containing all translatable texts which are referenced within the file
	 * @param {object} mPropertyBag.changeSpecificData.content - Content of the new change
	 * @param {object} [mPropertyBag.changeSpecificData.favorite] - Indicates if the change is added as favorite
	 * @param {object} [mPropertyBag.changeSpecificData.executeOnSelection] - Indicates if the <code>executeOnSelection</code> flag should be set
	 * @param {object} [mPropertyBag.changeSpecificData.contexts] - Map of contexts that restrict the visibility of the variant
	 * @param {string[]} [mPropertyBag.changeSpecificData.contexts.role] - List of roles which are allowed to see the variant
	 * @param {string} [mPropertyBag.changeSpecificData.ODataService] - Name of the OData service --> can be null
	 * @param {boolean} [mPropertyBag.changeSpecificData.isUserDependent] - Indicates if a change is only valid for the current user
	 * @param {string} [mPropertyBag.changeSpecificData.packageName] - Package name for the new entity, <default> is $tmp
	 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} Created variant object instance
	 * @public
	 */
	CompVariantState.addVariant = function(mPropertyBag) {
		if (!mPropertyBag) {
			return undefined;
		}

		const oChangeSpecificData = mPropertyBag.changeSpecificData;

		oChangeSpecificData.layer = determineLayer(oChangeSpecificData);
		oChangeSpecificData.changeType = oChangeSpecificData.type;
		oChangeSpecificData.texts = getTexts(oChangeSpecificData);
		setAuthor(oChangeSpecificData);
		const oFileContent = { ...oChangeSpecificData, ...(_omit(mPropertyBag, "changeSpecificData")) };
		const oFlexObject = FlexObjectFactory.createCompVariant(oFileContent);

		const mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
		const oMapOfPersistencyKey = mCompVariantsMap._getOrCreate(mPropertyBag.persistencyKey);
		oMapOfPersistencyKey.variants.push(oFlexObject);
		oMapOfPersistencyKey.byId[oFlexObject.getId()] = oFlexObject;
		FlexState.addDirtyFlexObjects(mPropertyBag.reference, [oFlexObject]);
		if (oChangeSpecificData.layer !== Layer.USER && oChangeSpecificData.layer !== Layer.PUBLIC) {
			mPropertyBag.id = mPropertyBag.control.getCurrentVariantId();
			revertAllVariantUpdate(getVariantById(mPropertyBag));
		}
		return oFlexObject;
	};

	/**
	 * Updates a variant; this may result in an update of the variant or the creation of a change.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {string} mPropertyBag.persistencyKey - Key of the variant management
	 * @param {string} mPropertyBag.id - ID of the variant
	 * @param {string} [mPropertyBag.packageName] - ID of the package in which the update should be transported - only valid for sap-ui-layer=VENDOR use case
	 * @param {string} [mPropertyBag.transportId] - ID of the transport in which the update should be transported
	 * @param {object} [mPropertyBag.revert=false] - Flag if the update is a revert operation
	 * @param {object} [mPropertyBag.name] - Title of the variant
	 * @param {object} [mPropertyBag.content] - Content of the new change
	 * @param {object} [mPropertyBag.favorite] - Flag if the variant should be flagged as a favorite
	 * @param {boolean} [mPropertyBag.visible] - Flag if the variant should be set visible
	 * @param {object} [mPropertyBag.executeOnSelection] - Flag if the variant should be executed on selection
	 * @param {object} [mPropertyBag.contexts] - Map of contexts that restrict the visibility of the variant
	 * @param {string[]} [mPropertyBag.contexts.role] - List of roles which are allowed to see the variant
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer in which the variant removal takes place;
	 * @param {string} [mPropertyBag.adaptationId] - ID of the context-based adaptation
	 * @param {boolean} [mPropertyBag.forceCreate] - Parameter that forces a new change to be created
	 * this either updates the variant from the layer or writes a change to that layer.
	 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} The updated variant
	 */
	CompVariantState.updateVariant = function(mPropertyBag) {
		function variantCanBeUpdated(oVariant, sLayer) {
			var bSameLayer = oVariant.getLayer() === sLayer;
			var sPackageName = oVariant.getFlexObjectMetadata().packageName;
			var bNotTransported = !sPackageName || sPackageName === "$TMP";
			// in case changes were already done within the layer, no update of the variant can be done to safeguard the execution order
			var bIsChangedOnLayer = oVariant.getChanges().some(function(oChange) {
				return oChange.getLayer() === sLayer;
			});
			return oVariant.getPersisted() && bSameLayer && bNotTransported && !bIsChangedOnLayer && isVersionIndependentOrInDraft(oVariant, mPropertyBag);
		}

		function getLatestUpdatableChange(oVariant) {
			return oVariant.getChanges().reverse().find(function(oChange) {
				return oChange.getChangeType() === "updateVariant" && isChangeUpdatable(oChange, mPropertyBag);
			});
		}

		function storeRevertDataInVariant(mPropertyBag, oVariant, sOperationType, oChange) {
			var oRevertData = {
				type: sOperationType,
				change: oChange,
				content: {
					previousState: oVariant.getState(),
					previousContent: oVariant.getContent(),
					previousFavorite: oVariant.getFavorite(),
					previousVisible: oVariant.getVisible(),
					previousExecuteOnSelection: oVariant.getExecuteOnSelection(),
					previousContexts: oVariant.getContexts(),
					previousName: oVariant.getName(),
					previousAction: mPropertyBag.action
				}
			};
			oVariant.addRevertData(new CompVariantRevertData(oRevertData));
		}

		function updateVariant(mPropertyBag, oVariant) {
			storeRevertDataInVariant(mPropertyBag, oVariant, CompVariantState.operationType.ContentUpdate);

			if (mPropertyBag.executeOnSelection !== undefined) {
				oVariant.storeExecuteOnSelection(mPropertyBag.executeOnSelection);
			}
			// public variant should not be visible for other users
			if (mPropertyBag.layer === Layer.PUBLIC) {
				oVariant.storeFavorite(false);
			} else	if (mPropertyBag.favorite !== undefined) {
				oVariant.storeFavorite(mPropertyBag.favorite);
			}
			if (mPropertyBag.visible !== undefined) {
				oVariant.storeVisible(mPropertyBag.visible);
			}
			if (mPropertyBag.contexts) {
				oVariant.storeContexts(mPropertyBag.contexts);
			}
			if (mPropertyBag.name) {
				oVariant.storeName(mPropertyBag.name);
			}
			if (mPropertyBag.transportId) {
				oVariant.setRequest(mPropertyBag.transportId);
			}
			oVariant.storeContent(mPropertyBag.content || oVariant.getContent());
		}

		function updateChange(mPropertyBag, oVariant, oChange) {
			const aRevertData = oChange.getRevertData() || [];
			const oChangeContent = { ...oChange.getContent() };
			const oRevertData = {
				previousContent: { ...oChangeContent },
				previousState: oChange.getState(),
				change: _pick(mPropertyBag, ["favorite", "visible", "executeOnSelection", "contexts", "content", "name"])
			};
			aRevertData.push(oRevertData);
			oChange.setRevertData(aRevertData);
			if (mPropertyBag.executeOnSelection !== undefined) {
				oChangeContent.executeOnSelection = mPropertyBag.executeOnSelection;
			}
			if (mPropertyBag.favorite !== undefined) {
				oChangeContent.favorite = mPropertyBag.favorite;
			}
			if (mPropertyBag.visible !== undefined) {
				oChangeContent.visible = mPropertyBag.visible;
			}
			if (mPropertyBag.contexts) {
				oChangeContent.contexts = mPropertyBag.contexts;
			}
			if (mPropertyBag.content) {
				oChangeContent.variantContent = mPropertyBag.content;
			}
			if (mPropertyBag.adaptationId) {
				oChange.setAdaptationId(mPropertyBag.adaptationId);
			}
			if (mPropertyBag.name) {
				oChange.setText("variantName", mPropertyBag.name);
			}
			oChange.setContent(oChangeContent);
			if (mPropertyBag.transportId) {
				oChange.setRequest(mPropertyBag.transportId);
			}
			storeRevertDataInVariant(mPropertyBag, oVariant, CompVariantState.operationType.UpdateVariantViaChangeUpdate, oChange);
			CompVariantMerger.applyChangeOnVariant(oVariant, oChange);
		}

		function createChange(mPropertyBag, oVariant) {
			function addChange(oChange) {
				var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
				var sPersistencyKey = oChange.getSelector().persistencyKey;
				mCompVariantsMap[sPersistencyKey].changes.push(oChange);
				mCompVariantsMap[sPersistencyKey].byId[oChange.getId()] = oChange;
				FlexState.addDirtyFlexObjects(mPropertyBag.reference, [oChange]);
			}

			var oContent = {};
			["favorite", "visible", "executeOnSelection", "contexts"].forEach(function(sPropertyName) {
				if (mPropertyBag[sPropertyName] !== undefined) {
					oContent[sPropertyName] = mPropertyBag[sPropertyName];
				}
			});
			if (mPropertyBag.content !== undefined) {
				oContent.variantContent = mPropertyBag.content;
			}

			var oChange = FlexObjectFactory.createUIChange({
				changeType: "updateVariant",
				layer: sLayer,
				fileType: "change",
				reference: mPropertyBag.reference,
				packageName: mPropertyBag.packageName,
				content: oContent,
				selector: {
					persistencyKey: mPropertyBag.persistencyKey,
					variantId: oVariant.getVariantId()
				}
			});

			const sAdaptationId = mPropertyBag.adaptationId || mPropertyBag?.changeSpecificData?.adaptationId;

			if (sAdaptationId) {
				oChange.setAdaptationId(sAdaptationId);
			}

			if (mPropertyBag.name) {
				oChange.setText("variantName", mPropertyBag.name, "XFLD", true);
			}

			if (mPropertyBag.transportId) {
				oChange.setRequest(mPropertyBag.transportId);
			}
			addChange(oChange);
			storeRevertDataInVariant(mPropertyBag, oVariant, CompVariantState.operationType.NewChange, oChange);
			CompVariantMerger.applyChangeOnVariant(oVariant, oChange);
		}

		var oVariant = getVariantById(mPropertyBag);
		var sLayer = determineLayer(mPropertyBag);
		mPropertyBag.layer ||= sLayer;

		if (mPropertyBag.forceCreate) {
			createChange(mPropertyBag, oVariant);
		} else if (variantCanBeUpdated(oVariant, sLayer)) {
			updateVariant(mPropertyBag, oVariant);
		} else {
			var oUpdatableChange = getLatestUpdatableChange(oVariant);
			if (oUpdatableChange) {
				updateChange(mPropertyBag, oVariant, oUpdatableChange);
			} else {
				createChange(mPropertyBag, oVariant);
			}
		}
		return oVariant;
	};

	/**
	 * Discards the variant content to the original or last saved content;
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
	 * 			sap.ui.comp.smartfilterbar.SmartFilterBar|
	 * 			sap.ui.comp.smarttable.SmartTable|
	 * 			sap.ui.comp.smartchart.SmartChart} mPropertyBag.control - Variant management control for which the variant should be updated
	 * @param {string} mPropertyBag.id - ID of the variant
	 * @param {sap.ui.fl.Layer} [mPropertyBag.layer] - Layer in which the save of variant content takes place
	 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} The discarded variant
	 */
	CompVariantState.discardVariantContent = function(mPropertyBag) {
		var oVariant = getVariantById(mPropertyBag);
		var aVariantRevertData = oVariant.getRevertData();
		if (aVariantRevertData.length !== 0) {
			// Look at revert data backward, to find the content of last save action
			var bIsVariantSaved = aVariantRevertData.slice().reverse().some(function(oRevertData) {
				mPropertyBag.layer = oRevertData.getChange()?.getLayer();
				if (oRevertData.getContent().previousAction === CompVariantState.updateActionType.SAVE) {
					mPropertyBag.content = oRevertData.getContent().previousContent;
					mPropertyBag.action = CompVariantState.updateActionType.DISCARD;
					return true;
				}
			});

			if (!bIsVariantSaved) {
				mPropertyBag.content = aVariantRevertData[0].getContent().previousContent;
				mPropertyBag.action = CompVariantState.updateActionType.DISCARD;
			}
			// Update variant content to the last saved or original content
			CompVariantState.updateVariant(mPropertyBag);
		}
		return oVariant;
	};

	/**
	 * Defines the different types of actions lead to a variant got update.
	 *
	 * @enum {string}
	 */
	CompVariantState.updateActionType = {
		UPDATE: "update",
		SAVE: "save",
		DISCARD: "discard",
		UPDATE_METADATA: "update_metadata"
	};

	/**
	 * Defines the different types of operations done on a variant.
	 * - StateUpdate only changes the variants persistence status. I.e. a removeVariant call only sets the variant to <code>DELETED</code>
	 * - ContentUpdate may contain all content related updates including name, favorite, executeOnSelection or values and data
	 *
	 * @enum {string}
	 */
	CompVariantState.operationType = {
		StateUpdate: "StateUpdate",
		ContentUpdate: "ContentUpdate",
		NewChange: "NewChange",
		UpdateVariantViaChange: "UpdateVariantViaChange",
		UpdateVariantViaChangeUpdate: "UpdateVariantViaChangeUpdate"
	};

	/**
	 * Removes a variant; this may result in an deletion of the existing variant or the creation of a change.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {string} mPropertyBag.persistencyKey - Key of the variant management
	 * @param {string} mPropertyBag.id - ID of the variant
	 * @param {object} [mPropertyBag.revert=false] - Flag if the removal is a revert operation
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer in which the variant removal takes place;
	 * this either removes the variant from the layer or writes a change to that layer.
	 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} The removed variant
	 */
	CompVariantState.removeVariant = function(mPropertyBag) {
		var oVariant = getVariantById(mPropertyBag);
		var sCurrentState = oVariant.getState();

		if (!mPropertyBag.revert) {
			var oRevertData = new CompVariantRevertData({
				type: CompVariantState.operationType.StateUpdate,
				content: {
					previousState: sCurrentState
				}
			});
			oVariant.addRevertData(oRevertData);
		}

		if (sCurrentState === States.LifecycleState.NEW) {
			var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
			var mCompVariantsMapByPersistencyKey = mCompVariantsMap._getOrCreate(mPropertyBag.persistencyKey);
			removeFromCompVariantsMap(oVariant, mCompVariantsMapByPersistencyKey);
			return oVariant;
		}

		oVariant.markForDeletion();
		return oVariant;
	};

	/**
	 * Reverts the last operation done on a variant.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {string} mPropertyBag.persistencyKey - Key of the variant management
	 * @param {string} mPropertyBag.id - ID of the variant
	 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} The reverted variant
	 */
	CompVariantState.revert = function(mPropertyBag) {
		function removeChange(oChange) {
			var sPersistencyKey = oChange.getSelector().persistencyKey;
			var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
			delete mCompVariantsMap[sPersistencyKey].byId[oChange.getId()];
			mCompVariantsMap[sPersistencyKey].changes = mCompVariantsMap[sPersistencyKey].changes.filter(function(oChangeInMap) {
				return oChangeInMap !== oChange;
			});
			FlexState.removeDirtyFlexObjects(mPropertyBag.reference, [oChange]);
		}

		var oVariant = getVariantById(mPropertyBag);

		var oVariantRevertData = oVariant.getRevertData().pop();
		oVariant.removeRevertData(oVariantRevertData);
		var oRevertDataContent = oVariantRevertData.getContent();
		var oChange;

		switch (oVariantRevertData.getType()) {
			case CompVariantState.operationType.ContentUpdate:
				revertVariantUpdate(
					oVariant,
					{
						name: oRevertDataContent.previousName,
						content: oRevertDataContent.previousContent,
						favorite: oRevertDataContent.previousFavorite,
						executeOnSelection: oRevertDataContent.previousExecuteOnSelection,
						contexts: oRevertDataContent.previousContexts,
						..._pick(mPropertyBag, ["reference", "persistencyKey", "id"])
					}
				);
				break;
			case CompVariantState.operationType.NewChange:
				oChange = oVariantRevertData.getChange();
				oVariant.removeChange(oChange);
				removeChange(oChange);
				revertVariantChange(
					oVariant,
					{
						name: oRevertDataContent.previousName,
						content: oRevertDataContent.previousContent,
						favorite: oRevertDataContent.previousFavorite,
						executeOnSelection: oRevertDataContent.previousExecuteOnSelection,
						contexts: oRevertDataContent.previousContexts,
						..._pick(mPropertyBag, ["reference", "persistencyKey", "id"])
					}
				);
				break;
			case CompVariantState.operationType.UpdateVariantViaChangeUpdate:
				oChange = oVariantRevertData.getChange();
				revertVariantChange(
					oVariant,
					{
						...{
							name: oRevertDataContent.previousName,
							content: oRevertDataContent.previousContent,
							favorite: oRevertDataContent.previousFavorite,
							executeOnSelection: oRevertDataContent.previousExecuteOnSelection,
							contexts: oRevertDataContent.previousContexts
						},
						..._pick(mPropertyBag, ["reference", "persistencyKey", "id"])
					}
				);
				var oChangeRevertData = oChange.getRevertData().pop();
				oChange.setContent(oChangeRevertData.previousContent);
				oChange.setState(oChangeRevertData.previousState);
				break;
			case CompVariantState.operationType.StateUpdate:
			default:
				break;
		}

		oVariant.setState(oRevertDataContent.previousState);
		return oVariant;
	};

	/**
	 * Overrides the standard variant as well as reapplies the changes on it.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {string} mPropertyBag.persistencyKey - Key of the variant management
	 * @param {boolean} mPropertyBag.executeOnSelection - Flag if 'apply automatically' should be set
	 */
	CompVariantState.overrideStandardVariant = function(mPropertyBag) {
		var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference)[mPropertyBag.persistencyKey];
		var oStandardVariant = mCompVariantsMap.byId[mCompVariantsMap.standardVariant.getVariantId()];

		oStandardVariant.setExecuteOnSelection(!!mPropertyBag.executeOnSelection);
		var aChanges = oStandardVariant.getChanges();
		oStandardVariant.removeAllChanges();
		aChanges.forEach(function(oChange) {
			CompVariantMerger.applyChangeOnVariant(oStandardVariant, oChange);
		});
	};

	/**
	 * Saves/flushes all current changes and variants of a smart variant.
	 *
	 * @param {object} mPropertyBag - Map of parameters, see below
	 * @param {string} mPropertyBag.reference - Flex reference of the app
	 * @param {string} mPropertyBag.persistencyKey - Key of the variant management
	 *
	 * @returns {Promise} Promise resolving with an array of responses or rejecting with the first error
	 * @private
	 */
	CompVariantState.persist = async function(mPropertyBag) {
		function writeObjectAndAddToState(oFlexObject, oStoredResponse, sParentVersion) {
			// new public variant should not be visible for other users
			if (oFlexObject.getLayer() === Layer.PUBLIC) {
				oFlexObject.setFavorite(false);
			}
			// TODO: remove this line as soon as layering and a condensing is in place
			return Storage.write({
				flexObjects: [oFlexObject.convertToFileContent()],
				layer: oFlexObject.getLayer(),
				transport: oFlexObject.getRequest(),
				isLegacyVariant: oFlexObject.isVariant && oFlexObject.isVariant(),
				parentVersion: sParentVersion
			}).then(function(result) {
				// updateFlexObject and versionModel
				if (result && result.response && result.response[0]) {
					oFlexObject.setResponse(result.response[0]);
					if (sParentVersion) {
						Versions.onAllChangesSaved({
							reference: result.response[0].reference,
							layer: result.response[0].layer,
							draftFilenames: [result.response[0].fileName]
						});
					}
				} else {
					oFlexObject.setState(States.LifecycleState.PERSISTED);
				}
			}).then(function() {
				// update StorageResponse
				const oFileContent = oFlexObject.convertToFileContent();
				getSubSection(oStoredResponse.changes.comp, oFlexObject).push(oFileContent);
				FlexState.getFlexObjectsDataSelector().checkUpdate({ reference: mPropertyBag.reference });
				return oFileContent;
			});
		}

		function saveObject(oFlexObject, mCompVariantsMapByPersistencyKey, oStoredResponse, sParentVersion) {
			switch (oFlexObject.getState()) {
				case States.LifecycleState.NEW:
					ifVariantClearRevertData(oFlexObject);
					return writeObjectAndAddToState(oFlexObject, oStoredResponse, sParentVersion);
				case States.LifecycleState.UPDATED:
					ifVariantClearRevertData(oFlexObject);
					return updateObjectAndStorage(oFlexObject, oStoredResponse, sParentVersion, mPropertyBag.reference);
				case States.LifecycleState.DELETED:
					ifVariantClearRevertData(oFlexObject);
					return deleteObjectAndRemoveFromStorage(oFlexObject, mCompVariantsMapByPersistencyKey, oStoredResponse, sParentVersion, mPropertyBag.reference);
				default:
					return undefined;
			}
		}

		const sReference = mPropertyBag.reference;
		const sPersistencyKey = mPropertyBag.persistencyKey;
		const mCompVariantsMap = FlexState.getCompVariantsMap(sReference);
		const mCompVariantsMapByPersistencyKey = mCompVariantsMap._getOrCreate(sPersistencyKey);

		const oStoredResponse = await FlexState.getStorageResponse(sReference);
		const aFlexObjects = getAllCompVariantObjects(mCompVariantsMapByPersistencyKey).filter(needsPersistencyCall);
		const aPromises = aFlexObjects.map(function(oFlexObject, index) {
			if (index === 0) {
				const sParentVersion = getPropertyFromVersionsModel("/persistedVersion", {
					layer: oFlexObject.getLayer(),
					reference: oFlexObject.getFlexObjectMetadata().reference
				});
				// TODO: use condensing route to reduce backend requests
				// need to save first entry to generate draft version in backend
				return saveObject(oFlexObject, mCompVariantsMapByPersistencyKey, oStoredResponse, sParentVersion)
				.then(function() {
					const aPromises = aFlexObjects.map(function(oFlexObject, index) {
						if (index !== 0) {
							const sDraftVersion = sParentVersion ? Version.Number.Draft : undefined;
							return saveObject(oFlexObject, mCompVariantsMapByPersistencyKey, oStoredResponse, sDraftVersion);
						}
						return undefined;
					});
					return Promise.all(aPromises);
				});
			}
			return undefined;
		});
		// TODO Consider not rejecting with first error, but wait for all promises and collect the results
		return Promise.all(aPromises);
	};

	/**
	 * Saves all changes and variants of all smart variant managements associated with the app
	 *
	 * @param {string} sReference - Flex reference of the app
	 * @returns {Promise} Promise resolving with an array of responses or rejecting with the first error
	 * @private
	 */
	CompVariantState.persistAll = async function(sReference) {
		const mCompEntities = _omit(FlexState.getCompVariantsMap(sReference), "_getOrCreate", "_initialize");
		// Calls must be done sequentially because the backend can't do this in parallel
		// and first call might create draft which requires other parameters for following calls
		const aResponses = [];
		const aSVMControls = getSVMControls(sReference);
		for (const sPersistencyKey of Object.keys(mCompEntities)) {
			const oResponse = await CompVariantState.persist({
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
			aResponses.push(oResponse);
		}
		// persistAll can be triggered from e.g. Key User Adaptation, making the controls no longer dirty
		aSVMControls.forEach((oSVMControl) => {
			oSVMControl.setModified(false);
		});
		return aResponses;
	};

	/**
	 * Checks if dirty changes on SmartVariantManagement exist for a flex persistence associated by a reference;
	 *
	 * @param {string} sReference - Flex reference of the app
	 * @returns {boolean} <code>true</code> if dirty changes exist
	 */
	CompVariantState.hasDirtyChanges = function(sReference) {
		var mCompEntities = FlexState.getCompVariantsMap(sReference);
		var aEntities = [];
		for (var sPersistencyKey in mCompEntities) {
			var mCompVariantsOfPersistencyKey = mCompEntities[sPersistencyKey];
			for (var sId in mCompVariantsOfPersistencyKey.byId) {
				aEntities.push(mCompVariantsOfPersistencyKey.byId[sId]);
			}
		}
		return aEntities.some(function(oFlexObject) {
			return oFlexObject.getLayer() // oData variants do not have a layer and must not be identified as dirty
				&& oFlexObject.getState() !== States.LifecycleState.PERSISTED
				&& oFlexObject.getVariantId?.() !== "*standard*";
		});
	};

	/**
	 * Takes an array of FlexObjects and filters out any changes of a deleted variant
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aFlexObjects - FlexObjects to be filtered
	 * @param {string} sReference - Flex reference of the application
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Filtered list of FlexObjects
	 */
	CompVariantState.filterHiddenFlexObjects = function(aFlexObjects, sReference) {
		const mCompEntities = _omit(FlexState.getCompVariantsMap(sReference), "_getOrCreate", "_initialize");
		const aVariants = [];
		for (const sPersistencyKey in mCompEntities) {
			mCompEntities[sPersistencyKey].variants.forEach((oVariant) => aVariants.push(oVariant.getId()));
		}
		return aFlexObjects.filter((oFlexObject) => {
			if (oFlexObject.getFileType() === "change") {
				if (oFlexObject.getChangeType() === "updateVariant") {
					return aVariants.includes(oFlexObject.getSelector().variantId);
				}
				if (oFlexObject.getChangeType() === "defaultVariant") {
					// Set default of Standard (empty variant name) or existing variant is valid
					return !oFlexObject.getContent().defaultVariantName || aVariants.includes(oFlexObject.getContent().defaultVariantName);
				}
			}
			return true;
		});
	};

	return CompVariantState;
});