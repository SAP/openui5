/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/flexState/compVariants/Utils",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/Layer"
], function(
	CompVariantState,
	ManifestUtils,
	CompVariantUtils,
	FlexState,
	Layer
) {
	"use strict";

	/**
	 * Provides an API for SAC Integration to update variants of the app <code>sap.ui.comp.smartVariant.SmartVariantManagement</code> programmatically.
	 *
	 * @function
	 * @alias module:sap/ui/fl/write/api/flexState/SacIntegrationAPIupdateVariant
	 * @since 1.124
	 * @deprecated Since 1.124
	 * @private
	 * @ui5-restricted ui.cloudfnd.sac.integration.s1
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.id - ID of variant
	 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - Variant management control in which the variant exists
	 * @param {object} mPropertyBag.content - New content of the variant
	 *
	 * @returns {Promise} Promise which gets resolved after the update and save operation was completed or gets rejected with a first error
	 * @private
	 * @ui5-restricted ui.cloudfnd.sac.integration.s1
	 */
	return (mPropertyBag) => {
		if (!mPropertyBag) {
			return Promise.reject("A property bag must be provided");
		}
		if (!mPropertyBag.control) {
			return Promise.reject("variant management control must be provided");
		}
		if (!mPropertyBag.id) {
			return Promise.reject("variant ID must be provided");
		}
		if (!mPropertyBag.content) {
			return Promise.reject("content must be provided");
		}

		mPropertyBag.reference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.control);
		mPropertyBag.persistencyKey = CompVariantUtils.getPersistencyKey(mPropertyBag.control);

		const aFlexObjects = FlexState.getFlexObjectsDataSelector().get(mPropertyBag);
		const oVariant = aFlexObjects.find((oFlexObject) => oFlexObject.getId() === mPropertyBag.id);

		if (oVariant?.getFileType() !== "variant") {
			return Promise.reject("no variant with the ID found");
		}

		mPropertyBag.layer = oVariant.getLayer();

		if (![Layer.USER, Layer.PUBLIC].includes(mPropertyBag.layer)) {
			return Promise.reject("only variants in the USER and PUBLIC layer can be updated");
		}

		if (!oVariant.isEditEnabled()) {
			return Promise.reject("the user is not authorized to edit the PUBLIC variant (no author nor key user)");
		}

		CompVariantState.updateVariant(mPropertyBag);
		return CompVariantState.persist(mPropertyBag);
	};
});