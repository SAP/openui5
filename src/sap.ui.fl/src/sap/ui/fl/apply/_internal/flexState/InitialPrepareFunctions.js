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
		// TODO: remove fallback to empty array and adjust tests that don't use the whole changes structure
		var aRelevantFlexObjects = []
		.concat(mPropertyBag.storageResponse.changes.variants || [])
		.concat(mPropertyBag.storageResponse.changes.variantDependentControlChanges || [])
		.concat(mPropertyBag.storageResponse.changes.variantChanges || []);

		aRelevantFlexObjects.forEach(function(oFlexObject) {
			var sVariantReference = oFlexObject.fileType === "ctrl_variant_change"
				? oFlexObject.selector.id
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
