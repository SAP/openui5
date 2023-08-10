/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/Utils",
	"sap/base/Log"
], function(
	merge,
	XmlTreeModifier,
	Component,
	FlexState,
	ManifestUtils,
	ControlVariantApplyAPI,
	Applier,
	ChangePersistenceFactory,
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
	 * @experimental Since 1.27.0
	 */
	var XmlPreprocessor = function() {};

	XmlPreprocessor.NOTAG = "<NoTag>";

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

			var oComponent = Component.get(mProperties.componentId);

			if (!oComponent) {
				Log.warning("View is generated without a component. Flexibility features are not possible.");
				return oView;
			}

			var oAppComponent = Utils.getAppComponentForControl(oComponent);
			if (!Utils.isApplication(oAppComponent.getManifestObject())) {
				// we only consider components whose type is application. Otherwise, we might send request for components that can never have changes.
				return oView;
			}

			const mPropertyBag = merge({
				appComponent: oAppComponent,
				modifier: XmlTreeModifier,
				view: oView
			}, mProperties);
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oAppComponent);
			const aChanges = await oChangePersistence.getChangesForView(mPropertyBag);

			await Applier.applyAllChangesForXMLView(mPropertyBag, aChanges);

			Log.debug("flex processing view " + mProperties.id + " finished");
			return oView;
		} catch (error) {
			var sError = "view " + mProperties.id + ": " + error;
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
		var oComponent = Component.get(mProperties.componentId);
		var oAppComponent = Utils.getAppComponentForControl(oComponent);

		// no caching possible with startup parameter based variants
		if (Utils.isVariantByStartupParameter(oAppComponent)) {
			return undefined;
		}

		var sFlexReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);

		let sCacheKey = XmlPreprocessor.NOTAG;
		if (sFlexReference) {
			const oWrappedChangeFileContent = await FlexState.getStorageResponse(sFlexReference);
			if (oWrappedChangeFileContent?.cacheKey) {
				sCacheKey = trimEtag(oWrappedChangeFileContent.cacheKey);

				const oVariantModel = await ControlVariantApplyAPI.getVariantModel(oAppComponent);
				// If there are no changes, the standard variant is created after the variant management control is instantiated
				// When the cache key is calculated before this happens, the standard variant id is unknown
				// To avoid inconsistencies between page load and navigation scenarios, all standard variants are filtered
				var aVariantManagementControlIds = oVariantModel.getVariantManagementControlIds();
				var aCurrentControlVariantIds = oVariantModel.getCurrentControlVariantIds()
				.filter(function(sVariantId) {
					// FIXME: The standard variant flag should be part of the variant instance
					// This can be changed once the variant data selector is ready
					// For now rely on the fact that standard variants have the same name as the vm control
					return !aVariantManagementControlIds.includes(sVariantId);
				});
				sCacheKey = concatControlVariantIdWithCacheKey(sCacheKey, aCurrentControlVariantIds.join("-"));
			}
		}

		return sCacheKey;
	};

	return XmlPreprocessor;
}, /* bExport= */true);