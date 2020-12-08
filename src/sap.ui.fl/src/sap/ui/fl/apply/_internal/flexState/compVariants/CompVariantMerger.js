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

	function compareTitle(oVariant1, oVariant2) {
		var sFirstTitle = oVariant1.getText("variantName");
		var sSecondTitle = oVariant2.getText("variantName");
		var sFirstTitleUpperCase = sFirstTitle.toUpperCase();
		var sSecondTitleUpperCase = sSecondTitle.toUpperCase();
		if (sFirstTitleUpperCase === sSecondTitleUpperCase) {
			if (sFirstTitle === sSecondTitle) {
				return 0;
			}
			if (sFirstTitle < sSecondTitle) {
				return -1;
			}
			if (sFirstTitle > sSecondTitle) {
				return 1;
			}
		}
		if (sFirstTitleUpperCase < sSecondTitleUpperCase) {
			return -1;
		}
		if (sFirstTitleUpperCase > sSecondTitleUpperCase) {
			return 1;
		}
	}

	function logNoChangeHandler(oVariant, oChange) {
		Log.error("No change handler for change with the ID '" + oChange.getId() +
			"' and type '" + oChange.getChangeType() + "' defined.\n" +
			"The variant '" + oVariant.getId() + "'was not modified'");
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
		merge: function (mCompVariants, sStandardVariantTitle, aVariants) {
			aVariants = aVariants || [];
			aVariants = aVariants.map(function (oVariant) {
				return new Variant(oVariant);
			});
			aVariants = aVariants.concat(mCompVariants.variants);
			aVariants.sort(compareTitle);

			if (mCompVariants.standardVariant) {
				aVariants.splice(0, 0, new Variant(mCompVariants.standardVariant));
			} else {
				var oStandardVariant = new Variant({
					fileName: "*standard*",
					content: {
						favorite: true
					},
					texts: {
						variantName: {
							value: sStandardVariantTitle
						}
					}
				});
				aVariants.splice(0, 0, oStandardVariant);
			}


			var mChanges = getChangesMappedByVariant(mCompVariants);

			aVariants.forEach(function (oVariant) {
				var sVariantId = oVariant.getId();
				if (mChanges[sVariantId]) {
					mChanges[sVariantId].forEach(function (oChange) {
						var oChangeHandler = mChangeHandlers[oChange.getChangeType()] || logNoChangeHandler;
						oChangeHandler(oVariant, oChange);
					});
				}
			});

			return aVariants;
		}
	};
});