/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/restricted/_pick",
	"sap/base/util/UriParameters",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Change",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariantRevertData",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantMerger",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/Storage"
], function(
	_omit,
	_pick,
	UriParameters,
	Layer,
	Change,
	ChangePersistenceFactory,
	CompVariant,
	CompVariantRevertData,
	Utils,
	FlexState,
	CompVariantMerger,
	Settings,
	Storage
) {
	"use strict";

	function addChange(oChange) {
		var oChangeContent = oChange.getDefinition();
		var mCompVariantsMap = FlexState.getCompVariantsMap(oChange.getComponent());
		var sPersistencyKey = oChange.getSelector().persistencyKey;
		mCompVariantsMap[sPersistencyKey].changes.push(oChange);
		mCompVariantsMap[sPersistencyKey].byId[oChange.getId()] = oChange;
		return oChangeContent;
	}

	function removeChange(oChange) {
		var sPersistencyKey = oChange.getSelector().persistencyKey;
		var mCompVariantsMap = FlexState.getCompVariantsMap(oChange.getComponent());
		delete mCompVariantsMap[sPersistencyKey].byId[oChange.getId()];
		mCompVariantsMap[sPersistencyKey].changes = mCompVariantsMap[sPersistencyKey].changes.filter(function (oChangeInMap) {
			return oChangeInMap !== oChange;
		});
	}

	function isChangeUpdatable(oChange, sLayer) {
		if (!["defaultVariant", "updateVariant"].includes(oChange.getChangeType())) {
			return false;
		}

		var bSameLayer = oChange.getLayer() === sLayer;
		var sPackageName = oChange.getDefinition().packageName;
		var bNotTransported = !sPackageName || sPackageName === "$TMP";

		return bSameLayer && bNotTransported;
	}

	function createOrUpdateChange(mPropertyBag, oContent, sChangeType) {
		mPropertyBag.layer = mPropertyBag.layer || Layer.USER;
		var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference)._getOrCreate(mPropertyBag.persistencyKey);
		var sCategory = sChangeType === "standardVariant" ? "standardVariantChange" : sChangeType;
		var oChange = mCompVariantsMap[sCategory];

		// only create a new entity in case none exists
		if (!oChange || !isChangeUpdatable(oChange, mPropertyBag.layer)) {
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

			var oNewChange = new Change(oChangeParameter);
			mCompVariantsMap[sCategory] = oNewChange;
			mCompVariantsMap.byId[oNewChange.getId()] = oNewChange;
		} else {
			oChange.setContent(oContent);
		}
		return mCompVariantsMap[sCategory];
	}

	function removeFromArrayByName(aObjectArray, oFlexObject) {
		for (var i = aObjectArray.length - 1; i >= 0; i--) {
			//aObjectArray can come from either back end response or flex state
			//In the first case, the fileName is a direct property of object
			//In the second case, it can be obtained from getFileName() function
			if ((aObjectArray[i].fileName || aObjectArray[i].getFileName()) === oFlexObject.fileName) {
				aObjectArray.splice(i, 1);
				break;
			}
		}
	}

	function getSubSection(mMap, oFlexObject) {
		if (oFlexObject.isVariant()) {
			return mMap.variants;
		}

		switch (oFlexObject.getChangeType()) {
			case "defaultVariant":
				return mMap.defaultVariants;
			case "standardVariant":
				return mMap.standardVariants;
			default:
				return mMap.changes;
		}
	}

	function writeObjectAndAddToState(oFlexObject, oStoredResponse) {
		// TODO: remove this line as soon as layering and a condensing is in place
		return Storage.write({
			flexObjects: [oFlexObject.getDefinition()],
			layer: oFlexObject.getLayer(),
			transport: oFlexObject.getRequest(),
			isLegacyVariant: oFlexObject.isVariant()
		}).then(function (result) {
			// updateFlexObject
			if (result && result.response && result.response[0]) {
				oFlexObject.setResponse(result.response[0]);
			} else {
				oFlexObject.setState(Change.states.PERSISTED);
			}

			return oStoredResponse;
		}).then(function (oStoredResponse) {
			// update StorageResponse
			getSubSection(oStoredResponse.changes.comp, oFlexObject).push(oFlexObject.getDefinition());
			return oFlexObject.getDefinition();
		});
	}

	function updateArrayByName(aObjectArray, oFlexObject) {
		for (var i = 0; i < aObjectArray.length; i++) {
			if (aObjectArray[i].fileName === oFlexObject.fileName) {
				aObjectArray.splice(i, 1, oFlexObject);
				break;
			}
		}
	}

	function updateObjectAndStorage(oFlexObject, oStoredResponse) {
		return Storage.update({
			flexObject: oFlexObject.getDefinition(),
			layer: oFlexObject.getLayer(),
			transport: oFlexObject.getRequest()
		}).then(function (result) {
			// update FlexObject
			if (result && result.response) {
				oFlexObject.setResponse(result.response);
			} else {
				oFlexObject.setState(Change.states.PERSISTED);
			}

			return oStoredResponse;
		}).then(function (oStoredResponse) {
			// update StorageResponse
			var aObjectArray = getSubSection(oStoredResponse.changes.comp, oFlexObject);
			updateArrayByName(aObjectArray, oFlexObject.getDefinition());
			return oFlexObject.getDefinition();
		});
	}

	function deleteObjectAndRemoveFromStorage(oFlexObject, mCompVariantsMapByPersistencyKey, oStoredResponse) {
		return Storage.remove({
			flexObject: oFlexObject.getDefinition(),
			layer: oFlexObject.getLayer(),
			transport: oFlexObject.getRequest()
		}).then(function () {
			// update compVariantsMap
			delete mCompVariantsMapByPersistencyKey.byId[oFlexObject.getId()];
			if (oFlexObject.getChangeType() === "standardVariant") {
				mCompVariantsMapByPersistencyKey.standardVariantChange = undefined;
			} else if (oFlexObject.getChangeType() === "defaultVariant") {
				mCompVariantsMapByPersistencyKey.defaultVariant = undefined;
			} else {
				removeFromArrayByName(getSubSection(mCompVariantsMapByPersistencyKey, oFlexObject), oFlexObject.getDefinition());
			}
			return oStoredResponse;
		}).then(function (oStoredResponse) {
			// update StorageResponse
			removeFromArrayByName(getSubSection(oStoredResponse.changes.comp, oFlexObject), oFlexObject.getDefinition());
			return oFlexObject.getDefinition();
		});
	}

	function needsPersistencyCall(oFlexObject) {
		return oFlexObject &&
			(oFlexObject.getPendingAction() === "NEW"
				|| oFlexObject.getPendingAction() === "UPDATE"
				|| oFlexObject.getPendingAction() === "DELETE");
	}

	function getAllCompVariantObjects(mCompVariantsMapByPersistencyKey) {
		return mCompVariantsMapByPersistencyKey.variants
			.concat(mCompVariantsMapByPersistencyKey.changes)
			.concat(mCompVariantsMapByPersistencyKey.defaultVariant)
			.concat(mCompVariantsMapByPersistencyKey.standardVariantChange);
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
			oFlexObject.removeAllRevertInfo();
		}
	}

	function revertVariantUpdate(oVariant, mPropertyBag) {
		oVariant.storeExecuteOnSelection(mPropertyBag.executeOnSelection);
		oVariant.storeFavorite(mPropertyBag.favorite);
		oVariant.storeContexts(mPropertyBag.contexts);
		if (mPropertyBag.name) {
			oVariant.setText("variantName", mPropertyBag.name);
		}
		oVariant.storeContent(mPropertyBag.content || oVariant.getContent());
		return oVariant;
	}

	function revertVariantChange(oVariant, mPropertyBag) {
		oVariant.setExecuteOnSelection(mPropertyBag.executeOnSelection);
		oVariant.setFavorite(mPropertyBag.favorite);
		oVariant.setContexts(mPropertyBag.contexts);
		if (mPropertyBag.name) {
			oVariant.setName(mPropertyBag.name);
		}
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

		return createOrUpdateChange(mPropertyBag, oContent, "defaultVariant");
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

		var oInfo = {
			id: oChangeSpecificData.id,
			changeType: oChangeSpecificData.type,
			service: oChangeSpecificData.ODataService,
			content: oChangeSpecificData.content || {},
			reference: mPropertyBag.reference,
			fileType: "variant",
			packageName: oChangeSpecificData.packageName,
			layer: determineLayer(oChangeSpecificData),
			selector: {
				persistencyKey: mPropertyBag.persistencyKey
			},
			texts: getTexts(oChangeSpecificData),
			command: mPropertyBag.command,
			generator: mPropertyBag.generator
		};

		if (oChangeSpecificData.favorite !== undefined) {
			oInfo.favorite = oChangeSpecificData.favorite;
		}
		if (oChangeSpecificData.executeOnSelection !== undefined) {
			oInfo.executeOnSelection = oChangeSpecificData.executeOnSelection;
		}
		if (oChangeSpecificData.contexts !== undefined) {
			oInfo.contexts = oChangeSpecificData.contexts;
		}

		var oFile = CompVariant.createInitialFileContent(oInfo);
		var oFlexObject = new CompVariant(oFile);

		var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
		var oMapOfPersistencyKey = mCompVariantsMap._getOrCreate(mPropertyBag.persistencyKey);
		oMapOfPersistencyKey.variants.push(oFlexObject);
		oMapOfPersistencyKey.byId[oFlexObject.getId()] = oFlexObject;
		return oFlexObject;
	};

	function storeRevertDataInVariant(mPropertyBag, oVariant, sOperationType, oChange) {
		var oRevertData = {
			type: sOperationType,
			change: oChange,
			content: {
				previousState: oVariant.getState(),
				previousContent: oVariant.getContent(),
				previousFavorite: oVariant.getFavorite(),
				previousExecuteOnSelection: oVariant.getExecuteOnSelection(),
				previousContexts: oVariant.getContexts()
			}
		};
		if (mPropertyBag.name) {
			oRevertData.content.previousName = oVariant.getText("variantName");
		}
		oVariant.addRevertInfo(new CompVariantRevertData(oRevertData));
	}

	/**
	 * Updates a variant; this may result in an update of the variant or the creation of a change.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {string} mPropertyBag.persistencyKey - Key of the variant management
	 * @param {string} mPropertyBag.id - ID of the variant
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
			var sPackageName = oVariant.getDefinition().packageName;
			var bNotTransported = !sPackageName || sPackageName === "$TMP";
			// in case changes were already done within the layer, no update of the variant can be done to safeguard the execution order
			var bIsChangedOnLayer = oVariant.getChanges().some(function (oChange) {
				return oChange.getLayer() === sLayer;
			});

			return oVariant.getPersisted() && bSameLayer && bNotTransported && !bIsChangedOnLayer;
		}

		function getLatestUpdatableChange(oVariant) {
			return oVariant.getChanges().reverse().find(function (oChange) {
				return oChange.getChangeType() === "updateVariant" && isChangeUpdatable(oChange, sLayer);
			});
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
				oVariant.setExecuteOnSelection(mPropertyBag.executeOnSelection);
				oChangeContent.executeOnSelection = mPropertyBag.executeOnSelection;
			}
			if (mPropertyBag.favorite !== undefined) {
				oVariant.setFavorite(mPropertyBag.favorite);
				oChangeContent.favorite = mPropertyBag.favorite;
			}
			if (mPropertyBag.contexts) {
				oVariant.setContexts(mPropertyBag.contexts);
				oChangeContent.contexts = mPropertyBag.contexts;
			}
			if (mPropertyBag.content) {
				oVariant.setContent(mPropertyBag.content);
				oChangeContent.content = mPropertyBag.content;
			}
			if (mPropertyBag.name) {
				oVariant.setName(mPropertyBag.name);
				oChangeContent.texts = {
					variantName: {
						value: mPropertyBag.name,
						type: "XFLD"
					}
				};
			}
			oChange.setContent(oChangeContent);
			CompVariantMerger.applyChangeOnVariant(oVariant, oChange);
			storeRevertDataInVariant(mPropertyBag, oVariant, CompVariantState.operationType.UpdateVariantViaChangeUpdate, oChange);
		}

		function createChange(mPropertyBag, oVariant) {
			var oChangeDefinition = Change.createInitialFileContent({
				changeType: "updateVariant",
				layer: sLayer,
				fileType: "change",
				reference: mPropertyBag.reference,
				content: {},
				selector: {
					persistencyKey: mPropertyBag.persistencyKey,
					variantId: oVariant.getId()
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
			addChange(oChange);
			storeRevertDataInVariant(mPropertyBag, oVariant, CompVariantState.operationType.UpdateVariantViaChange, oChange);
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

		if (!mPropertyBag.revert) {
			var oRevertData = new CompVariantRevertData({
				type: CompVariantState.operationType.StateUpdate,
				content: {
					previousState: oVariant.getState()
				}
			});
			oVariant.addRevertInfo(oRevertData);
		}

		// TODO: check if it is an deletion or create corresponding changes
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
		var oVariant = getVariantById(mPropertyBag);

		var oVariantRevertData = oVariant.getRevertInfo().pop();
		oVariant.removeRevertInfo(oVariantRevertData);
		var oRevertDataContent = oVariantRevertData.getContent();

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
			case CompVariantState.operationType.UpdateVariantViaChange:
				var oChange = oVariantRevertData.getChange();
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
				var oChange = oVariantRevertData.getChange();
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
		var oStandardVariant = mCompVariantsMap.byId[mCompVariantsMap.standardVariant.getId()];

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
		var sReference = mPropertyBag.reference;
		var sPersistencyKey = mPropertyBag.persistencyKey;
		var mCompVariantsMap = FlexState.getCompVariantsMap(sReference);
		var mCompVariantsMapByPersistencyKey = mCompVariantsMap._getOrCreate(sPersistencyKey);
		var oStoredResponse = FlexState.getStorageResponse(sReference);

		var aPromises = getAllCompVariantObjects(mCompVariantsMapByPersistencyKey)
			.filter(needsPersistencyCall)
			.map(function (oFlexObject) {
				switch (oFlexObject.getPendingAction()) {
					case Change.states.NEW:
						ifVariantClearRevertData(oFlexObject);
						return writeObjectAndAddToState(oFlexObject, oStoredResponse);
					case Change.states.DIRTY:
						ifVariantClearRevertData(oFlexObject);
						return updateObjectAndStorage(oFlexObject, oStoredResponse);
					case Change.states.DELETED:
						ifVariantClearRevertData(oFlexObject);
						return deleteObjectAndRemoveFromStorage(oFlexObject, mCompVariantsMapByPersistencyKey, oStoredResponse);
					default:
						break;
				}
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