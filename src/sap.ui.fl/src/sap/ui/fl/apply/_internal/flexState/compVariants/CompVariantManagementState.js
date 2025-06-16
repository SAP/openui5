/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/apply/_internal/flexState/DataSelector",
	"sap/ui/fl/apply/_internal/flexState/compVariants/applyChangesOnVariant",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States"
], function(
	Log,
	FlexState,
	UIChangesState,
	DataSelector,
	applyChangesOnVariant,
	CompVariant,
	FlexObjectFactory,
	States
) {
	"use strict";

	/**
	 * Handler class provide data of smart control variant changes and its map.
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.compVariants.CompVariantManagementState
	 * @since 1.129
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	const CompVariantManagementState = {};

	const sUpdatableChangeNameSpace = "sap.ui.fl.apply._internal.flexObjects.UpdatableChange";

	const aCompVariantChangeTypes = [
		"addFavorite",
		"defaultVariant",
		"removeFavorite",
		"standardVariant",
		"updateVariant"
	];

	const isSetDefaultChange = (oFlexObject) => {
		return oFlexObject?.isA(sUpdatableChangeNameSpace)
			&& oFlexObject.getFileType() === "change"
			&& oFlexObject.getChangeType() === "defaultVariant";
	};

	const oSetDefaultDataSelector = new DataSelector({
		id: "compSetDefault",
		parameterKey: "persistencyKey",
		parentDataSelector: FlexState.getFlexObjectsDataSelector(),
		executeFunction(aFlexObjects, mPropertyBag) {
			return aFlexObjects.filter((oFlexObject) =>
				(oFlexObject.getState() !== States.LifecycleState.DELETED || mPropertyBag.includeDeleted)
				&& isSetDefaultChange(oFlexObject)
				&& oFlexObject.getSelector().persistencyKey === mPropertyBag.persistencyKey
			);
		},
		checkInvalidation(mParameters, oUpdateInfo) {
			const oFlexObject = oUpdateInfo.updatedObject;
			const bRelevantPersistencyKey = oFlexObject?.getSelector?.().persistencyKey === mParameters.persistencyKey;
			const bRelevantType = ["addFlexObject", "removeFlexObject"].includes(oUpdateInfo.type);
			return bRelevantPersistencyKey && bRelevantType && isSetDefaultChange(oUpdateInfo.updatedObject);
		}
	});

	const oCompEntitiesDataSelector = new DataSelector({
		id: "compEntitiesData",
		parentDataSelector: FlexState.getFlexObjectsDataSelector(),
		executeFunction(aFlexObjects) {
			return aFlexObjects.filter((oFlexObject) => oFlexObject.getFileType() === "variant" ||
				(
					oFlexObject.getFileType() === "change"
					&& aCompVariantChangeTypes.includes(oFlexObject.getChangeType())
				)
			);
		},
		checkInvalidation(mParameters, oUpdateInfo) {
			const oFlexObject = oUpdateInfo.updatedObject;
			const aRelevantUpdateTypes = ["addFlexObject", "updateFlexObject", "removeFlexObject"];
			const bIsRelevantUpdateType = aRelevantUpdateTypes.includes(oUpdateInfo.type);
			const bIsChangeWithRelevantChangeType = oFlexObject.getFileType() === "change" &&
				aCompVariantChangeTypes.includes(oFlexObject.getChangeType());
			const bIsVariantFileType = oUpdateInfo.updatedObject?.getFileType?.() === "variant";
			return bIsRelevantUpdateType && (bIsVariantFileType || bIsChangeWithRelevantChangeType);
		}
	});

	const oVariantsDataSelector = new DataSelector({
		id: "compVariantData",
		parameterKey: "persistencyKey",
		parentDataSelector: oCompEntitiesDataSelector,
		executeFunction(aFlexObjects, mPropertyBag) {
			const aVariants = aFlexObjects.filter((oFlexObject) =>
				oFlexObject.getFileType() === "variant"
				&& oFlexObject.getPersistencyKey() === mPropertyBag.persistencyKey
				&& (oFlexObject.getState() !== States.LifecycleState.DELETED || mPropertyBag.includeDeleted)
			);

			return CompVariantManagementState.applyChangesOnVariants(mPropertyBag.reference, mPropertyBag.persistencyKey, aVariants);
		},
		checkInvalidation(mParameters, oUpdateInfo) {
			const oFlexObject = oUpdateInfo.updatedObject;
			const aRelevantUpdateTypes = ["addFlexObject", "updateFlexObject", "removeFlexObject"];
			const bIsRelevantUpdateType = aRelevantUpdateTypes.includes(oUpdateInfo.type);
			const bIsChangeWithRelevantChangeType = oFlexObject.getFileType() === "change" &&
				aCompVariantChangeTypes.includes(oFlexObject.getChangeType());
			const bIsVariantFileType = oUpdateInfo.updatedObject?.getFileType?.() === "variant";
			return bIsRelevantUpdateType && (bIsVariantFileType || bIsChangeWithRelevantChangeType);
		}
	});

	const oChangesByVariantIdsDataSelector = new DataSelector({
		id: "getChangesByVariantIds",
		parameterKey: "persistencyKey",
		parentDataSelector: oCompEntitiesDataSelector,
		executeFunction(aFlexObjects, mPropertyBag) {
			const mChanges = {};
			const aVariantIds = aFlexObjects
			.filter((oFlexObject) => oFlexObject.getFileType() === "variant" && oFlexObject.getPersistencyKey() === mPropertyBag.persistencyKey)
			.map((oVariant) => oVariant.getVariantId());

			aFlexObjects.filter((oFlexObject) => oFlexObject.getFileType() === "change" && oFlexObject.getChangeType() !== "defaultVariant")
			.forEach(function(oChange) {
				const sVariantId = escapeSpecialIdCharacters(oChange.getSelector().variantId || oChange.getContent().key);
				if (aVariantIds.includes(sVariantId)) {
					mChanges[sVariantId] ||= [];
					mChanges[sVariantId].push(oChange);
				} else if (oChange.getChangeType() === "standardVariant") {
					mChanges[CompVariant.STANDARD_VARIANT_ID] ||= [];
					mChanges[CompVariant.STANDARD_VARIANT_ID].push(oChange);
				}
			});

			return mChanges;
		}
	});

	// comp entities may hold the persistency key within the persistencyKey property (variant) or within the selector (changes)
	const oCompEntitiesByPersistencyKeyDataSelector = new DataSelector({
		id: "compEntitiesByPersistencyKey",
		parameterKey: "persistencyKey",
		parentDataSelector: oCompEntitiesDataSelector,
		executeFunction(aFlexObjects, mPropertyBag) {
			return aFlexObjects.filter((oFlexObject) =>
				(oFlexObject.getPersistencyKey?.() || oFlexObject.getSelector?.().persistencyKey) === mPropertyBag.persistencyKey
			);
		},
		checkInvalidation(mParameters, oUpdateInfo) {
			const oFlexObject = oUpdateInfo.updatedObject;
			return (oFlexObject?.getPersistencyKey?.() || oFlexObject.getSelector?.().persistencyKey) === mParameters.persistencyKey;
		}
	});

	function createVariant(mPropertyBag) {
		const oVariantInput = mPropertyBag.variantInput || {};
		const mAuthors = mPropertyBag.authors || {};
		const oVariantData = {
			fileName: oVariantInput.fileName,
			fileType: "variant",
			variantId: oVariantInput.id || CompVariant.STANDARD_VARIANT_ID,
			persisted: oVariantInput.persisted,
			reference: mPropertyBag.reference,
			favorite: oVariantInput.favorite,
			executeOnSelection: oVariantInput.executeOnSelection,
			adaptationId: oVariantInput.adaptationId,
			content: oVariantInput.content || {},
			texts: {
				variantName: {
					value: oVariantInput.name || ""
				}
			},
			selector: {
				persistencyKey: mPropertyBag.persistencyKey
			}
		};

		return FlexObjectFactory.createCompVariant(oVariantData, mAuthors);
	}

	function escapeSpecialIdCharacters(sId) {
		return sId?.replace("#", "_HASHTAG_");
	}

	CompVariantManagementState.applyChangesOnVariants = function(sReference, sPersistencyKey, aVariants) {
		const mChangesByVariantId = oChangesByVariantIdsDataSelector.get({
			reference: sReference,
			persistencyKey: sPersistencyKey
		});
		aVariants.forEach((oVariant) => {
			const aChangesOnVariant = mChangesByVariantId[oVariant.getVariantId()] || [];
			if (aChangesOnVariant.length > 0) {
				applyChangesOnVariant(oVariant, aChangesOnVariant);
				oCompEntitiesDataSelector.checkUpdate(
					{ reference: sReference },
					[{ type: "updateFlexObject", updatedObject: oVariant }]
				);
			}
		});

		return aVariants;
	};

	/**
	 * Access to the variant management comp entities selector.
	 *
	 * @returns {object} The data selector for the variants and their changes
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.qunit
	 */
	CompVariantManagementState.getCompEntitiesDataSelector = function() {
		return oCompEntitiesDataSelector;
	};

	/**
	 * Access to the variant management set default selector.
	 *
	 * @returns {object} The data selector for the variant set default changes
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.qunit
	 */
	CompVariantManagementState.getSetDefaultDataSelector = function() {
		return oSetDefaultDataSelector;
	};

	/**
	 * Returns the default variant ID for a given variant management
	 *
	 * @param {object} mPropertyBag Object with the necessary properties
	 * @param {string} mPropertyBag.persistencyKey - Persistency key of the variant management
	 * @param {string} mPropertyBag.reference - Flexibility reference of the app
	 * @param {sap.ui.fl.apply._internal.flexObjects.CompVariant[]} mPropertyBag.variants - Array of variants which exist for the given variant management
	 *
	 * @returns {string | undefined} ID of the default variant
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariantManagementState.getDefaultVariantId = (mPropertyBag) => {
		const aVariants = mPropertyBag.variants;
		const aVariantIds = aVariants.map((oVariant) => oVariant.getVariantId());
		aVariantIds.push(CompVariant.STANDARD_VARIANT_ID);

		mPropertyBag.persistencyKey = String(mPropertyBag.persistencyKey);
		const aDefaultChanges = [...oSetDefaultDataSelector.get(mPropertyBag)].reverse();
		const aDefaultVariantIds = aDefaultChanges
		.map((oChange) => oChange.getContent().defaultVariantName)
		.map((sId) => escapeSpecialIdCharacters(sId));

		return aDefaultVariantIds.find((sDefaultVariantId) => aVariantIds.includes(sDefaultVariantId)) || "";
	};

	/**
	 * Returns all variants saved in the FlexState.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.reference - Flex reference of the current app
	 * @param {string} mPropertyBag.persistencyKey - Persistency key of the variant management
	 * @param {object} mPropertyBag.standardVariant - The standard variant passed by the control
	 * @param {string} mPropertyBag.componentId - The ID of the application component
	 * @param {boolean} [mPropertyBag.includeDeleted=false] - Flag if also deleted variants should be returned
	 *
	 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant[]} Array of variants
	 */
	CompVariantManagementState.assembleVariantList = function(mPropertyBag) {
		let oStandardVariant = oVariantsDataSelector.get(mPropertyBag).findLast((oVariant) => oVariant.getStandardVariant());

		if (!oStandardVariant) {
			oStandardVariant = createVariant({
				reference: mPropertyBag.reference,
				persistencyKey: mPropertyBag.persistencyKey,
				variantInput: mPropertyBag.standardVariant,
				standardVariant: true
			});
			FlexState.addRuntimeSteadyObject(mPropertyBag.reference, mPropertyBag.componentId, oStandardVariant);
		}

		return oVariantsDataSelector.get(mPropertyBag).filter((oVariant) => oVariant.getVisible());
	};

	/**
	 * Returns a variant saved in the flex state.
	 *
	 * @param {object} mPropertyBag Object with the necessary properties
	 * @param {string} mPropertyBag.reference - Flex reference of the current app
	 * @param {string} mPropertyBag.persistencyKey - Persistency key of the variant management
	 * @param {string} mPropertyBag.id - ID of the variant
	 * @param {string} mPropertyBag.componentId - The ID of the application component
	 *
	 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant | undefined} Variant or undefined if the variant cannot be found
	 */
	CompVariantManagementState.getVariant = function(mPropertyBag) {
		return oVariantsDataSelector.get(mPropertyBag).find((oVariant) => oVariant.getVariantId() === mPropertyBag.id);
	};

	/**
	 * Returns all changes for a given variant saved in the FlexState.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.CompVariant} oVariant - Variant for which the changes should be retrieved
	 *
	 * @returns {sap.ui.fl.apply._internal.flexObjects.UIChange[]} List of changes for the variant
	 */
	CompVariantManagementState.getVariantChanges = function(oVariant) {
		const sReference = oVariant.getDefinition().reference;
		const sVariantId = oVariant.getVariantId();
		const sPersistencyKey = oVariant.getPersistencyKey();
		return oChangesByVariantIdsDataSelector.get({
			reference: sReference,
			persistencyKey: sPersistencyKey
		})?.[sVariantId] || [];
	};

	CompVariantManagementState.addExternalVariants = function(mPropertyBag) {
		try {
			mPropertyBag.variants?.map((oVariant) => {
				oVariant.reference = mPropertyBag.reference;
				oVariant.fileName = escapeSpecialIdCharacters(oVariant.id); // external oData Variants may have an invalid ID for ManagedObjects
				oVariant.selector = {persistencyKey: mPropertyBag.persistencyKey};
				oVariant.texts = {variantName: {value: oVariant.name}};
				return oVariant;
			})
			.map((oVariant) => FlexObjectFactory.createFromFileContent(oVariant, CompVariant, true))
			.forEach((oFlexObject) => FlexState.addRuntimeSteadyObject(mPropertyBag.reference, mPropertyBag.componentId, oFlexObject));
		} catch (oError) {
			Log.error(`External comp variant could not be added: ${oError.message}`);
		}
	};

	/**
	 * Returns the 'defaultVariant' changes for a given variant management
	 *
	 * @param {object} mPropertyBag Object with the necessary properties
	 * @param {string} mPropertyBag.persistencyKey - Persistency key of the variant management
	 * @param {string} mPropertyBag.reference - Flexibility reference of the app
	 *
	 * @returns {sap.ui.fl.apply._internal.flexObjects.UpdatableChange[]} 'defaultVariant' changes of the variant management
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariantManagementState.getDefaultChanges = (mPropertyBag) => {
		mPropertyBag.persistencyKey = String(mPropertyBag.persistencyKey);
		return oSetDefaultDataSelector.get(mPropertyBag);
	};

	/**
	 * Returns the all sap.ui.comp related entities for a given reference
	 *
	 * @param {object} mPropertyBag Object with the necessary properties
	 * @param {string} mPropertyBag.reference - Flexibility reference of the app
	 *
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} - All comp variants for a given reference
	 *
	 * @since 1.140
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariantManagementState.getCompEntities = (mPropertyBag) => {
		return oCompEntitiesDataSelector.get(mPropertyBag);
	};

	/**
	 * Returns the all sap.ui.comp related entities for a given reference and persistency key
	 *
	 * @param {object} mPropertyBag Object with the necessary properties
	 * @param {string} mPropertyBag.reference - Flexibility reference of the app
	 * @param {string} mPropertyBag.persistencyKey - Persistency key of the variant management
	 *
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} - all sap.ui.comp related entities for a given reference
	 *
	 * @since 1.140
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariantManagementState.getCompEntitiesByPersistencyKey = (mPropertyBag) => {
		return oCompEntitiesByPersistencyKeyDataSelector.get(mPropertyBag);
	};

	return CompVariantManagementState;
});