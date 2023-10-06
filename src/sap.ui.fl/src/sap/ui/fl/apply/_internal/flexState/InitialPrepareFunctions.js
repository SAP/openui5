/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/base/util/includes",
	"sap/ui/core/Core",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/Layer"
], function(
	includes,
	Core,
	ControlVariantUtils,
	FlexObjectFactory,
	Layer
) {
	"use strict";

	/**
	 * Collection of functions to initialize the FlexState maps
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.InitialPrepareFunctions
	 * @since 1.110
	 * @private
	 * @ui5-restricted
	 */
	var InitialPrepareFunctions = {};

	InitialPrepareFunctions.variants = function(mPropertyBag) {
		var aVariantIds = (mPropertyBag.storageResponse.changes.variants || [])
		.map(function(oVariantDef) {
			return oVariantDef.fileName;
		})
		.concat(
			mPropertyBag.externalData
			.filter(function(oFlexObject) {
				return oFlexObject.getFileType() === "ctrl_variant";
			})
			.map(function(oVariant) {
				return oVariant.getId();
			})
		);

		// Look through the variant references of known variants to find the standard
		// variant id on any variant that directly inherited from it
		// If it is not part of the runtime persistence, create it
		// If there are no custom variants at all, the VariantModel will create the
		// standard variant
		var oUpdate = {
			runtimeOnlyData: {
				flexObjects: []
			}
		};
		var aVariantChanges = mPropertyBag.storageResponse.changes.variants;
		var aRelevantVariantDependentControlChanges = (mPropertyBag.storageResponse.changes.variantDependentControlChanges)
		.filter(function(oControlChangeObject) {
			// Only create fake variants for standard variants and ignore other deleted variants
			// Thus only consider changes on the standard variant
			var bIsChangeOnStandardVariant = oControlChangeObject.isChangeOnStandardVariant;
			if (bIsChangeOnStandardVariant !== undefined && bIsChangeOnStandardVariant !== null) {
				return bIsChangeOnStandardVariant;
			}
			// Legacy changes without the isChangeOnStandardVariant flag need to be determined heuristically
			// based on the variant name pattern defined in fl.Utils
			return !/id_\d{13}_\d*_flVariant/.test(oControlChangeObject.variantReference);
		});
		var aRelevantFlexObjects = aVariantChanges.concat(aRelevantVariantDependentControlChanges);

		aRelevantFlexObjects.forEach(function(oFlexObject) {
			var sVariantReference = oFlexObject.fileType === "ctrl_variant"
				? oFlexObject.variantManagementReference
				: oFlexObject.variantReference;
			if (sVariantReference && !includes(aVariantIds, sVariantReference)) {
				var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.fl");
				var oNewVariant = FlexObjectFactory.createFlVariant({
					id: sVariantReference,
					variantManagementReference: sVariantReference,
					variantName: oResourceBundle.getText("STANDARD_VARIANT_TITLE"),
					layer: Layer.BASE,
					user: ControlVariantUtils.DEFAULT_AUTHOR,
					reference: oFlexObject.reference
				});
				oUpdate.runtimeOnlyData.flexObjects.push(oNewVariant);
				aVariantIds.push(sVariantReference);
			}
		});

		return oUpdate;
	};

	InitialPrepareFunctions.uiChanges = function() {
		// For now this is handled by the ChangePersistence
		// to improve performance until we can distinguish changes during
		// the data selector invalidation
	};

	return InitialPrepareFunctions;
});
