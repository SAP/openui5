/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantMerger",
	"sap/ui/fl/apply/_internal/flexState/compVariants/Utils",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils"
], function(
	CompVariantMerger,
	CompVariantUtils,
	FlexState,
	ManifestUtils,
	LayerUtils,
	Utils
) {
	"use strict";

	/**
	 * Returns the SmartVariant <code>ChangeMap</code> from the Change Persistence.
	 *
	 * @param {sap.ui.comp.smartvariants.SmartVariantManagement|
	 * 	sap.ui.comp.smartfilterbar.SmartFilterBar|
	 * 	sap.ui.comp.smarttable.SmartTable|
	 * 	sap.ui.comp.smartchart.SmartChart} oControl - Variant management control
	 * @returns {object} <code>persistencyKey</code> map and corresponding changes, or an empty object
	 * @private
	 */
	function getVariantsMapForKey(oControl) {
		const sReference = ManifestUtils.getFlexReferenceForControl(oControl);
		const sPersistencyKey = CompVariantUtils.getPersistencyKey(oControl);
		const mCompVariantsMap = FlexState.getCompVariantsMap(sReference);
		return mCompVariantsMap._getOrCreate(sPersistencyKey);
	}

	function getCompEntities(mPropertyBag) {
		var oControl = mPropertyBag.control;
		var oVMControl = (oControl.getVariantManagement && oControl.getVariantManagement()) || oControl;
		var sSVMControlId = oVMControl.getId();
		var sReference = ManifestUtils.getFlexReferenceForControl(oControl);

		// TODO clarify why in a test we come here without an initialized FlexState (1980546095)
		return FlexState.initialize({
			reference: sReference,
			componentData: {},
			manifest: Utils.getAppDescriptor(oControl),
			componentId: Utils.getAppComponentForControl(oControl).getId()
		}).then(function() {
			var sPersistencyKey = CompVariantUtils.getPersistencyKey(oControl);
			var mCompVariantsMap = FlexState.getCompVariantsMap(sReference);
			// Store external input data to FlexState so they can be restored after invalidating cache
			FlexState.setInitialNonFlCompVariantData(
				sReference,
				sPersistencyKey,
				mPropertyBag.standardVariant,
				mPropertyBag.variants,
				sSVMControlId
			);
			return mCompVariantsMap._initialize(sPersistencyKey, mPropertyBag.variants, sSVMControlId);
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
	 * @ui5-restricted
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
		 */

		/**
		 * @typedef {object} sap.ui.fl.apply.api.SmartVariantManagementApplyAPI.LoadVariantsResponse
		 * @property {sap.ui.fl._internal.flexObjects.Variant} standardVariant - The instance of the passed or exchanged standard variant
		 * @property {sap.ui.fl._internal.flexObjects.Variant[]} variants - instances of the passed, loaded and changed variants
		 * @property {string} defaultVariantId - ID of the default variant
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
		 */
		async loadVariants(mPropertyBag) {
			const mCompMaps = await getCompEntities(mPropertyBag);
			const sPersistencyKey = CompVariantUtils.getPersistencyKey(mPropertyBag.control);
			const sDefaultVariantId = CompVariantUtils.getDefaultVariantId(getVariantsMapForKey(mPropertyBag.control));
			const mMergedCompVariants = CompVariantMerger.merge(
				sPersistencyKey,
				mCompMaps,
				mPropertyBag.standardVariant,
				mPropertyBag.control
			);
			mMergedCompVariants.defaultVariantId = sDefaultVariantId;
			return mMergedCompVariants;
		},

		/**
		 * Indicates if the VENDOR layer is selected.
		 *
		 * @returns {boolean} <code>true</code> if VENDOR layer is enabled
		 * @private
		 * @ui5-restricted
		 */
		isVendorLayer() {
			return LayerUtils.isVendorLayer();
		},

		/**
		 * Indicates whether the variant downport scenario is enabled or not.
		 * This scenario is only enabled if the current layer is the VENDOR layer
		 * and the URL parameter hotfix is set to <code>true</code>.
		 *
		 * @returns {boolean} <code>true</code> if the variant downport scenario is enabled
		 * @private
		 * @ui5-restricted
		 */
		isVariantDownport() {
			var oUriParams = new URLSearchParams(window.location.search);
			var sIsHotfixMode = oUriParams.get("hotfix");
			return SmartVariantManagementApplyAPI.isVendorLayer() && (sIsHotfixMode === "true");
		},

		/**
		 * Retrieves the default variant for the current control synchronously. WARNING: The consumer has to make sure that the
		 * changes have already been retrieved with <code>getChanges</code>.
		 * It's recommended to use the async API <code>getDefaultVariantId</code>, which works regardless of any preconditions.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - SAPUI5 Smart Variant Management control
		 * @returns {string} ID of the default variant
		 * @private
		 * @ui5-restricted
		 * @deprecated
		 */
		getDefaultVariantId(mPropertyBag) {
			var aDefaultVariantChanges = getVariantsMapForKey(mPropertyBag.control).defaultVariants;
			var oChange = aDefaultVariantChanges[aDefaultVariantChanges.length - 1];
			return oChange ? oChange.getContent().defaultVariantName : "";
		}
	};

	return SmartVariantManagementApplyAPI;
});
