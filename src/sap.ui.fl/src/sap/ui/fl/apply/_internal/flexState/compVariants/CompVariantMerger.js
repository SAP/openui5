/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/Variant",
	"sap/base/Log"
], function(
	Variant,
	Log
) {
	"use strict";

	var mChangeHandlers = {
		addFavorite: function (oVariant) {
			oVariant.setFavorite(true);
		},
		removeFavorite: function (oVariant) {
			oVariant.setFavorite(false);
		}
	};

	function getChangesMappedByVariant(mCompVariants) {
		var mChanges = {};

		mCompVariants.changes.forEach(function (oChange) {
			var sVariantId = oChange.getContent().key;
			if (!mChanges[sVariantId]) {
				mChanges[sVariantId] = [];
			}

			mChanges[sVariantId].push(oChange);
		});

		return mChanges;
	}

	function logNoChangeHandler(oVariant, oChange) {
		Log.error("No change handler for change with the ID '" + oChange.getId() +
			"' and type '" + oChange.getChangeType() + "' defined.\n" +
			"The variant '" + oVariant.getId() + "'was not modified'");
	}

	function createVariant(sPersistencyKey, oVariantInput) {
		var oVariantData = {
			fileName: oVariantInput.id || "*standard*",
			content: oVariantInput.content || {},
			texts: {
				variantName: {
					value: oVariantInput.name || ""
				}
			},
			selector: {
				persistencyKey: sPersistencyKey
			}
		};

		if (oVariantInput.favorite !== undefined) {
			oVariantData.content.favorite = oVariantInput.favorite;
		}

		if (oVariantInput.executeOnSelect !== undefined) {
			oVariantData.content.executeOnSelect = oVariantInput.executeOnSelect;
		}

		return new Variant(oVariantData);
	}

	function applyChangesOnVariant(mChanges, oVariant) {
		var sVariantId = oVariant.getId();
		if (mChanges[sVariantId]) {
			mChanges[sVariantId].forEach(function (oChange) {
				var oChangeHandler = mChangeHandlers[oChange.getChangeType()] || logNoChangeHandler;
				oChangeHandler(oVariant, oChange);
			});
		}
	}

	/**
	 * Class in charge of applying changes.
	 * This includes combining the variants passed on the <code>merge</code> call, sorting and applying changes.
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.compVariants.CompVariantMerger
	 * @since 1.86
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	return {
		merge: function (sPersistencyKey, mCompVariants, oStandardVariantInput, aVariants) {
			aVariants = aVariants || [];
			aVariants = aVariants.map(createVariant.bind(undefined, sPersistencyKey));
			aVariants = aVariants.concat(mCompVariants.variants);
			var mChanges = getChangesMappedByVariant(mCompVariants);
			aVariants.forEach(applyChangesOnVariant.bind(undefined, mChanges));

			if (mCompVariants.standardVariant) {
				oStandardVariantInput.content = oStandardVariantInput.content || {};
				oStandardVariantInput.content.executeOnSelect = mCompVariants.standardVariant.getContent().executeOnSelect;
			}

			oStandardVariantInput.favorite = true;
			var oStandardVariant = createVariant(sPersistencyKey, oStandardVariantInput);
			applyChangesOnVariant(mChanges, oStandardVariant);

			return {
				standardVariant: oStandardVariant,
				variants: aVariants
			};
		}
	};
});