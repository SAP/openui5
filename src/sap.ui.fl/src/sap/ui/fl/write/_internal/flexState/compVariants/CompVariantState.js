/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/restricted/_pick",
	"sap/base/util/UriParameters",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariantRevertData",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/RevertData",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexObjects/UpdatableChange",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantMerger",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/write/api/Version"
], function(
	_omit,
	_pick,
	UriParameters,
	Change,
	Layer,
	Utils,
	CompVariant,
	CompVariantRevertData,
	FlexObjectFactory,
	RevertData,
	States,
	UpdatableChange,
	FlexState,
	CompVariantMerger,
	Settings,
	Storage,
	Versions,
	Version
) {
	"use strict";

	function isVersionIndependentOrInDraft(oChange, mPropertyBag) {
		var aDraftFilenames = getPropertyFromVersionsModel("/draftFilenames", mPropertyBag);
		if (aDraftFilenames) {
			return oChange.getState() === Change.states.NEW
			|| aDraftFilenames.includes(oChange.getId());
		}
		return true;
	}

	function getPropertyFromVersionsModel(sPropertyName, mPropertyBag) {
		var mPropertyBag = {
			reference: Utils.normalizeReference(mPropertyBag.reference),
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
		var sPackageName = oFlexObject.getPackage();
		var bNotTransported = !sPackageName || sPackageName === "$TMP";

		return bSameLayer && bNotTransported && isVersionIndependentOrInDraft(oFlexObject, mPropertyBag);
	}

	function getSubSection(mMap, oFlexObject) {
		if (oFlexObject.isVariant()) {
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

	function updateObjectAndStorage(oFlexObject, oStoredResponse, sParentVersion) {
		return Storage.update({
			flexObject: oFlexObject.convertToFileContent ? oFlexObject.convertToFileContent() : oFlexObject.getDefinition(),
			layer: oFlexObject.getLayer(),
			transport: oFlexObject.getRequest(),
			parentVersion: sParentVersion
		}).then(function (result) {
			// update FlexObject and versionModel
			if (result && result.response) {
				oFlexObject.setResponse(result.response);
				if (sParentVersion) {
					Versions.onAllChangesSaved({
						reference: result.response.reference,
						layer: result.response.layer
					});
				}
			} else {
				oFlexObject.setState(States.PERSISTED);
			}
		}).then(function () {
			// update StorageResponse
			var aObjectArray = getSubSection(oStoredResponse.changes.comp, oFlexObject);
			var oFileContent = oFlexObject.convertToFileContent ? oFlexObject.convertToFileContent() : oFlexObject.getDefinition();
			updateArrayByName(aObjectArray, oFileContent);
			return oFileContent;
		});
	}

	function removeFromArrayById(aObjectArray, sObjectId) {
		for (var i = aObjectArray.length - 1; i >= 0; i--) {
			//aObjectArray can come from either back end response or flex state
			//In the first case, the fileName is a direct property of object
			//In the second case, it can be obtained from getId() function
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

	function deleteObjectAndRemoveFromStorage(oFlexObject, mCompVariantsMapByPersistencyKey, oStoredResponse, sParentVersion) {
		var oFileContent = oFlexObject.convertToFileContent ? oFlexObject.convertToFileContent() : oFlexObject.getDefinition();
		return Storage.remove({
			flexObject: oFileContent,
			layer: oFlexObject.getLayer(),
			transport: oFlexObject.getRequest(),
			parentVersion: sParentVersion
		}).then(function () {
			// update CompVariantsMap
			removeFromCompVariantsMap(oFlexObject, mCompVariantsMapByPersistencyKey);
		}).then(function () {
			// update StorageResponse
			removeFromArrayById(
				getSubSection(oStoredResponse.changes.comp, oFlexObject),
				oFileContent.fileName
			);
			return oFileContent;
		});
	}

	function getTexts(mPropertyBag) {
		var mInternalTexts = {};
		if (typeof (mPropertyBag.texts) === "object") {
			Object.keys(mPropertyBag.texts).forEach(function (key) {
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
			[States.NEW, States.DIRTY, States.DELETED].includes(oFlexObject.getState());
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

		var sLayer = UriParameters.fromQuery(window.location.search).get("sap-ui-layer") || "";
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
	 * @returns {sap.ui.fl.Change} Created or updated change object in charge for setting the default variant
	 */
	CompVariantState.setDefault = function (mPropertyBag) {
		var oContent = {
			defaultVariantName: mPropertyBag.defaultVariantId
		};
		// TODO: remove as soon as the development uses an IDE using rta which passes the correct parameter
		mPropertyBag.layer = mPropertyBag.layer || UriParameters.fromQuery(window.location.search).get("sap-ui-layer") || Layer.USER;

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
			oChangeParameter.support.generator = oChangeParameter.support.generator || "CompVariantState." + sChangeType;
			oChangeParameter.support.sapui5Version = sap.ui.version;

			oChange = new UpdatableChange(oChangeParameter);
			mCompVariantsMap.defaultVariants.push(oChange);
			mCompVariantsMap.byId[oChange.getId()] = oChange;
			oChange.addRevertInfo(new RevertData({
				type: CompVariantState.operationType.NewChange
			}));
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
	CompVariantState.revertSetDefaultVariantId = function (mPropertyBag) {
		var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference)._getOrCreate(mPropertyBag.persistencyKey);
		var aDefaultVariantChanges = mCompVariantsMap.defaultVariants;
		var oChange = aDefaultVariantChanges[aDefaultVariantChanges.length - 1];
		var oRevertInfo = oChange.popLatestRevertInfo();
		if (oRevertInfo.getType() === CompVariantState.operationType.ContentUpdate) {
			oChange.setContent(oRevertInfo.getContent().previousContent);
			oChange.setState(oRevertInfo.getContent().previousState);
		} else {
			oChange.setState(Change.states.DELETED);
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

		var oChangeSpecificData = mPropertyBag.changeSpecificData;

		oChangeSpecificData.layer = determineLayer(oChangeSpecificData);
		oChangeSpecificData.changeType = oChangeSpecificData.type;
		oChangeSpecificData.texts = getTexts(oChangeSpecificData);
		var oFileContent = Object.assign({}, oChangeSpecificData, _omit(mPropertyBag, "changeSpecificData"));
		var oFlexObject = FlexObjectFactory.createCompVariant(oFileContent);

		var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
		var oMapOfPersistencyKey = mCompVariantsMap._getOrCreate(mPropertyBag.persistencyKey);
		oMapOfPersistencyKey.variants.push(oFlexObject);
		oMapOfPersistencyKey.byId[oFlexObject.getId()] = oFlexObject;
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
	 * @param {object} [mPropertyBag.executeOnSelection] - Flag if the variant should be executed on selection
	 * @param {object} [mPropertyBag.contexts] - Map of contexts that restrict the visibility of the variant
	 * @param {string[]} [mPropertyBag.contexts.role] - List of roles which are allowed to see the variant
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer in which the variant removal takes place;
	 * this either updates the variant from the layer or writes a change to that layer.
	 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} The updated variant
	 */
	CompVariantState.updateVariant = function (mPropertyBag) {
		function variantCanBeUpdated(oVariant, sLayer) {
			var bSameLayer = oVariant.getLayer() === sLayer;
			var sPackageName = oVariant.getPackage();
			var bNotTransported = !sPackageName || sPackageName === "$TMP";
			// in case changes were already done within the layer, no update of the variant can be done to safeguard the execution order
			var bIsChangedOnLayer = oVariant.getChanges().some(function (oChange) {
				return oChange.getLayer() === sLayer;
			});
			return oVariant.getPersisted() && bSameLayer && bNotTransported && !bIsChangedOnLayer && isVersionIndependentOrInDraft(oVariant, mPropertyBag);
		}

		function getLatestUpdatableChange(oVariant) {
			return oVariant.getChanges().reverse().find(function (oChange) {
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
					previousExecuteOnSelection: oVariant.getExecuteOnSelection(),
					previousContexts: oVariant.getContexts(),
					previousName: oVariant.getName()
				}
			};
			oVariant.addRevertData(new CompVariantRevertData(oRevertData));
		}

		function updateVariant(mPropertyBag, oVariant) {
			storeRevertDataInVariant(mPropertyBag, oVariant, CompVariantState.operationType.ContentUpdate);

			if (mPropertyBag.executeOnSelection !== undefined) {
				oVariant.storeExecuteOnSelection(mPropertyBag.executeOnSelection);
			}
			if (mPropertyBag.favorite !== undefined) {
				oVariant.storeFavorite(mPropertyBag.favorite);
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
			var aRevertData = oChange.getRevertData() || [];
			var oChangeContent = oChange.getContent();
			var oRevertData = {
				previousContent: Object.assign({}, oChangeContent),
				previousState: oChange.getState(),
				change: _pick(Object.assign({}, mPropertyBag), ["favorite", "executeOnSelection", "contexts", "content", "name"])
			};
			aRevertData.push(oRevertData);
			oChange.setRevertData(aRevertData);
			if (mPropertyBag.executeOnSelection !== undefined) {
				oChangeContent.executeOnSelection = mPropertyBag.executeOnSelection;
			}
			if (mPropertyBag.favorite !== undefined) {
				oChangeContent.favorite = mPropertyBag.favorite;
			}
			if (mPropertyBag.contexts) {
				oChangeContent.contexts = mPropertyBag.contexts;
			}
			if (mPropertyBag.content) {
				oChangeContent.variantContent = mPropertyBag.content;
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
				var mCompVariantsMap = FlexState.getCompVariantsMap(oChange.getComponent());
				var sPersistencyKey = oChange.getSelector().persistencyKey;
				mCompVariantsMap[sPersistencyKey].changes.push(oChange);
				mCompVariantsMap[sPersistencyKey].byId[oChange.getId()] = oChange;
			}

			var oChangeDefinition = Change.createInitialFileContent({
				changeType: "updateVariant",
				layer: sLayer,
				fileType: "change",
				reference: mPropertyBag.reference,
				packageName: mPropertyBag.packageName,
				content: {},
				selector: {
					persistencyKey: mPropertyBag.persistencyKey,
					variantId: oVariant.getVariantId()
				}
			});

			["favorite", "executeOnSelection", "contexts"].forEach(function (sPropertyName) {
				if (mPropertyBag[sPropertyName] !== undefined) {
					oChangeDefinition.content[sPropertyName] = mPropertyBag[sPropertyName];
				}
			});
			if (mPropertyBag.content !== undefined) {
				oChangeDefinition.content.variantContent = mPropertyBag.content;
			}
			if (mPropertyBag.name) {
				oChangeDefinition.texts.variantName = {
					value: mPropertyBag.name,
					type: "XFLD"
				};
			}

			var oChange = new Change(oChangeDefinition);
			if (mPropertyBag.transportId) {
				oChange.setRequest(mPropertyBag.transportId);
			}
			addChange(oChange);
			storeRevertDataInVariant(mPropertyBag, oVariant, CompVariantState.operationType.NewChange, oChange);
			CompVariantMerger.applyChangeOnVariant(oVariant, oChange);
		}

		var oVariant = getVariantById(mPropertyBag);
		var sLayer = determineLayer(mPropertyBag);

		if (variantCanBeUpdated(oVariant, sLayer)) {
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
	CompVariantState.removeVariant = function (mPropertyBag) {
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

		if (sCurrentState === States.NEW) {
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
	CompVariantState.revert = function (mPropertyBag) {
		function removeChange(oChange) {
			var sPersistencyKey = oChange.getSelector().persistencyKey;
			var mCompVariantsMap = FlexState.getCompVariantsMap(oChange.getComponent());
			delete mCompVariantsMap[sPersistencyKey].byId[oChange.getId()];
			mCompVariantsMap[sPersistencyKey].changes = mCompVariantsMap[sPersistencyKey].changes.filter(function (oChangeInMap) {
				return oChangeInMap !== oChange;
			});
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
					Object.assign({
						name: oRevertDataContent.previousName,
						content: oRevertDataContent.previousContent,
						favorite: oRevertDataContent.previousFavorite,
						executeOnSelection: oRevertDataContent.previousExecuteOnSelection,
						contexts: oRevertDataContent.previousContexts
					},
					_pick(mPropertyBag, ["reference", "persistencyKey", "id"])
					));
				break;
			case CompVariantState.operationType.NewChange:
				oChange = oVariantRevertData.getChange();
				oVariant.removeChange(oChange);
				removeChange(oChange);
				revertVariantChange(
					oVariant,
					Object.assign(
						{
							name: oRevertDataContent.previousName,
							content: oRevertDataContent.previousContent,
							favorite: oRevertDataContent.previousFavorite,
							executeOnSelection: oRevertDataContent.previousExecuteOnSelection,
							contexts: oRevertDataContent.previousContexts
						},
						_pick(mPropertyBag, ["reference", "persistencyKey", "id"])
					));
				break;
			case CompVariantState.operationType.UpdateVariantViaChangeUpdate:
				oChange = oVariantRevertData.getChange();
				revertVariantChange(
					oVariant,
					Object.assign(
						{
							name: oRevertDataContent.previousName,
							content: oRevertDataContent.previousContent,
							favorite: oRevertDataContent.previousFavorite,
							executeOnSelection: oRevertDataContent.previousExecuteOnSelection,
							contexts: oRevertDataContent.previousContexts
						},
						_pick(mPropertyBag, ["reference", "persistencyKey", "id"])
					));
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
		aChanges.forEach(function (oChange) {
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
	CompVariantState.persist = function(mPropertyBag) {
		function writeObjectAndAddToState(oFlexObject, oStoredResponse, sParentVersion) {
			// TODO: remove this line as soon as layering and a condensing is in place
			return Storage.write({
				flexObjects: [oFlexObject.convertToFileContent ? oFlexObject.convertToFileContent() : oFlexObject.getDefinition()],
				layer: oFlexObject.getLayer(),
				transport: oFlexObject.getRequest(),
				isLegacyVariant: oFlexObject.isVariant(),
				parentVersion: sParentVersion
			}).then(function (result) {
				// updateFlexObject and versionModel
				if (result && result.response && result.response[0]) {
					oFlexObject.setResponse(result.response[0]);
					if (sParentVersion) {
						Versions.onAllChangesSaved({
							reference: result.response[0].reference,
							layer: result.response[0].layer
						});
					}
				} else {
					oFlexObject.setState(States.PERSISTED);
				}
			}).then(function () {
				// update StorageResponse
				var oFileContent = oFlexObject.convertToFileContent ? oFlexObject.convertToFileContent() : oFlexObject.getDefinition();
				getSubSection(oStoredResponse.changes.comp, oFlexObject).push(oFileContent);
				return oFileContent;
			});
		}

		function saveObject(oFlexObject, mCompVariantsMapByPersistencyKey, oStoredResponse, sParentVersion) {
			switch (oFlexObject.getState()) {
				case States.NEW:
					ifVariantClearRevertData(oFlexObject);
					return writeObjectAndAddToState(oFlexObject, oStoredResponse, sParentVersion);
				case States.DIRTY:
					ifVariantClearRevertData(oFlexObject);
					return updateObjectAndStorage(oFlexObject, oStoredResponse, sParentVersion);
				case States.DELETED:
					ifVariantClearRevertData(oFlexObject);
					return deleteObjectAndRemoveFromStorage(oFlexObject, mCompVariantsMapByPersistencyKey, oStoredResponse, sParentVersion);
				default:
					break;
			}
		}

		var sReference = mPropertyBag.reference;
		var sPersistencyKey = mPropertyBag.persistencyKey;
		var mCompVariantsMap = FlexState.getCompVariantsMap(sReference);
		var mCompVariantsMapByPersistencyKey = mCompVariantsMap._getOrCreate(sPersistencyKey);

		return FlexState.getStorageResponse(sReference)
			.then(function(oStoredResponse) {
				var aFlexObjects = getAllCompVariantObjects(mCompVariantsMapByPersistencyKey).filter(needsPersistencyCall);
				var aPromises = aFlexObjects.map(function(oFlexObject, index) {
					if (index === 0) {
						var sParentVersion = getPropertyFromVersionsModel("/persistedVersion", {
							layer: oFlexObject.getLayer(),
							reference: oFlexObject.getFlexObjectMetadata ?
								oFlexObject.getFlexObjectMetadata().reference :
								oFlexObject.getDefinition().reference
						});
						// TODO: use condensing route to reduce backend requests
						// need to save first entry to generate draft version in backend
						return saveObject(oFlexObject, mCompVariantsMapByPersistencyKey, oStoredResponse, sParentVersion)
						.then(function() {
							var aPromises = aFlexObjects.map(function(oFlexObject, index) {
								if (index !== 0) {
									var sDraftVersion = sParentVersion ? Version.Number.Draft : undefined;
									return saveObject(oFlexObject, mCompVariantsMapByPersistencyKey, oStoredResponse, sDraftVersion);
								}
							});
							return aPromises;
						});
					}
				});
				// TODO Consider not rejecting with first error, but wait for all promises and collect the results
				return Promise.all(aPromises);
			});
	};

	/**
	 * Saves all changes and variants of all smart variant managements associated with the app
	 *
	 * @param {string} sReference - Flex reference of the app
	 * @returns {Promise} Promise resolving with an array of responses or rejecting with the first error
	 * @private
	 */
	CompVariantState.persistAll = function(sReference) {
		var mCompEntities = _omit(FlexState.getCompVariantsMap(sReference), "_getOrCreate", "_initialize");
		 var aPromises = Object.keys(mCompEntities).map(function(sPersistencyKey) {
			return CompVariantState.persist({
				reference: sReference,
				persistencyKey: sPersistencyKey
			});
		});
		return Promise.all(aPromises);
	};

	return CompVariantState;
});