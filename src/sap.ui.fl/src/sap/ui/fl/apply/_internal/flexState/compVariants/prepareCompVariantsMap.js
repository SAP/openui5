/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexObjects/UpdatableChange",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantMerger"
], function(
	FlexObjectFactory,
	States,
	UpdatableChange,
	CompVariantMerger
) {
	"use strict";

	function getOrCreate(mMap, sPersistencyKey) {
		mMap[sPersistencyKey] ||= {
			byId: {},
			variants: [],
			nonPersistedVariants: [],
			changes: [],
			defaultVariants: [],
			standardVariantChange: undefined,
			standardVariant: undefined
		};

		return mMap[sPersistencyKey];
	}

	function initialize(mMap, mAuthors, sPersistencyKey, aVariants, sSVMControlId) {
		aVariants ||= [];
		const mMapOfKey = getOrCreate(mMap, sPersistencyKey);
		mMapOfKey.controlId = sSVMControlId;

		// clear all non-persisted variants in case of a reinitialization
		mMapOfKey.nonPersistedVariants.forEach(function(oVariant) {
			delete mMapOfKey.byId[oVariant.getId()];
		});

		mMapOfKey.nonPersistedVariants = aVariants.map(function(oVariant) {
			const oVariantInstance = CompVariantMerger.createVariant(
				sPersistencyKey,
				{
					id: oVariant.id,
					persisted: false,
					...oVariant
				},
				mAuthors
			);
			mMapOfKey.byId[oVariant.id] = oVariantInstance;
			return oVariantInstance;
		});

		return mMapOfKey;
	}

	function buildSectionMap(mCompSection, sSubSection, mCompVariants, mAuthors) {
		const aFlexObjects = mCompSection[sSubSection].map(function(oCompVariantChangeDefinition) {
			const oFlexObject = sSubSection === "variants"
				? FlexObjectFactory.createCompVariant(oCompVariantChangeDefinition, mAuthors)
				: FlexObjectFactory.createFromFileContent(oCompVariantChangeDefinition, UpdatableChange);
			oFlexObject.setState(States.LifecycleState.PERSISTED); // prevent persisting these anew
			return oFlexObject;
		});

		aFlexObjects.forEach(function(oFlexObject) {
			const sPersistencyKey = oFlexObject.getPersistencyKey
				? oFlexObject.getPersistencyKey()
				: oFlexObject.getSelector().persistencyKey;
			getOrCreate(
				mCompVariants,
				sPersistencyKey
			).byId[oFlexObject.getId()] = oFlexObject;

			switch (sSubSection) {
				case "standardVariants":
					getOrCreate(mCompVariants, sPersistencyKey).standardVariantChange = oFlexObject;
					break;
				default:
					getOrCreate(mCompVariants, sPersistencyKey)[sSubSection].push(oFlexObject);
			}
		});
	}

	/**
	 * Prepares the CompVariants from the flex response.
	 *
	 * @function
	 * @since 1.83
	 * @private
	 * @ui5-restricted sap/ui/fl/apply/_internal/flexState/FlexState
	 * @alias module:sap/ui/fl/apply/_internal/flexState/compVariants/prepareCompVariantsMap
	 *
	 * @param {object} mPropertyBag - Contains additional data needed for preparing the map
	 * @param {object} mPropertyBag.storageResponse - Storage response with the flex data
	 * @returns {object} The prepared map for compVariants
	 */
	return function(mPropertyBag) {
		const mCompVariants = {};

		// provide the function for fl-internal consumers reuse
		mCompVariants._getOrCreate = getOrCreate.bind(undefined, mCompVariants);
		mCompVariants._initialize = initialize.bind(undefined, mCompVariants, mPropertyBag.storageResponse.authors);

		// check for the existence due to test mocks
		if (mPropertyBag.storageResponse.changes.comp) {
			["variants", "changes", "defaultVariants", "standardVariants"].forEach(function(sSection) {
				buildSectionMap(mPropertyBag.storageResponse.changes.comp, sSection, mCompVariants, mPropertyBag.storageResponse.authors);
			});
		}

		return mCompVariants;
	};
});
