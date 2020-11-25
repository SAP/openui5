/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Change",
	"sap/ui/fl/apply/_internal/flexObjects/Variant"
], function(
	Change,
	Variant
) {
	"use strict";

	function getOrCreate(mMap, sKey) {
		mMap[sKey] = mMap[sKey] || {
			variants: [],
			changes: [],
			defaultVariant: undefined,
			standardVariant: undefined
		};

		return mMap[sKey];
	}

	function buildSectionMap(mCompSection, sSubSection, mById, mCompVariants) {
		var oClass = sSubSection === "variants" ? Variant : Change;
		var aFlexObjects = mCompSection[sSubSection].map(function (oCompVariantChangeDefinition) {
			var oFlexObject = new oClass(oCompVariantChangeDefinition);
			oFlexObject.setState(Change.states.PERSISTED); // prevent persisting these anew
			return oFlexObject;
		});

		aFlexObjects.forEach(function (oFlexObject) {
			mById[oFlexObject.getId()] = oFlexObject;
			var sPersistencyKey = oFlexObject.getSelector().persistencyKey;

			switch (sSubSection) {
				case "defaultVariants":
					getOrCreate(mCompVariants, sPersistencyKey)["defaultVariant"] = oFlexObject;
					break;
				case "standardVariants":
					getOrCreate(mCompVariants, sPersistencyKey)["standardVariant"] = oFlexObject;
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
		var mById = {};
		var mCompVariants = {};

		// provide the function for fl-internal consumers reuse
		mCompVariants._getOrCreate = getOrCreate.bind(undefined, mCompVariants);

		// check for the existence due to test mocks
		if (mPropertyBag.storageResponse.changes.comp) {
			["variants", "changes", "defaultVariants", "standardVariants"].forEach(function (sSection) {
				buildSectionMap(mPropertyBag.storageResponse.changes.comp, sSection, mById, mCompVariants);
			});
		}

		return {
			map: mCompVariants,
			byId: mById
		};
	};
});
