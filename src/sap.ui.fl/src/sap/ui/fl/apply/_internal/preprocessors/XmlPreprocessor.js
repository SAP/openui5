/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/Utils",
	"sap/base/Log"
], function(
	merge,
	XmlTreeModifier,
	Component,
	Applier,
	ChangesUtils,
	VariantManagementState,
	FlexObjectState,
	FlexState,
	ManifestUtils,
	Utils,
	Log
) {
	"use strict";

	/**
	 * The implementation of the <code>XmlPreprocessor</code> for the SAPUI5 flexibility services that can be hooked in the <code>View</code> life cycle.
	 *
	 * @alias sap.ui.fl.apply._internal.preprocessors.XmlPreprocessor
	 * @class
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.27.0
	 * @private
	 */
	var XmlPreprocessor = function() {};

	XmlPreprocessor.NOTAG = "<NoTag>";

	/**
	 * Gets the changes for the given view id. The complete view prefix has to match.
	 *
	 * Example:
	 * Change has selector id:
	 * view1--view2--controlId
	 *
	 * Will match for view:
	 * view1--view2
	 *
	 * Will not match for view:
	 * view1
	 * view1--view2--view3
	 *
	 * @param {object} mPropertyBag contains additional data that are needed for reading of changes
	 * @param {string} mPropertyBag.viewId - id of the view
	 * @param {string} mPropertyBag.name - name of the view
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component for the view
	 * @param {string} mPropertyBag.componentId - responsible component's id for the view
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - responsible modifier
	 * @returns {Promise} resolving with an array of changes
	 * @public
	 */
	function getChangesForView(mPropertyBag) {
		const aAllApplicableUIChanges = FlexObjectState.getAllApplicableUIChanges(mPropertyBag.reference);
		return aAllApplicableUIChanges.filter(ChangesUtils.isChangeInView.bind(undefined, mPropertyBag));
	}

	/**
	 * Asynchronous view processing method.
	 *
	 * @param {Node} oView - XML node of the view to process
	 * @param {object} mProperties - Property Bag
	 * @param {string} mProperties.componentId - ID of the component creating the view
	 * @param {string} mProperties.id - ID of the processed view
	 * @returns {Promise.<Node>|Node} Result of the processing, promise if executed asynchronously
	 *
	 * @public
	 */
	XmlPreprocessor.process = async function(oView, mProperties) {
		try {
			// align view id attribute with the js processing (getting the id passed in "viewId" instead of "id"
			mProperties.viewId = mProperties.id;

			var oComponent = Component.getComponentById(mProperties.componentId);

			if (!oComponent) {
				Log.warning("View is generated without a component. Flexibility features are not possible.");
				return oView;
			}

			var oAppComponent = Utils.getAppComponentForControl(oComponent);
			if (!Utils.isApplication(oAppComponent.getManifestObject())) {
				// we only consider components whose type is application to no send request for components that can never have changes
				return oView;
			}

			const sReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);

			await FlexState.waitForInitialization(sReference);

			const mPropertyBag = merge({
				appComponent: oAppComponent,
				modifier: XmlTreeModifier,
				view: oView,
				reference: sReference
			}, mProperties);
			const aChanges = getChangesForView(mPropertyBag);

			await Applier.applyAllChangesForXMLView(mPropertyBag, aChanges);

			Log.debug(`flex processing view ${mProperties.id} finished`);
			return oView;
		} catch (error) {
			var sError = `view ${mProperties.id}: ${error}`;
			Log.info(sError); // to allow control usage in applications that do not work with UI flex and components
			// throw new Error(sError); // throw again, when caller handles the promise
			return oView;
		}
	};

	function concatControlVariantIdWithCacheKey(sCacheKey, sControlVariantIds) {
		if (!sControlVariantIds) {
			return sCacheKey;
		}
		return sCacheKey.concat("-", sControlVariantIds);
	}

	function trimEtag(sCacheKey) {
		return sCacheKey.replace(/(^W\/|")/g, "");
	}

	/**
	 * Asynchronous determination of a hash key for caching purposes
	 *
	 * @param {object} mProperties - Property Bag
	 * @param {string} mProperties.componentId - Component instance ID
	 * @returns {Promise} Resolves with the hash key
	 *
	 * @public
	 */
	XmlPreprocessor.getCacheKey = async function(mProperties) {
		const oComponent = Component.getComponentById(mProperties.componentId);
		const oAppComponent = Utils.getAppComponentForControl(oComponent);

		// no caching possible with startup parameter based variants
		if (Utils.isVariantByStartupParameter(oAppComponent)) {
			return undefined;
		}

		const sFlexReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		let sCacheKey = XmlPreprocessor.NOTAG;
		if (sFlexReference) {
			const oWrappedChangeFileContent = await FlexState.getStorageResponse(sFlexReference);
			if (oWrappedChangeFileContent?.cacheKey) {
				sCacheKey = trimEtag(oWrappedChangeFileContent.cacheKey);

				// If there are no changes, the standard variant is created after the variant management control is instantiated
				// When the cache key is calculated before this happens, the standard variant id is unknown
				// To avoid inconsistencies between page load and navigation scenarios, all standard variants are filtered
				const aFilteredCurrentControlVariantIds = VariantManagementState.getAllCurrentVariants(sFlexReference)
				.filter((oVariant) => !oVariant.getStandardVariant())
				.map((oVariant) => oVariant.getId());
				sCacheKey = concatControlVariantIdWithCacheKey(sCacheKey, aFilteredCurrentControlVariantIds.join("-"));
			}
		}

		return sCacheKey;
	};

	return XmlPreprocessor;
});