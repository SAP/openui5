/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/UI2Personalization/UI2PersonalizationState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils"
], function(
	UI2PersonalizationState,
	FlexState,
	ManifestUtils
) {
	"use strict";

	/**
	 * Provides an API to access UI2 personalization.
	 *
	 * @namespace sap.ui.fl.apply.api.UI2PersonalizationApplyAPI
	 * @since 1.71
	 * @private
	 * @ui5-restricted
	 */
	var UI2PersonalizationApplyAPI = /** @lends sap.ui.fl.apply.api.UI2PersonalizationApplyAPI */{
		/**
		 * Retrieves a personalization object stored for an application under a given container ID and item name;
		 * in case no itemName is given all items for the given container key are returned.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Used to retrieve the associated flex persistence
		 * @param {string} mPropertyBag.containerKey The key of the container in which the personalization was stored
		 * @param {string} [mPropertyBag.itemName] The item name under which the personalization was stored
		 * @returns {Promise} Promise resolving with the object stored under the passed container key and item name,
		 * or undefined in case no entry was stored for these;
		 * in case no sItemName was passed all entries known for the container key
		 *
		 * @private
	 	 * @ui5-restricted
		 */
		async load(mPropertyBag) {
			mPropertyBag.reference = ManifestUtils.getFlexReferenceForSelector(mPropertyBag.selector);

			if (
				!mPropertyBag.reference
				|| !mPropertyBag.containerKey
			) {
				throw new Error("not all mandatory properties were provided for the loading of the personalization");
			}

			await FlexState.initialize({
				componentId: mPropertyBag.selector.getId()
			});
			return UI2PersonalizationState.getPersonalization(mPropertyBag.reference, mPropertyBag.containerKey, mPropertyBag.itemName);
		}
	};

	return UI2PersonalizationApplyAPI;
});
