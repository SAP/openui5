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
	"sap/ui/fl/apply/_internal/flexState/compVariants/applyChangesOnVariant",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/initial/api/Version",
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
	applyChangesOnVariant,
	CompVariantManagementState,
	FlexState,
	Settings,
	Version,
	Storage,
	Versions
) {
	"use strict";

	function isVersionIndependentOrInDraft(oChange, mPropertyBag) {
		const aDraftFilenames = getPropertyFromVersionsModel("/draftFilenames", mPropertyBag);
		if (aDraftFilenames) {
			return oChange.getState() === States.LifecycleState.NEW
			|| aDraftFilenames.includes(oChange.getId());
		}
		return true;
	}

	function getPropertyFromVersionsModel(sPropertyName, mPropertyBag) {
		const mProperties = {
			reference: mPropertyBag.reference,
			layer: mPropertyBag.layer
		};
		if (Versions.hasVersionsModel(mProperties)) {
			return Versions.getVersionsModel(mProperties).getProperty(sPropertyName);
		}
		return undefined;
	}

	function isChangeUpdatable(oFlexObject, mPropertyBag) {
		const sChangeType = oFlexObject.getFlexObjectMetadata ? oFlexObject.getFlexObjectMetadata().changeType : oFlexObject.getChangeType();
		if (!["defaultVariant", "updateVariant"].includes(sChangeType)) {
			return false;
		}

		const bSameLayer = oFlexObject.getLayer() === mPropertyBag.layer;
		const sPackageName = oFlexObject.getFlexObjectMetadata().packageName;
		const bNotTransported = !sPackageName || sPackageName === "$TMP";

		return bSameLayer && bNotTransported && isVersionIndependentOrInDraft(oFlexObject, mPropertyBag);
	}

	function getSubSection(mMap, oFlexObject) {
		if (oFlexObject.isVariant && oFlexObject.isVariant()) {
			return mMap.variants;
		}

		const sChangeType = oFlexObject.getChangeType();
		switch (sChangeType) {
			case "defaultVariant":
				return mMap.defaultVariants;
			case "standardVariant":
				return mMap.standardVariants;
			default:
				return mMap.changes;
		}
	}

	function updateArrayByName(aObjectArray, oFlexObject) {
		for (let i = 0; i < aObjectArray.length; i++) {
			if (aObjectArray[i].fileName === oFlexObject.fileName) {
				aObjectArray.splice(i, 1, oFlexObject);
				break;
			}
		}
	}

	async function updateObjectAndStorage(oFlexObject, oStoredResponse, sParentVersion, sReference) {
		const oResult = await Storage.update({
			flexObject: oFlexObject.convertToFileContent(),
			layer: oFlexObject.getLayer(),
			transport: oFlexObject.getRequest(),
			parentVersion: sParentVersion
		});

		// update FlexObject and versionModel
		if (oResult?.response) {
			oFlexObject.setResponse(oResult.response);
			if (sParentVersion) {
				Versions.onAllChangesSaved({
					reference: oResult.response.reference,
					layer: oResult.response.layer,
					draftFilenames: oResult.response.fileName
				});
			}
		} else {
			oFlexObject.setState(States.LifecycleState.PERSISTED);
		}

		// update StorageResponse
		const aObjectArray = getSubSection(oStoredResponse.changes.comp, oFlexObject);
		const oFileContent = oFlexObject.convertToFileContent();
		FlexState.getFlexObjectsDataSelector().checkUpdate({ reference: sReference });
		updateArrayByName(aObjectArray, oFileContent);
		return oFileContent;
	}

	function removeFromArrayById(aObjectArray, sObjectId) {
		for (let i = aObjectArray.length - 1; i >= 0; i--) {
			// aObjectArray can come from either back end response or flex state
			// In the first case, the fileName is a direct property of object
			// In the second case, it can be obtained from getId() function
			const sFileName = aObjectArray[i].fileName || (aObjectArray[i].getId() && aObjectArray[i].getId());
			if ((sFileName || aObjectArray[i].getId()) === sObjectId) {
				aObjectArray.splice(i, 1);
				break;
			}
		}
	}

	async function deleteObjectAndRemoveFromStorage(oFlexObject, oStoredResponse, sParentVersion, sReference) {
		var oFileContent = oFlexObject.convertToFileContent();
		await Storage.remove({
			flexObject: oFileContent,
			layer: oFlexObject.getLayer(),
			transport: oFlexObject.getRequest(),
			parentVersion: sParentVersion
		});

		await Versions.updateModelFromBackend({
			reference: oFileContent.reference,
			layer: oFileContent.layer
		});

		// update StorageResponse
		removeFromArrayById(
			getSubSection(oStoredResponse.changes.comp, oFlexObject),
			oFileContent.fileName
		);
		FlexState.getFlexObjectsDataSelector().checkUpdate({ reference: sReference });
		return oFileContent;
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

		var bPublicLayerAvailable = Settings.getInstanceOrUndef()?.getIsPublicLayerAvailable?.();
		return bPublicLayerAvailable ? Layer.PUBLIC : Layer.CUSTOMER;
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
				return oRevertDataContent.previousAction === CompVariantManager.updateActionType.SAVE;
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
		} else if (Settings.getInstanceOrUndef()?.getUserId()) {
			oChangeSpecificData.support = {
				user: Settings.getInstanceOrUndef().getUserId()
			};
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
	var CompVariantManager = {};

	CompVariantManager.checkSVMControlsForDirty = function(sReference) {
		return FlexState.getSVMControls(sReference).some((oSVMControl) => {
			// test if the control was not destroyed after the registration
			return oSVMControl?.getModified?.();
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
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject} Created or updated change object in charge of setting the default variant
	 */
	CompVariantManager.setDefault = function(mPropertyBag) {
		const oContent = {
			defaultVariantName: mPropertyBag.defaultVariantId
		};
		// TODO: remove as soon as the development uses an IDE using rta which passes the correct parameter
		mPropertyBag.layer ||= new URLSearchParams(window.location.search).get("sap-ui-layer") || Layer.USER;

		let oChange = CompVariantManagementState.getDefaultChanges(mPropertyBag).slice(-1)[0];

		if (!oChange || !isChangeUpdatable(oChange, mPropertyBag)) {
			const sChangeType = "defaultVariant";
			const oChangeParameter = {
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
			oChange.addRevertInfo(new RevertData({
				type: CompVariantManager.operationType.NewChange
			}));
			FlexState.addDirtyFlexObjects(mPropertyBag.reference, [oChange]);
		} else {
			oChange.addRevertInfo(new RevertData({
				type: CompVariantManager.operationType.ContentUpdate,
				content: {
					previousState: oChange.getState(),
					previousContent: oChange.getContent()
				}
			}));
			oChange.setContent(oContent);
			CompVariantManagementState.getSetDefaultDataSelector().checkUpdate({ reference: mPropertyBag.reference });
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
	CompVariantManager.revertSetDefaultVariantId = function(mPropertyBag) {
		const aDefaultChanges = CompVariantManagementState.getDefaultChanges(mPropertyBag);
		const oChange = aDefaultChanges?.slice(-1)[0];
		const oRevertInfo = oChange.popLatestRevertInfo();
		if (oRevertInfo.getType() === CompVariantManager.operationType.ContentUpdate) {
			oChange.setContent(oRevertInfo.getContent().previousContent);
			oChange.setState(oRevertInfo.getContent().previousState);
		} else {
			oChange.setState(States.LifecycleState.DELETED);
			aDefaultChanges.pop();
		}
	};

	/**
	 * Adds a new variant for a smart variant management, such as filter bar or table, and returns the ID of the new variant.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {string} mPropertyBag.persistencyKey - ID of the variant management internal identifier
	 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
	 *            sap.ui.comp.smartfilterbar.SmartFilterBar|
	 *            sap.ui.comp.smarttable.SmartTable|
	 *            sap.ui.comp.smartchart.SmartChart} mPropertyBag.control - Variant management control for which the variant should be updated
	 * @param {boolean} [mPropertyBag.generator] - Name of the tool creating the variant for support analysis
	 * @param {boolean} [mPropertyBag.command] - Name of the sa.ui.rta-command for support analysis
	 * @param {object} mPropertyBag.changeSpecificData - Data set defining the object to be added
	 * @param {sap.ui.fl.Layer} mPropertyBag.changeSpecificData.layer - Layer to which the variant should be written
	 * @param {boolean} [mPropertyBag.changeSpecificData.id] - ID that should be used for the flex object
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
	CompVariantManager.addVariant = function(mPropertyBag) {
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
		FlexState.addDirtyFlexObjects(mPropertyBag.reference, [oFlexObject]);
		if (oChangeSpecificData.layer !== Layer.USER && oChangeSpecificData.layer !== Layer.PUBLIC) {
			mPropertyBag.id = mPropertyBag.control.getCurrentVariantId();
			revertAllVariantUpdate(CompVariantManagementState.getVariant(mPropertyBag));
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
	CompVariantManager.updateVariant = function(mPropertyBag) {
		function variantCanBeUpdated(oVariant, sLayer) {
			const bSameLayer = oVariant.getLayer() === sLayer;
			const sPackageName = oVariant.getFlexObjectMetadata().packageName;
			const bNotTransported = !sPackageName || sPackageName === "$TMP";
			// in case changes were already done within the layer, no update of the variant can be done to safeguard the execution order

			const bIsChangedOnLayer = CompVariantManagementState.getVariantChanges(oVariant).some((oChange) => oChange.getLayer() === sLayer);
			return oVariant.getPersisted() && bSameLayer && bNotTransported && !bIsChangedOnLayer && isVersionIndependentOrInDraft(oVariant, mPropertyBag);
		}

		function getLatestUpdatableChange(oVariant) {
			return CompVariantManagementState.getVariantChanges(oVariant).reverse().find(
				(oChange) => oChange.getChangeType() === "updateVariant" && isChangeUpdatable(oChange, mPropertyBag)
			);
		}

		function storeRevertDataInVariant(mPropertyBag, oVariant, sOperationType, oChange) {
			const oRevertData = {
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
			storeRevertDataInVariant(mPropertyBag, oVariant, CompVariantManager.operationType.ContentUpdate);

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
			storeRevertDataInVariant(mPropertyBag, oVariant, CompVariantManager.operationType.UpdateVariantViaChangeUpdate, oChange);
			applyChangesOnVariant(oVariant, [oChange]);
			CompVariantManagementState.getCompEntitiesDataSelector().checkUpdate({ reference: mPropertyBag.reference });
		}

		function createChange(mPropertyBag, oVariant) {
			const oContent = {};
			["favorite", "visible", "executeOnSelection", "contexts"].forEach((sPropertyName) => {
				if (mPropertyBag[sPropertyName] !== undefined) {
					oContent[sPropertyName] = mPropertyBag[sPropertyName];
				}
			});
			if (mPropertyBag.content !== undefined) {
				oContent.variantContent = mPropertyBag.content;
			}

			const oChange = FlexObjectFactory.createUIChange({
				changeType: "updateVariant",
				layer: mPropertyBag.layer,
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
			FlexState.addDirtyFlexObjects(mPropertyBag.reference, [oChange]);
			storeRevertDataInVariant(mPropertyBag, oVariant, CompVariantManager.operationType.NewChange, oChange);
			applyChangesOnVariant(oVariant, [oChange]);
			CompVariantManagementState.getCompEntitiesDataSelector().checkUpdate({ reference: mPropertyBag.reference });
		}

		const oVariant = CompVariantManagementState.getVariant(mPropertyBag);
		const sLayer = determineLayer(mPropertyBag);
		mPropertyBag.layer ||= sLayer;

		if (mPropertyBag.forceCreate) {
			createChange(mPropertyBag, oVariant);
		} else if (variantCanBeUpdated(oVariant, sLayer)) {
			updateVariant(mPropertyBag, oVariant);
		} else {
			const oUpdatableChange = getLatestUpdatableChange(oVariant);
			if (oUpdatableChange) {
				updateChange(mPropertyBag, oVariant, oUpdatableChange);
			} else {
				createChange(mPropertyBag, oVariant);
			}
		}
		CompVariantManagementState.getCompEntitiesDataSelector().checkUpdate({ reference: mPropertyBag.reference });

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
	CompVariantManager.discardVariantContent = function(mPropertyBag) {
		const oVariant = CompVariantManagementState.getVariant(mPropertyBag);
		const aVariantRevertData = oVariant.getRevertData();
		if (aVariantRevertData.length !== 0) {
			// Look at revert data backward, to find the content of last save action
			const bIsVariantSaved = aVariantRevertData.slice().reverse().some(function(oRevertData) {
				mPropertyBag.layer = oRevertData.getChange()?.getLayer();
				if (oRevertData.getContent().previousAction === CompVariantManager.updateActionType.SAVE) {
					mPropertyBag.content = oRevertData.getContent().previousContent;
					mPropertyBag.action = CompVariantManager.updateActionType.DISCARD;
					return true;
				}
			});

			if (!bIsVariantSaved) {
				mPropertyBag.content = aVariantRevertData[0].getContent().previousContent;
				mPropertyBag.action = CompVariantManager.updateActionType.DISCARD;
			}
			// Update variant content to the last saved or original content
			CompVariantManager.updateVariant(mPropertyBag);
		}
		return oVariant;
	};

	/**
	 * Defines the different types of actions lead to a variant got update.
	 *
	 * @enum {string}
	 */
	CompVariantManager.updateActionType = {
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
	CompVariantManager.operationType = {
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
	CompVariantManager.removeVariant = function(mPropertyBag) {
		const oVariant = CompVariantManagementState.getVariant(mPropertyBag);
		const sCurrentState = oVariant.getState();

		if (!mPropertyBag.revert) {
			const oRevertData = new CompVariantRevertData({
				type: CompVariantManager.operationType.StateUpdate,
				content: {
					previousState: sCurrentState
				}
			});
			oVariant.addRevertData(oRevertData);
		}

		oVariant.markForDeletion();
		CompVariantManagementState.getCompEntitiesDataSelector().checkUpdate({ reference: mPropertyBag.reference });
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
	CompVariantManager.revert = function(mPropertyBag) {
		const oVariant = CompVariantManagementState.getVariant(Object.assign({includeDeleted: true}, mPropertyBag));

		const oVariantRevertData = oVariant.getRevertData().pop();
		oVariant.removeRevertData(oVariantRevertData);
		const oRevertDataContent = oVariantRevertData.getContent();
		let oChange;
		let oChangeRevertData;

		switch (oVariantRevertData.getType()) {
			case CompVariantManager.operationType.ContentUpdate:
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
			case CompVariantManager.operationType.NewChange:
				oChange = oVariantRevertData.getChange();
				FlexState.removeDirtyFlexObjects(oChange.getFlexObjectMetadata().reference, [oChange]);
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
			case CompVariantManager.operationType.UpdateVariantViaChangeUpdate:
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
				oChangeRevertData = oChange.getRevertData().pop();
				oChange.setContent(oChangeRevertData.previousContent);
				oChange.setState(oChangeRevertData.previousState);
				break;
			case CompVariantManager.operationType.StateUpdate:
			default:
				break;
		}

		oVariant.setState(oRevertDataContent.previousState);
		CompVariantManagementState.getCompEntitiesDataSelector().checkUpdate({ reference: mPropertyBag.reference });
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
	CompVariantManager.overrideStandardVariant = function(mPropertyBag) {
		const aVariants = CompVariantManagementState.assembleVariantList(mPropertyBag);
		const oStandardVariant = aVariants.find((oVariant) => oVariant.getStandardVariant());
		oStandardVariant.setExecuteOnSelection(!!mPropertyBag.executeOnSelection);
		CompVariantManagementState.applyChangesOnVariants(mPropertyBag.reference, mPropertyBag.persistencyKey, [oStandardVariant]);
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
	CompVariantManager.persist = async function(mPropertyBag) {
		async function writeObjectAndAddToState(oFlexObject, oStoredResponse, sParentVersion) {
			// new public variant should not be visible for other users
			if (oFlexObject.getLayer() === Layer.PUBLIC) {
				oFlexObject.setFavorite(false);
			}
			// TODO: remove this line as soon as layering and a condensing is in place
			const oResult = await Storage.write({
				flexObjects: [oFlexObject.convertToFileContent()],
				layer: oFlexObject.getLayer(),
				transport: oFlexObject.getRequest(),
				isLegacyVariant: oFlexObject.isVariant && oFlexObject.isVariant(),
				parentVersion: sParentVersion
			});

			// updateFlexObject and versionModel
			if (oResult?.response?.[0]) {
				oFlexObject.setResponse(oResult.response[0]);
				if (sParentVersion) {
					Versions.onAllChangesSaved({
						reference: oResult.response[0].reference,
						layer: oResult.response[0].layer,
						draftFilenames: [oResult.response[0].fileName]
					});
				}
			} else {
				oFlexObject.setState(States.LifecycleState.PERSISTED);
			}

			// update StorageResponse
			const oFileContent = oFlexObject.convertToFileContent();
			getSubSection(oStoredResponse.changes.comp, oFlexObject).push(oFileContent);
			FlexState.getFlexObjectsDataSelector().checkUpdate({ reference: mPropertyBag.reference });
			return oFileContent;
		}

		function saveObject(oFlexObject, oStoredResponse, sParentVersion) {
			switch (oFlexObject.getState()) {
				case States.LifecycleState.NEW:
					ifVariantClearRevertData(oFlexObject);
					return writeObjectAndAddToState(oFlexObject, oStoredResponse, sParentVersion);
				case States.LifecycleState.UPDATED:
					ifVariantClearRevertData(oFlexObject);
					return updateObjectAndStorage(oFlexObject, oStoredResponse, sParentVersion, mPropertyBag.reference);
				case States.LifecycleState.DELETED:
					if (oFlexObject._sPreviousState !== States.LifecycleState.NEW) {
						ifVariantClearRevertData(oFlexObject);
						return deleteObjectAndRemoveFromStorage(oFlexObject, oStoredResponse, sParentVersion, mPropertyBag.reference);
					}
					return Promise.resolve();
				default:
					return undefined;
			}
		}

		const aCompVariantEntities = CompVariantManagementState.getCompEntitiesByPersistencyKey(mPropertyBag);

		const oStoredResponse = await FlexState.getStorageResponse(mPropertyBag.reference);
		const aFlexObjects = aCompVariantEntities.filter(needsPersistencyCall);
		const aPromises = aFlexObjects.map(async (oFlexObject, index) => {
			if (index === 0) {
				const sParentVersion = getPropertyFromVersionsModel("/persistedVersion", {
					layer: oFlexObject.getLayer(),
					reference: oFlexObject.getFlexObjectMetadata().reference
				});
				// TODO: use condensing route to reduce backend requests
				// need to save first entry to generate draft version in backend
				await saveObject(oFlexObject, oStoredResponse, sParentVersion);
				const aPromises = aFlexObjects.map((oFlexObject, index) => {
					if (index !== 0) {
						const sDraftVersion = sParentVersion ? Version.Number.Draft : undefined;
						return saveObject(oFlexObject, oStoredResponse, sDraftVersion);
					}
					return undefined;
				});
				return Promise.all(aPromises);
			}
			return undefined;
		});
		// TODO Consider not rejecting with first error, but wait for all promises and collect the results
		return Promise.all(aPromises);
	};

	/**
	 * Takes an array of FlexObjects and filters out any changes of a deleted variant
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aFlexObjects - FlexObjects to be filtered
	 * @param {string} sReference - Flex reference of the application
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Filtered list of FlexObjects
	 */
	CompVariantManager.filterHiddenFlexObjects = function(aFlexObjects, sReference) {
		const aVariants = CompVariantManagementState.getCompEntities({
			reference: sReference
		})
		.filter((oFlexObject) => oFlexObject.getFileType() === "variant")
		.map((oVariant) => oVariant.getId());

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

	return CompVariantManager;
});