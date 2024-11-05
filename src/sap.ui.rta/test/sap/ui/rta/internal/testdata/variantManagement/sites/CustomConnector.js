/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils",
	"sap/ui/fl/write/_internal/connectors/LocalStorageConnector"
], function(
	merge,
	ObjectStorageUtils,
	LocalStorageConnector
) {
	"use strict";

	function loadDataFromStorage(mPropertyBag) {
		const aFlexObjects = [];

		return ObjectStorageUtils.forEachObjectInStorage(mPropertyBag, function(mFlexObject) {
			aFlexObjects.push(mFlexObject.changeDefinition);
		}).then(function() {
			return aFlexObjects;
		});
	}

	/**
	 * Connector extending the LocalStorageConnector with the capability to lazy load variants.
	 * Withholds all variant related flex objects if the URL parameter "sap-ui-fl-xx-lazyLoadVariants" is set to "true".
	 *
	 * @namespace sap.ui.rta.test.CustomConnector
	 * @since 1.130
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Connector
	 */
	const CustomConnector = merge({}, LocalStorageConnector /** @lends sap.ui.rta.test.CustomConnector */);

	CustomConnector.loadFlexData = async function(...aArgs) {
		const aResponses = await LocalStorageConnector.loadFlexData.apply(this, aArgs);

		// if lazy loading is enabled, all variant related flex objects are removed
		const bLazyLoad = new URLSearchParams(window.location.search).get("sap-ui-fl-xx-lazyLoadVariants") === "true";
		if (bLazyLoad) {
			aResponses.forEach((oFlexData) => {
				// eslint-disable-next-line no-console
				console.warn(oFlexData.variants.map((oVariant) => oVariant.fileName));
				oFlexData.variants = [];
				oFlexData.variantManagementChanges = [];
				oFlexData.variantChanges = [];
				oFlexData.variantDependentControlChanges = [];
			});
		}
		return aResponses;
	};

	CustomConnector.loadFlVariants = async function(mPropertyBag) {
		const aFlexObjects = await loadDataFromStorage({
			storage: this.storage,
			reference: mPropertyBag.reference
		});
		const oReturn = {};
		oReturn.variants = aFlexObjects.filter((oFlexObject) => {
			return oFlexObject.fileType === "ctrl_variant" &&
				(mPropertyBag.variantReferences.includes(oFlexObject.fileName) ||
				mPropertyBag.variantReferences.includes(oFlexObject.variantReference));
		});
		const aBaseVariantIds = oReturn.variants.map((oVariant) => oVariant.variantReference);
		const aBaseVariants = aFlexObjects.filter((oFlexObject) => aBaseVariantIds.includes(oFlexObject.fileName));
		oReturn.variants = [...oReturn.variants, ...aBaseVariants];
		const aAllNeededVariantIds = [...mPropertyBag.variantReferences, ...aBaseVariantIds];
		oReturn.variantDependentControlChanges = aFlexObjects.filter((oFlexObject) => {
			return oFlexObject.fileType === "change" && aAllNeededVariantIds.includes(oFlexObject.variantReference);
		});
		oReturn.variantChanges = aFlexObjects.filter((oFlexObject) => {
			return aAllNeededVariantIds.includes(oFlexObject.selector?.id);
		});
		oReturn.variantManagementChanges = aFlexObjects.filter((oFlexObject) => {
			return aAllNeededVariantIds.includes(oFlexObject.content?.defaultVariant);
		});
		return oReturn;
	};

	return CustomConnector;
});
