/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/restricted/_pick",
	"sap/base/util/UriParameters",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Change",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariantRevertData",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/Storage"
], function(
	_omit,
	_pick,
	UriParameters,
	Layer,
	Change,
	CompVariant,
	CompVariantRevertData,
	Utils,
	FlexState,
	Settings,
	Storage
) {
	"use strict";

	function getCategory(oChangeContent) {
		switch (oChangeContent.fileType) {
			case "change":
			case "variant":
				return "changes";
			case "comp_variant_change":
				return "compVariantChanges";
			default:
		}
	}

	function addChange(mPropertyBag, oFlexObjects) {
		var oChangeContent = mPropertyBag.changeToBeAddedOrDeleted.getDefinition();
		var sChangeCategory = getCategory(oChangeContent);
		oFlexObjects[sChangeCategory].push(oChangeContent);
		var sId = oChangeContent.fileName;
		var mCompVariantsMapById = FlexState.getCompEntitiesByIdMap(mPropertyBag.reference);
		mCompVariantsMapById[sId] = oChangeContent;
	}

	function deleteChange(mPropertyBag, oFlexObjects) {
		var oChangeContent = mPropertyBag.changeToBeAddedOrDeleted.getDefinition();
		var sChangeCategory = getCategory(oChangeContent);
		var iChangeContentIndex = -1;
		oFlexObjects[sChangeCategory].some(function(oExistingChangeContent, iIndex) {
			if (oExistingChangeContent.fileName === oChangeContent.fileName) {
				iChangeContentIndex = iIndex;
				return true;
			}
		});
		if (iChangeContentIndex > -1) {
			oFlexObjects[sChangeCategory].splice(iChangeContentIndex, 1);
		}

		var mCompVariantsMapById = FlexState.getCompEntitiesByIdMap(mPropertyBag.reference);
		delete mCompVariantsMapById[oChangeContent.fileName];
	}

	function createOrUpdateChange(mPropertyBag, oContent, sChangeType) {
		var mCompVariantsByIdMap = FlexState.getCompVariantsMap(mPropertyBag.reference)._getOrCreate(mPropertyBag.persistencyKey);
		// only create a new entity in case none exists
		if (!mCompVariantsByIdMap[sChangeType]) {
			var oChangeParameter = {
				fileName: Utils.createDefaultFileName(sChangeType),
				fileType: "change",
				changeType: sChangeType,
				layer: mPropertyBag.layer || Layer.USER,
				namespace: Utils.createNamespace(mPropertyBag, "changes"),
				reference: mPropertyBag.reference,
				selector: {
					persistencyKey: mPropertyBag.persistencyKey
				},
				support: mPropertyBag.support || {}
			};
			oChangeParameter.support.generator = oChangeParameter.support.generator || "CompVariantState." + sChangeType;
			oChangeParameter.support.sapui5Version = sap.ui.version;

			var oChange = new Change(oChangeParameter);
			mCompVariantsByIdMap[sChangeType] = oChange;
			FlexState.getCompEntitiesByIdMap(mPropertyBag.reference)[oChange.getId()] = oChange;
		}

		//TODO: react accordingly on layering as soon as an update is not possible (versioning / different layer)
		mCompVariantsByIdMap[sChangeType].setContent(oContent);

		return mCompVariantsByIdMap[sChangeType];
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
			flexObjects : [oFlexObject.getDefinition()],
			layer : oFlexObject.getLayer(),
			transport : oFlexObject.getRequest(),
			isLegacyVariant : oFlexObject.isVariant()
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

	function deleteObjectAndRemoveFromStorage(oFlexObject, mCompEntitiesById, mCompVariantsMapByPersistencyKey, oStoredResponse) {
		return Storage.remove({
			flexObject: oFlexObject.getDefinition(),
			layer: oFlexObject.getLayer(),
			transport: oFlexObject.getRequest()
		}).then(function () {
			// update compVariantsMap
			delete mCompEntitiesById[oFlexObject.getId()];
			if (oFlexObject.getChangeType() === "standardVariant") {
				mCompVariantsMapByPersistencyKey.standardVariant = undefined;
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
			.concat(mCompVariantsMapByPersistencyKey.standardVariant);
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
		if (!mPropertyBag.isVariant) {
			return Layer.CUSTOMER;
		}

		var bPublicLayerAvailable = Settings.getInstanceOrUndef().isPublicLayerAvailable();
		return bPublicLayerAvailable ? Layer.PUBLIC : Layer.CUSTOMER;
	}

	function getVariantById(mPropertyBag) {
		var mCompVariantsByIdMap = FlexState.getCompEntitiesByIdMap(mPropertyBag.reference);
		return mCompVariantsByIdMap[mPropertyBag.id];
	}

	function ifVariantClearRevertData(oFlexObject) {
		if (oFlexObject instanceof CompVariant) {
			oFlexObject.removeAllRevertInfo();
		}
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
	 * Creates a change to set if a given standard variant should be executed automatically or not.
	 *
	 * @param {object} mPropertyBag - Map of parameters, see below
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {boolean} mPropertyBag.persistencyKey - Flag if the variant should be executed
	 * @param {string} mPropertyBag.executeOnSelect - ID of the variant which should be selected at start-up
	 * @param {string} [mPropertyBag.generator] - Generator of changes
	 * @param {string} [mPropertyBag.compositeCommand] - Name of the command calling the API
	 * @returns {sap.ui.fl.Change} Created or updated change object in charge for setting the executeOnSelect flag in the standard variant
	 */
	CompVariantState.setExecuteOnSelect = function (mPropertyBag) {
		var oContent = {
			executeOnSelect: mPropertyBag.executeOnSelect
		};

		return createOrUpdateChange(mPropertyBag, oContent, "standardVariant");
	};

	/**
	 * Adds a new variant or change (addFavorite & removeFavorite) for a smart variant, such as filter bar or table, and returns the ID of the new change.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {string} mPropertyBag.persistencyKey - ID of the variant management internal identifier
	 * @param {boolean} [mPropertyBag.generator] - Name of the tool creating the variant for support analysis
	 * @param {boolean} [mPropertyBag.command] - Name of the sa.ui.rta-command for support analysis
	 * @param {object} mPropertyBag.changeSpecificData - Data set defining the object to be added
	 * @param {sap.ui.fl.Layer} mPropertyBag.changeSpecificData.layer - Layer to which the variant should be written
	 * @param {string} mPropertyBag.changeSpecificData.type - Type <filterVariant, tableVariant, etc>
	 * @param {object} mPropertyBag.changeSpecificData.texts - A map object containing all translatable texts which are referenced within the file
	 * @param {object} mPropertyBag.changeSpecificData.content - Content of the new change
	 * @param {object} [mPropertyBag.changeSpecificData.favorite] - Indicates if the change is added as favorite
	 * @param {object} [mPropertyBag.changeSpecificData.executeOnSelect] - Indicates if the executeOnSelect flag should be set
	 * @param {string} [mPropertyBag.changeSpecificData.ODataService] - Name of the OData service --> can be null
	 * @param {boolean} [mPropertyBag.changeSpecificData.isVariant] - Indicates if the change is a variant
	 * @param {boolean} [mPropertyBag.changeSpecificData.isUserDependent] - Indicates if a change is only valid for the current user
	 * @param {string} [mPropertyBag.changeSpecificData.packageName] - Package name for the new entity, <default> is $tmp
	 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} Created variant object instance
	 * @public
	 */
	CompVariantState.add = function(mPropertyBag) {
		if (!mPropertyBag) {
			return undefined;
		}

		var oChangeSpecificData = mPropertyBag.changeSpecificData;

		var oInfo = {
			changeType: oChangeSpecificData.type,
			service: oChangeSpecificData.ODataService,
			content: oChangeSpecificData.content,
			reference: mPropertyBag.reference,
			fileType: oChangeSpecificData.isVariant ? "variant" : "change",
			packageName: oChangeSpecificData.packageName,
			layer: determineLayer(oChangeSpecificData),
			favorite: !!oChangeSpecificData.favorite,
			executeOnSelect: !!oChangeSpecificData.executeOnSelect,
			selector: {
				persistencyKey: mPropertyBag.persistencyKey
			},
			texts: getTexts(oChangeSpecificData),
			command: mPropertyBag.command,
			generator: mPropertyBag.generator
		};

		var oClass = oChangeSpecificData.isVariant ? CompVariant : Change;
		var oFile = oClass.createInitialFileContent(oInfo);

		var oFlexObject = new oClass(oFile);

		var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
		var oMapOfPersistencyKey = mCompVariantsMap._getOrCreate(mPropertyBag.persistencyKey);

		getSubSection(oMapOfPersistencyKey, oFlexObject).push(oFlexObject);
		var sId = oFlexObject.getId();
		var mCompVariantsMapById = FlexState.getCompEntitiesByIdMap(mPropertyBag.reference);
		mCompVariantsMapById[sId] = oFlexObject;
		return oFlexObject;
	};

	function storeRevertDataInVariant(mPropertyBag, oVariant) {
		var aUnchangedValues = [];
		if (mPropertyBag.favorite === undefined) {
			aUnchangedValues.push("favorite");
		}
		if (mPropertyBag.executeOnSelect === undefined) {
			aUnchangedValues.push("executeOnSelect");
		}
		var oRevertData = {
			type: CompVariantState.operationType.ContentUpdate,
			content: {
				previousState: oVariant.getState(),
				previousContent: oVariant.getContent(),
				previousFavorite: oVariant.getFavorite(),
				previousExecuteOnSelect: oVariant.getExecuteOnSelect()
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
	 * @param {object} [mPropertyBag.executeOnSelect] - Flag if the variant should be executed on selection
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer in which the variant removal takes place;
	 * this either updates the variant from the layer or writes a change to that layer.
	 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} The updated variant
	 */
	CompVariantState.updateVariant = function (mPropertyBag) {
		var oVariant = getVariantById(mPropertyBag);

		// TODO: update non-fl variants and remove limitation
		if (!oVariant) {
			throw new Error("Variant to be modified is not persisted via sap.ui.fl.");
		}
		if (!mPropertyBag.revert) {
			storeRevertDataInVariant(mPropertyBag, oVariant);
		}

		// TODO: check if it is an update or create corresponding changes
		if (mPropertyBag.name) {
			oVariant.setText("variantName", mPropertyBag.name);
		}
		var oContent = oVariant.getContent();
		var bExecuteOnSelect = oContent.executeOnSelect;
		var bFavorite = oContent.favorite;
		var oContentToBeWritten = mPropertyBag.content || oContent;

		if (mPropertyBag.favorite !== undefined) {
			oContentToBeWritten.favorite = mPropertyBag.favorite;
		} else if (!(mPropertyBag.revert && oContentToBeWritten.favorite !== undefined) && bFavorite !== undefined) {
			oContentToBeWritten.favorite = bFavorite;
		}

		if (mPropertyBag.executeOnSelect !== undefined) {
			oContentToBeWritten.executeOnSelect = mPropertyBag.executeOnSelect;
		} else if (!(mPropertyBag.revert && oContentToBeWritten.executeOnSelect !== undefined) && bExecuteOnSelect !== undefined) {
			oContentToBeWritten.executeOnSelect = bExecuteOnSelect;
		}

		oVariant.setContent(oContentToBeWritten);
		// also update the runtime instance
		oVariant.setFavorite(!!oContentToBeWritten.favorite);
		oVariant.setExecuteOnSelect(!!oContentToBeWritten.executeOnSelect);

		return oVariant;
	};

	/**
	 * Defines the different types of operations done on a variant.
	 * - StateUpdate only changes the variants persistence status. I.e. a removeVariant call only sets the variant to <code>DELETED</code>
	 * - ContentUpdate may contain all content related updates including name, favorite, executeOnSelect or values and data
	 *
	 * @enum {string}
	 */
	CompVariantState.operationType = {
		StateUpdate: "StateUpdate",
		ContentUpdate: "ContentUpdate"
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

		var oRevertData = oVariant.getRevertInfo().pop();
		var oRevertDataContent = oRevertData.getContent();

		switch (oRevertData.getType()) {
			case CompVariantState.operationType.ContentUpdate:
				CompVariantState.updateVariant(
					Object.assign({
						revert: true,
						name: oRevertDataContent.previousName,
						content: oRevertDataContent.previousContent,
						favorite: oRevertDataContent.previousFavorite,
						executeOnSelect: oRevertDataContent.previousExecuteOnSelect
					},
					_pick(mPropertyBag, ["reference", "persistencyKey", "id"])
				));
				break;
			case CompVariantState.operationType.StateUpdate:
			default:
				break;
		}

		oVariant.setState(oRevertDataContent.previousState);
		oVariant.removeRevertInfo(oRevertData);

		return oVariant;
	};


	/**
	 * Adds the definitions of flex objects to the FlexState in their current state (dirty with NEW or DELETE).
	 * This function must be called after the CompVariantsMap for the given application was created.
	 *
	 * @param {object} mPropertyBag - Map of parameters, see below
	 * @param {string} mPropertyBag.reference - Flex reference of the app
	 * @param {sap.ui.fl.Change} mPropertyBag.changeToBeAddedOrDeleted - Change object which should be modified
	 */
	CompVariantState.updateState = function(mPropertyBag) {
		var oFlexObjects = FlexState.getFlexObjectsFromStorageResponse(mPropertyBag.reference);

		if (mPropertyBag.changeToBeAddedOrDeleted) {
			switch (mPropertyBag.changeToBeAddedOrDeleted.getPendingAction()) {
				case Change.states.NEW:
					addChange(mPropertyBag, oFlexObjects);
					break;
				case Change.states.DELETED:
					deleteChange(mPropertyBag, oFlexObjects);
					break;
				default:
					break;
			}
		}
	};

	/**
	 * Saves/flushes all current changes and variants of a smart variant.
	 *
	 * @param {object} mPropertyBag - Map of parameters, see below
	 * @param {string} mPropertyBag.reference - Flex reference of the app
	 *
	 * @returns {Promise} Promise resolving with an array of responses or rejecting with the first error
	 * @private
	 */
	CompVariantState.persist = function(mPropertyBag) {
		var sReference = mPropertyBag.reference;
		var sPersistencyKey = mPropertyBag.persistencyKey;
		var mCompVariantsMap = FlexState.getCompVariantsMap(sReference);
		var mCompVariantsMapByPersistencyKey = mCompVariantsMap._getOrCreate(sPersistencyKey);
		var mCompEntitiesById = FlexState.getCompEntitiesByIdMap(sReference);
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
						return deleteObjectAndRemoveFromStorage(oFlexObject, mCompEntitiesById, mCompVariantsMapByPersistencyKey, oStoredResponse);
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
		var mCompEntities = _omit(FlexState.getCompVariantsMap(sReference), "_getOrCreate");
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