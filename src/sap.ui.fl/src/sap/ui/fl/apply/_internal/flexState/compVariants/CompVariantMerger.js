/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/base/Log"
], function(
	CompVariant,
	FlexObjectFactory,
	Log
) {
	"use strict";

	var mChangeHandlers = {
		addFavorite: function (oVariant) {
			oVariant.setFavorite(true);
		},
		removeFavorite: function (oVariant) {
			oVariant.setFavorite(false);
		},
		updateVariant: function (oVariant, oChange) {
			var oChangeContent = oChange.getContent();
			if (oChangeContent.executeOnSelection !== undefined) {
				oVariant.setExecuteOnSelection(oChangeContent.executeOnSelection);
			}
			if (oChangeContent.favorite !== undefined) {
				oVariant.setFavorite(oChangeContent.favorite);
			}
			if (oChangeContent.contexts) {
				oVariant.setContexts(oChangeContent.contexts);
			}

			if (oChangeContent.variantContent) {
				oVariant.setContent(oChangeContent.variantContent, /* bSkipStateChange = */ true);
			}
			var sVariantName = oChange.getText("variantName");
			if (sVariantName) {
				oVariant.setName(sVariantName, /* bSkipStateChange = */ true);
			}
		},
		standardVariant: function (oVariant, oChange) {
			// legacy change on standard variants
			oVariant.setExecuteOnSelection(oChange.getContent().executeOnSelect);
		}
	};

	function getChangesMappedByVariant(mCompVariants) {
		var mChanges = {};

		mCompVariants.changes.forEach(function (oChange) {
			var sVariantId = oChange.getSelector().variantId || oChange.getContent().key;
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
			fileName: oVariantInput.fileName,
			variantId: oVariantInput.id || CompVariant.STANDARD_VARIANT_ID,
			persisted: oVariantInput.persisted,
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
			oVariantData.favorite = oVariantInput.favorite;
		}

		if (oVariantInput.executeOnSelection !== undefined) {
			oVariantData.executeOnSelection = oVariantInput.executeOnSelection;
		}

		return FlexObjectFactory.createCompVariant(oVariantData);
	}

	function applyChangeOnVariant(oVariant, oChange) {
		var oChangeHandler = mChangeHandlers[oChange.getChangeType()] || logNoChangeHandler;
		oChangeHandler(oVariant, oChange);
		oVariant.addChange(oChange);
	}

	function applyChangesOnVariant(mChanges, oVariant) {
		var sVariantId = oVariant.getVariantId();
		if (mChanges[sVariantId]) {
			mChanges[sVariantId].forEach(function (oChange) {
				applyChangeOnVariant(oVariant, oChange);
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
		merge: function (sPersistencyKey, mCompData, oStandardVariantInput) {
			var aVariants = mCompData.nonPersistedVariants.concat(mCompData.variants);
			var mChanges = getChangesMappedByVariant(mCompData);

			// check for an overwritten standard variant
			var oStandardVariant;
			aVariants.forEach(function (oVariant) {
				if (oVariant.getContent() && oVariant.getContent().standardvariant) {
					oStandardVariant = oVariant;
				}
			});

			if (!oStandardVariant) {
				// create a new standard variant with the passed input
				oStandardVariant = createVariant(sPersistencyKey, oStandardVariantInput);
			} else {
				// remove all standard variant entries
				aVariants = aVariants.filter(function (oVariant) {
					return !oVariant.getContent() || !oVariant.getContent().standardvariant;
				});
			}
			// apply all changes on non-standard variants
			aVariants.forEach(applyChangesOnVariant.bind(undefined, mChanges));

			// the standard must always be visible
			oStandardVariant.setFavorite(true);
			oStandardVariant.setStandardVariant(true);
			mCompData.byId[oStandardVariant.getVariantId()] = oStandardVariant;

			var oStandardVariantChange = mCompData.standardVariantChange;
			if (oStandardVariantChange) {
				mChanges[oStandardVariant.getVariantId()] = mChanges[oStandardVariant.getVariantId()] || [];
				mChanges[oStandardVariant.getVariantId()].push(oStandardVariantChange);
				mChanges[oStandardVariant.getVariantId()].sort(function (a, b) {
					if (a.getDefinition().creation < b.getDefinition().creation) {
						return -1;
					}
					if (a.getDefinition().creation > b.getDefinition().creation) {
						return 1;
					}
					return 0;
				});
			}
			applyChangesOnVariant(mChanges, oStandardVariant);

			mCompData.standardVariant = oStandardVariant;


			return {
				standardVariant: oStandardVariant,
				variants: aVariants
			};
		},

		/**
		 * Enhances Standard Variants and non-persisted variants with additional properties and
		 * creates a new CompVariant out of it.
		 *
		 * @function
		 * @since 1.89
		 * @version ${version}
		 * @private
		 * @ui5-restricted sap.ui.fl
		 *
		 * @param {string} sPersistencyKey - Key of the variant management
		 * @param {object} oVariantInput - Standard Variant or non-persisted Variants like oData variant
		 *
		 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} The created variant object
		 */
		createVariant: function(sPersistencyKey, oVariantInput) {
			return createVariant(sPersistencyKey, oVariantInput);
		},
		applyChangeOnVariant: applyChangeOnVariant
	};
});