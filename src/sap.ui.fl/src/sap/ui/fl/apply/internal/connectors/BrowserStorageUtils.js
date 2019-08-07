/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/Utils"
], function (
	merge,
	Utils
) {
	"use strict";

	/**
	 * Util class for Connector implementations (apply and write)
	 *
	 * @namespace sap.ui.fl.apply.internal.connectors.Utils
	 * @experimental Since 1.70
	 * @since 1.70
	 * @version ${version}
	 * @ui5-restricted sap.ui.fl.apply.internal, sap.ui.fl.write.internal
	 */

	var FL_CHANGE_KEY = "sap.ui.fl.change";
	var FL_VARIANT_KEY = "sap.ui.fl.variant";

	function fakeStandardVariant(sVariantManagementReference) {
		return {
			fileName: sVariantManagementReference,
			fileType: "ctrl_variant",
			variantManagementReference: sVariantManagementReference,
			variantReference: "",
			content: {
				title: sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl").getText("STANDARD_VARIANT_TITLE")
			}
		};
	}

	function getVariantStructure(oVariant, aControlChanges, mVariantChanges) {
		return {
			content: oVariant,
			controlChanges: aControlChanges,
			variantChanges: mVariantChanges
		};
	}

	function getVariantManagementStructure(aVariants, mVariantManagementChanges) {
		return {
			variants : aVariants,
			variantManagementChanges : mVariantManagementChanges
		};
	}

	function forEachVariant(mResult, fnCallback) {
		Object.keys(mResult.variantSection).forEach(function (sVariantManagementReference) {
			var aVariants = mResult.variantSection[sVariantManagementReference].variants;
			aVariants.forEach(fnCallback);
		});
	}

	function forSpecificVariant(mResult, sVariantManagementReference, sVariantReference, fnCallback) {
		mResult.variantSection[sVariantManagementReference].variants.some(function(oVariant) {
			if (oVariant.content.fileName === sVariantReference) {
				fnCallback(oVariant);
				return true;
			}
		});
	}

	function getReferencedChanges(mResult, oCurrentVariant) {
		var aReferencedChanges = [];
		forSpecificVariant(mResult, oCurrentVariant.content.variantManagementReference, oCurrentVariant.content.variantReference, function (oVariant) {
			aReferencedChanges = oVariant.controlChanges.filter(function (oReferencedChange) {
				return Utils.compareAgainstCurrentLayer(oReferencedChange.layer, oCurrentVariant.layer) === -1;
			});
			if (oVariant.content.variantReference) {
				aReferencedChanges = getReferencedChanges(mResult, oVariant).concat(aReferencedChanges);
			}
		});

		return aReferencedChanges;
	}

	return {
		/**
		* The iterator for the fl changes in the given Storage
		* @public
		* @param {Storage} oStorage browser storage, can be either session or local storage
		* @param {function} fnPredicate The function to apply for each  cahnge
		*/
		forEachChangeInStorage: function(oStorage, fnPredicate) {
			var aKeys = Object.keys(oStorage);
			aKeys.forEach(function(sKey) {
				if (sKey.includes(FL_CHANGE_KEY) || sKey.includes(FL_VARIANT_KEY)) {
					fnPredicate(sKey);
				}
			});
		},

		/**
		 * Creates the fl change key
		 * @param  {string} sId The change id
		 * @returns {string} the prefixed id
		 */
		createChangeKey: function(sId) {
			if (sId) {
				return FL_CHANGE_KEY + "." + sId;
			}
		},

		/**
		 * Creates the fl variant key
		 * @param  {string} sId The variant id
		 * @returns {string} the prefixed id
		 */
		createVariantKey: function(sId) {
			if (sId) {
				return FL_VARIANT_KEY + "." + sId;
			}
		},

		createChangesMapWithVariants: function(aVariants) {
			function checkForDuplicates(aExistingVariants, oNewVariantFromChange) {
				return aExistingVariants.some(function(oVariant) {
					return oVariant.content.fileName === oNewVariantFromChange.fileName;
				});
			}

			var mResult = {
				changes: [],
				variantSection: {}
			};

			aVariants = aVariants || [];
			var oVariantManagementSection = {};
			aVariants.forEach(function(oVariant) {
				oVariantManagementSection = mResult.variantSection[oVariant.variantManagementReference];
				//if VariantManagement doesn't exist
				if (!oVariantManagementSection) {
					var oStandardVariant = fakeStandardVariant(oVariant.variantManagementReference);
					oVariantManagementSection = getVariantManagementStructure(
						[getVariantStructure(oStandardVariant, [], {}), getVariantStructure(oVariant, [], {})],
						{}
					);
					mResult.variantSection[oVariant.variantManagementReference] = oVariantManagementSection;
				} else if (!checkForDuplicates(oVariantManagementSection.variants, oVariant)) {
					oVariantManagementSection.variants.push(getVariantStructure(oVariant, [], {}));
				}
			});

			return mResult;
		},

		addChangesToMap: function(mChangesMap, mGroupedChanges) {
			function addChangeToVariant(mChangesMap, sVariantManagementReference, oChange) {
				forSpecificVariant(mChangesMap, sVariantManagementReference, oChange.variantReference, function (oVariant) {
					oVariant.controlChanges.push(oChange);
				});
			}

			function addVariantChangeToVariant(mChangesMap, sVariantManagementReference, oVariantChange) {
				forSpecificVariant(mChangesMap, sVariantManagementReference, oVariantChange.selector.id, function (oVariant) {
					if (!oVariant.variantChanges[oVariantChange.changeType]) {
						oVariant.variantChanges[oVariantChange.changeType] = [];
					}
					oVariant.variantChanges[oVariantChange.changeType].push(oVariantChange);
				});
			}

			function checkIfVariantExists(mChangesMap, sVariantReference) {
				return Object.keys(mChangesMap.variantSection).some(function (sVariantManagementReference) {
					var aVariants = mChangesMap.variantSection[sVariantManagementReference].variants;
					return aVariants.some(function(oVariant) {
						return oVariant.content.fileName === sVariantReference;
					});
				});
			}

			if (!mChangesMap || !mChangesMap.changes || !mChangesMap.variantSection) {
				throw Error("Passed changes map is not valid");
			}

			var mVariantManagementChanges = {};
			mGroupedChanges.controlVariantManagementChanges.forEach(function(oVariantManagementChange) {
				var sVariantManagementReference = oVariantManagementChange.selector.id;
				if (!mChangesMap.variantSection[sVariantManagementReference]) {
					mChangesMap.variantSection[sVariantManagementReference] = getVariantManagementStructure(
						[getVariantStructure(fakeStandardVariant(sVariantManagementReference), [], {})],
						{}
					);
				}
				mVariantManagementChanges = mChangesMap.variantSection[sVariantManagementReference].variantManagementChanges;
				if (!mVariantManagementChanges[oVariantManagementChange.changeType]) {
					mVariantManagementChanges[oVariantManagementChange.changeType] = [];
				}
				mVariantManagementChanges[oVariantManagementChange.changeType].push(oVariantManagementChange);
			});

			mGroupedChanges.uiChanges.forEach(function(oChange) {
				if (!oChange.variantReference) {
					mChangesMap.changes.push(oChange);
				} else if (!checkIfVariantExists(mChangesMap, oChange.variantReference)) {
					mChangesMap.variantSection[oChange.variantReference] = getVariantManagementStructure(
						[getVariantStructure(fakeStandardVariant(oChange.variantReference), [oChange], {})],
						{}
					);
				} else {
					Object.keys(mChangesMap.variantSection).forEach(function(sVariantManagementReference) {
						addChangeToVariant(mChangesMap, sVariantManagementReference, oChange);
					});
				}
			});

			mGroupedChanges.controlVariantChanges.forEach(function(oVariantChange) {
				if (!checkIfVariantExists(mChangesMap, oVariantChange.selector.id)) {
					var mVariantChanges = {};
					mVariantChanges[oVariantChange.changeType] = [oVariantChange];
					mChangesMap.variantSection[oVariantChange.selector.id] = getVariantManagementStructure(
						[getVariantStructure(fakeStandardVariant(oVariantChange.selector.id), [], mVariantChanges)],
						{}
					);
				} else {
					Object.keys(mChangesMap.variantSection).forEach(function (sVariantManagementReference) {
						addVariantChangeToVariant(mChangesMap, sVariantManagementReference, oVariantChange);
					});
				}
			});

			return mChangesMap;
		},

		sortChanges: function(mResult) {
			function byLayerThenCreation(oChangeA, oChangeB) {
				var iLayerA = Utils.getLayerIndex(oChangeA.layer);
				var iLayerB = Utils.getLayerIndex(oChangeB.layer);
				if (iLayerA !== iLayerB) {
					return iLayerA - iLayerB;
				}
				return new Date(oChangeA.creation) - new Date(oChangeB.creation);
			}

			if (mResult.changes) {
				mResult.changes.sort(byLayerThenCreation);
			}
			if (mResult.variantSection) {
				forEachVariant(mResult, function (oVariant) {
					oVariant.controlChanges.sort(byLayerThenCreation);
				});
			}

			return mResult;
		},

		assignVariantReferenceChanges: function(mResult) {
			var mOriginalChangesMap = merge({}, mResult);
			forEachVariant(mOriginalChangesMap, function (oVariant) {
				var sVariantReference = oVariant.content.variantReference;
				var aExistingChanges = oVariant.controlChanges;
				if (sVariantReference) {
					// Referenced changes should be applied first
					aExistingChanges = getReferencedChanges(mOriginalChangesMap, oVariant).concat(aExistingChanges);
				}
				forSpecificVariant(mResult, oVariant.content.variantManagementReference, oVariant.content.fileName, function (oCurrentVariant) {
					oCurrentVariant.controlChanges = aExistingChanges;
				});
			});

			return mResult;
		}
	};
});
