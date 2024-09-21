/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantMerger",
	"sap/ui/fl/apply/_internal/flexState/compVariants/Utils",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils"
], function(
	CompVariantManagementState,
	CompVariantMerger,
	CompVariantUtils,
	FlexState,
	ManifestUtils,
	LayerUtils,
	Utils
) {
	"use strict";

	function getCompEntities(mPropertyBag) {
		var oControl = mPropertyBag.control;
		var oVMControl = oControl.getVariantManagement?.() || oControl;
		var sSVMControlId = oVMControl.getId();

		return FlexState.initialize({
			reference: mPropertyBag.reference,
			componentData: {},
			manifest: Utils.getAppDescriptor(oControl),
			componentId: Utils.getAppComponentForControl(oControl).getId()
		}).then(function() {
			var mCompVariantsMap = FlexState.getCompVariantsMap(mPropertyBag.reference);
			// Store external input data to FlexState so they can be restored after invalidating cache
			FlexState.setInitialNonFlCompVariantData(
				mPropertyBag.reference,
				mPropertyBag.persistencyKey,
				mPropertyBag.standardVariant,
				mPropertyBag.variants,
				sSVMControlId
			);
			return mCompVariantsMap._initialize(mPropertyBag.persistencyKey, mPropertyBag.variants, sSVMControlId);
		});
	}

	/**
	 * Object containing data for a SmartVariantManagement control.
	 *
	 * @typedef {object} sap.ui.fl.apply.api.SmartVariantManagementApplyAPI.Response
	 * @property {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} variants - Variants for the control
	 * @property {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} changes - Changes on variants for the control
	 * @property {sap.ui.fl.apply._internal.flexObjects.FlexObject | undefined} defaultVariant - DefaultVariant change to be applied
	 * @property {sap.ui.fl.apply._internal.flexObjects.FlexObject | undefined} standardVariant - StandardVariant change to be applied
	 * @since 1.83
	 * @private
	 * @ui5-restricted sap.ui.comp
	 */

	/**
	 * Provides an API to handle specific functionalities for the <code>sap.ui.comp</code> library.
	 *
	 * @namespace sap.ui.fl.apply.api.SmartVariantManagementApplyAPI
	 * @since 1.69.0
	 * @private
	 * @ui5-restricted sap.ui.comp
	 */
	var SmartVariantManagementApplyAPI = /** @lends sap.ui.fl.apply.api.SmartVariantManagementApplyAPI */{
		/**
		 * @typedef {object} sap.ui.fl.apply.api.SmartVariantManagementApplyAPI.LoadVariantsInput
		 * @param {string} id - ID of the variant
		 * @param {string} name - Title of the variant
		 * @param {boolean} [favorite=false] - Flag if the favorite property should be set
		 * @param {boolean} [executeOnSelection=false] - Flag if the favorite property should be set
		 * @param {object} [content={}] - Filter values of the variant
		 *
		 * @private
		 * @ui5-restricted
		 */

		/**
		 * @typedef {object} sap.ui.fl.apply.api.SmartVariantManagementApplyAPI.LoadVariantsResponse
		 * @property {sap.ui.fl._internal.flexObjects.Variant} standardVariant - The instance of the passed or exchanged standard variant
		 * @property {sap.ui.fl._internal.flexObjects.Variant[]} variants - instances of the passed, loaded and changed variants
		 * @property {string} defaultVariantId - ID of the default variant
		 *
		 * @private
		 * @ui5-restricted sap.ui.comp
		 */

		/**
		 * Calls the back end asynchronously and fetches all {@link sap.ui.fl.apply._internal.flexObjects.FlexObject}s
		 * and variants pointing to this control.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
		 * 	sap.ui.comp.smartfilterbar.SmartFilterBar|
		 * 	sap.ui.comp.smarttable.SmartTable|
		 * 	sap.ui.comp.smartchart.SmartChart} mPropertyBag.control - Variant management control to load variants for
		 * @param {sap.ui.fl.apply.api.SmartVariantManagementApplyAPI.LoadVariantsInput} mPropertyBag.standardVariant - The standard variant of the control;
		 * a standard variant is created into the response but may be replaced later if data is loaded afterwards
		 * instructing the SVM to do so
		 * @param {sap.ui.fl.apply.api.SmartVariantManagementApplyAPI.LoadVariantsInput[]} mPropertyBag.variants - Variant data from other data providers like an OData service
		 * @returns {Promise<sap.ui.fl.apply.api.SmartVariantManagementApplyAPI.LoadVariantsResponse>} Object with the standard variant and the variants
		 *
		 * @private
		 * @ui5-restricted sap.ui.comp
		 */
		async loadVariants(mPropertyBag) {
			mPropertyBag.reference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.control);
			mPropertyBag.persistencyKey = CompVariantUtils.getPersistencyKey(mPropertyBag.control);

			const mCompMaps = await getCompEntities(mPropertyBag);

			const mMergedCompVariants = CompVariantMerger.merge(
				mPropertyBag.persistencyKey,
				mCompMaps,
				mPropertyBag.standardVariant,
				mPropertyBag.control
			);

			mMergedCompVariants.defaultVariantId = CompVariantManagementState.getDefaultVariantId({
				persistencyKey: mPropertyBag.persistencyKey,
				reference: mPropertyBag.reference,
				variants: mMergedCompVariants.variants
			});
			return mMergedCompVariants;
		}
	};

	return SmartVariantManagementApplyAPI;
});
