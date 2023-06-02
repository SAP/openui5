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
		var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.fl");
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

		// Look through the variant management references of known variants to find the standard
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
		(mPropertyBag.storageResponse.changes.variants || []).forEach(function(oVariant) {
			if (!includes(aVariantIds, oVariant.variantManagementReference)) {
				var oNewVariant = FlexObjectFactory.createFlVariant({
					id: oVariant.variantManagementReference,
					variantManagementReference: oVariant.variantManagementReference,
					variantName: oResourceBundle.getText("STANDARD_VARIANT_TITLE"),
					layer: Layer.BASE,
					user: ControlVariantUtils.DEFAULT_AUTHOR,
					reference: oVariant.reference
				});
				oUpdate.runtimeOnlyData.flexObjects.push(oNewVariant);
				aVariantIds.push(oVariant.variantReference);
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
