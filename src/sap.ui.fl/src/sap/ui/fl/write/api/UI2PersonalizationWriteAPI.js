/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/UI2Personalization/UI2PersonalizationState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/ChangesController"
], function(
	UI2PersonalizationState,
	FlexState,
	ChangesController
) {
	"use strict";

	/**
	 * Provides an API to write UI2 personalization.
	 *
	 * @namespace sap.ui.fl.write.api.UI2PersonalizationWriteAPI
	 * @experimental Since 1.71
	 * @since 1.71
	 * @private
	 * @ui5-restricted
	 */
	var UI2PersonalizationWriteAPI = /** @lends sap.ui.fl.write.api.UI2PersonalizationWriteAPI */{
		/**
		 * Stores a personalization object for an application under a given container key and item name pair.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - To retrieve the associated flex persistence
		 * @param {string} mPropertyBag.containerKey The key of the container in which the personalization should stored
		 * @param {string} mPropertyBag.itemName The name under which the personalization should be stored
		 * @param {string} mPropertyBag.content The personalization content to be stored
		 * @returns {Promise} Promise resolving with the object stored under the passed container key and item name,
		 * or undefined in case no entry was stored for these
		 *
		 * @private
		 * @ui5-restricted
		 */
		create: function (mPropertyBag) {
			var oFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);
			mPropertyBag.reference = oFlexController.getComponentName();

			if (
				!mPropertyBag.reference
				|| !mPropertyBag.containerKey
				|| !mPropertyBag.itemName
				|| !mPropertyBag.content
			) {
				return Promise.reject(new Error("not all mandatory properties were provided for the storage of the personalization"));
			}

			return FlexState.initialize({
				componentId: mPropertyBag.reference
			})
			.then(function() {
				return UI2PersonalizationState.setPersonalization({
					reference: mPropertyBag.reference,
					containerKey: mPropertyBag.containerKey,
					itemName: mPropertyBag.itemName,
					content: mPropertyBag.content
				});
			});
		},

		/**
		 * Deletes the personalization for a given reference.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - To retrieve the associated flex persistence
		 * @param {string} mPropertyBag.reference The reference of the application for which the personalization should be deleted
		 * @param {string} mPropertyBag.containerKey The key of the container for which the personalization should be deleted
		 * @param {string} mPropertyBag.itemName The name under which the personalization should be deleted
		 * @returns {Promise} Promise resolving in case the deletion request was successful
		 *
		 * @private
		 * @ui5-restricted
		 */
		deletePersonalization: function(mPropertyBag) {
			var oFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);
			mPropertyBag.reference = oFlexController.getComponentName();

			if (
				!mPropertyBag.reference
				|| !mPropertyBag.containerKey
				|| !mPropertyBag.itemName
			) {
				return Promise.reject(new Error("not all mandatory properties were provided for the deletion of the personalization"));
			}

			return FlexState.initialize({
				componentId: mPropertyBag.reference
			})
			.then(function() {
				return UI2PersonalizationState.deletePersonalization(mPropertyBag.reference, mPropertyBag.containerKey, mPropertyBag.itemName);
			});
		}
	};

	return UI2PersonalizationWriteAPI;
}, true);
