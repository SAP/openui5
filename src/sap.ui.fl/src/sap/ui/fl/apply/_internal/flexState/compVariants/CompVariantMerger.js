/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/base/Log"
], function(
	CompVariant,
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

		if (oVariantInput.executeOnSelection !== undefined) {
			oVariantData.content.executeOnSelection = oVariantInput.executeOnSelection;
		}

		return new CompVariant(oVariantData);
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
		merge: function (sPersistencyKey, mCompData, oStandardVariantInput, aVariants) {
			aVariants = aVariants || [];
			aVariants = aVariants.map(createVariant.bind(undefined, sPersistencyKey));
			aVariants = aVariants.concat(mCompData.variants);
			var mChanges = getChangesMappedByVariant(mCompData);
			aVariants.forEach(applyChangesOnVariant.bind(undefined, mChanges));

			// check for an overwritten standard variant
			var nIndexOfStandardVariant = -1;
			aVariants.forEach(function (oVariant, nIndex) {
				if (oVariant.getContent().standardvariant) {
					nIndexOfStandardVariant = nIndex;
				}
			});
			var oStandardVariant;
			if (nIndexOfStandardVariant === -1) {
				// create a new standard variant with the passed input
				oStandardVariantInput.content = oStandardVariantInput.content || {};
				oStandardVariant = createVariant(sPersistencyKey, oStandardVariantInput);
				applyChangesOnVariant(mChanges, oStandardVariant);
			} else {
				// extract the overwriting variant from the variant list
				// in this case all changes were already applied
				oStandardVariant = aVariants.splice(nIndexOfStandardVariant, 1)[0];
			}

			// the standard must always be visible
			oStandardVariant.setFavorite(true);
			if (mCompData.standardVariant) {
				var bExecuteOnSelection = mCompData.standardVariant.getContent().executeOnSelect;
				oStandardVariant.setExecuteOnSelection(bExecuteOnSelection);
				// TODO remove as soon as the consumer uses the API
				oStandardVariant.getContent().executeOnSelection = bExecuteOnSelection;
			}

			return {
				standardVariant: oStandardVariant,
				variants: aVariants
			};
		}
	};
});