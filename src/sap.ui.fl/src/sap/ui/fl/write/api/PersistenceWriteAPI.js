/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/internal/ChangesController",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/base/util/includes",
	"sap/ui/fl/write/internal/SaveAs"
], function(
	ChangesController,
	JsControlTreeModifier,
	DescriptorInlineChangeFactory,
	includes,
	SaveAs
) {
	"use strict";

	/**
	 * Provides an API to handle requests sent to the Flex Persistence.
	 *
	 * @namespace
	 * @name sap.ui.fl.write.api.PersistenceWriteAPI
	 * @author SAP SE
	 * @experimental Since 1.68
	 * @since 1.68
	 * @version ${version}
	 * @public
	 *
	 */
	var PersistenceWriteAPI = {
		/**
		 * Determines if user specific changes or variants are present in the flex persistence.
		 *
		 * @param {sap.ui.fl.Selector} vSelector - To retrieve the associated flex persistence
		 * @param {object} [mPropertyBag] - Contains additional data needed for checking personalization
		 * @param {string} [mPropertyBag.upToLayer] - layer to compare with
		 * @param {boolean} [mPropertyBag.ignoreMaxLayerParameter] - Indicates that personalization shall be checked without max layer filtering
		 * @returns {Promise<boolean>} Promise resolving to a boolean, indicating if a personalization change created during runtime is active in the application
		 * @public
		 */
		hasHigherLayerChanges: function (vSelector, mPropertyBag) {
			return ChangesController.getFlexControllerInstance(vSelector)
				.hasHigherLayerChanges(mPropertyBag);
		},

		/**
		 * Saves all flex changes and descriptor changes on the relevant flex persistence.
		 *
		 * @param {sap.ui.fl.Selector} vSelector - To retrieve the associated flex persistence
		 * @param {boolean} [bSkipUpdateCache] - If cache update should be skipped
		 *
		 * @returns {Promise} resolving with an array of responses or rejecting with the first error
		 * @public
		 */
		save: function (vSelector, bSkipUpdateCache) {
			var oFlexController = ChangesController.getFlexControllerInstance(vSelector);
			var oDescriptorFlexController = ChangesController.getDescriptorFlexControllerInstance(vSelector);
			return oFlexController.saveAll(bSkipUpdateCache)
				.then(oDescriptorFlexController.saveAll.bind(oDescriptorFlexController, bSkipUpdateCache))
				.then(PersistenceWriteAPI._getUIChanges.bind(null, vSelector, {invalidateCache: true}));
		},

		/**
		 * Saves the app variant to backend.
		 *
		 * @param {sap.ui.fl.Selector} vSelector - a selector
		 * @param {object} mPropertyBag property bag
		 * @param {string} mPropertyBag.id App Variant ID
		 * @param {string} [mPropertyBag.package] the package info for the app variant - Smart Business must pass the package
		 * @param {string} [mPropertyBag.transport] the transport request for the app variant - Smart Business must pass the package
		 * @param {string} [mPropertyBag.version] version of the app variant (optional)
		 * @param {string} [mPropertyBag.layer] the proposed layer (might be overwritten by the backend) when creating a new app variant. By default 'CUSTOMER' is set
		 * @param {boolean} [mPropertyBag.skipIam=false] indicator whether the default IAM item creation and registration is skipped
		 *
		 * @returns {Promise} resolving with AppVariant save response
		 * @public
		 */
		saveAs: function(vSelector, mPropertyBag) {
			var oFlexController = ChangesController.getDescriptorFlexControllerInstance(vSelector);
			mPropertyBag.reference = oFlexController.getComponentName();

			return SaveAs.saveAs(vSelector, mPropertyBag);
		},

		/**
		 * Deletes the app variant from the backend
		 * @param {sap.ui.fl.Selector} vSelector - a selector
		 * @param {object} [mPropertyBag] property bag
		 * @param {string} [mPropertyBag.transport] the transport request for the app variant - Smart Business must pass the package
		 *
		 * @returns {Promise} resolving with AppVariant deletion response
		 * @public
		 */
		deleteAppVariant: function(vSelector, mPropertyBag) {
			var oFlexController = ChangesController.getDescriptorFlexControllerInstance(vSelector);
			var sReferenceAppId = oFlexController.getComponentName();

			return SaveAs.deleteAppVar(sReferenceAppId, mPropertyBag);
		},

		/**
		 * Reset changes in the backend.
		 * If the reset is performed for an entire component, a browser reload is required.
		 * If the reset is performed for a control, this function also triggers a reversion of deleted UI changes.
		 *
		 * @param {sap.ui.fl.Selector} vSelector - To retrieve the associated flex persistence
		 * @param {object} [mPropertyBag] - Contains additional data
		 * @param {string} [mPropertyBag.layer] - Layer for which changes shall be deleted
		 * @param {string} [mPropertyBag.generator] - Generator of changes
		 * @param {string[]} [mPropertyBag.selectorIds] - Selector IDs in local format
		 * @param {string[]} [mPropertyBag.changeTypes] - Types of changes
		 *
		 * @returns {Promise} Promise that resolves after the deletion took place
		 */
		reset: function (vSelector, mPropertyBag) {
			var oAppComponent = ChangesController.getAppComponentForSelector(vSelector);
			var oFlexController = ChangesController.getFlexControllerInstance(oAppComponent);
			var oDescriptorFlexController = ChangesController.getDescriptorFlexControllerInstance(oAppComponent);
			return oFlexController.resetChanges(mPropertyBag.layer, mPropertyBag.generator, oAppComponent, mPropertyBag.selectorIds, mPropertyBag.changeTypes)
				.then(oDescriptorFlexController.resetChanges.bind(oDescriptorFlexController, mPropertyBag.layer, mPropertyBag.generator, oAppComponent, mPropertyBag.selectorIds, mPropertyBag.changeTypes));
		},

		/**
		 * Transports all the UI changes and app variant descriptor (if exists) to the target system.
		 *
		 * @param {sap.ui.fl.Selector} vSelector - To retrieve the associated flex persistence
		 * @param {object} mPropertyBag - Contains additional data
		 * @param {string} mPropertyBag.styleClass - RTA style class name
		 * @param {string} mPropertyBag.layer - Working layer
		 * @param {array} [mPropertyBag.appVariantDescriptors] - an array of app variant descriptors which needs to be transported
		 *
		 * @returns {Promise} promise that resolves when all the artifacts are successfully transported
		 * @private
		 * TODO: Must be changed in future.
		 */
		publish: function(vSelector, mPropertyBag) {
			var oAppComponent = ChangesController.getAppComponentForSelector(vSelector);
			return ChangesController.getFlexControllerInstance(oAppComponent)
				._oChangePersistence.transportAllUIChanges({}, mPropertyBag.styleClass, mPropertyBag.layer, mPropertyBag.appVariantDescriptors);
		},

			/**
		 * Retrieves the changes from the flex persistence for the selector.
		 *
		 * @param {sap.ui.fl.Change} oChange - Change instance
		 *
		 * @returns {Boolean} Returns a boolean value if it is a descriptor change
		 * @private
		 */
		_isDescriptorChange: function(oChange) {
			return (oChange._getMap
				&& includes(DescriptorInlineChangeFactory.getDescriptorChangeTypes(), oChange._getMap().changeType))
				|| (oChange.getChangeType && includes(DescriptorInlineChangeFactory.getDescriptorChangeTypes(), oChange.getChangeType()));
		},

		/**
		 * Adds a change to the flex persistence.
		 * If it's a descriptor change, then a transport request is set.
		 *
		 * @param {sap.ui.fl.Change} oChange - Change instance
		 * @param {sap.ui.fl.Selector} vSelector - To retrieve the associated flex persistence
		 * @public
		 */
		add: function (oChange, vSelector) {
			if (this._isDescriptorChange(oChange)) {
				return oChange.store();
			}
			var oAppComponent = ChangesController.getAppComponentForSelector(vSelector);
			return ChangesController.getFlexControllerInstance(oAppComponent).addPreparedChange(oChange, oAppComponent);
		},

		/**
		 * Removes a change from from the applied changes on a control and from flex persistence map
		 *
		 * @param {sap.ui.fl.Change} oChange - Change to be removed
		 * @param {sap.ui.fl.Selector} vSelector - To retrieve the associated flex persistence
		 *
		 * @public
		 */
		remove: function (oChange, vSelector) {
			var oAppComponent = ChangesController.getAppComponentForSelector(vSelector);
			// descriptor change
			if (this._isDescriptorChange(oChange)) {
				var oDescriptorFlexController = ChangesController.getDescriptorFlexControllerInstance(oAppComponent);
				oDescriptorFlexController.deleteChange(oChange, oAppComponent);
				return;
			}
			var oElement = JsControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);
			var oFlexController = ChangesController.getFlexControllerInstance(oElement);
			// remove custom data for flex change
			oFlexController._removeChangeFromControl(oElement, oChange, JsControlTreeModifier);
			// delete from flex persistence map
			oFlexController.deleteChange(oChange, oAppComponent);
		},

		/**
		 * Check if changes exist for the flex persistence associated with the selector control.
		 * If the optional layer parameter is passed then changes are checked on only that layer.
		 *
		 * @param {sap.ui.fl.Selector} vSelector - To retrieve the associated flex persistence
		 * @param {object} [mPropertyBag] Contains additional Data
		 * @param {string} [mPropertyBag.currentLayer] Layer on which changes should be checked
		 * @returns {Promise<boolean>} Promise resolving to a boolean indicating if changes exist on the optionally passed layer
		 * @public
		 */
		hasChanges: function(vSelector, mPropertyBag) {
			mPropertyBag = mPropertyBag || {};
			mPropertyBag.includeCtrlVariants = true;
			mPropertyBag.invalidateCache = false;
			return PersistenceWriteAPI._getUIChanges(vSelector, mPropertyBag)
				.then(function(aChanges) {
					return aChanges.length > 0;
				});
		},

		/**
		 * Check if changes exist to publish.
		 * If the optional layer parameter is passed then changes are checked on only that layer.
		 *
		 * @param {sap.ui.fl.Selector} vSelector - To retrieve the associated flex persistence
		 * @param {object} [mPropertyBag] Contains additional Data
		 * @param {string} [mPropertyBag.currentLayer] Layer on which changes should be checked
		 * @returns {Promise<boolean>} Promise resolving to a boolean indicating if changes exist on the optionally passed layer
		 * @public
		 */
		hasChangesToPublish: function(vSelector, mPropertyBag) {
			return PersistenceWriteAPI.hasChanges(vSelector, mPropertyBag)
				.then(function(bChangesExist) {
					if (!bChangesExist) {
						return ChangesController.getFlexControllerInstance(vSelector)
							._oChangePersistence.getDirtyChanges().length > 0
						|| ChangesController.getDescriptorFlexControllerInstance(vSelector)
							._oChangePersistence.getDirtyChanges().length > 0;
					}
					return true;
				});
		},

		/**
		 * Retrieves the changes from the flex persistence for the selector.
		 *
		 * @param {sap.ui.fl.Selector} vSelector Selector to retrieve the associated flex persistence
		 * @param {map} [mPropertyBag] Contains additional Data needed for reading changes
		 * @param {object} [mPropertyBag.appDescriptor] - Manifest that belongs to the current running component
		 * @param {string} [mPropertyBag.siteId] - ID of the site belonging to the current running component
		 * @param {string} [mPropertyBag.currentLayer] - Specifies a single layer for loading changes. If this parameter is set, the max layer filtering is not applied
		 * @param {boolean} [mPropertyBag.ignoreMaxLayerParameter] - Indicates that changes shall be loaded without layer filtering
		 * @param {boolean} [mPropertyBag.includeVariants] - Indicates that smart variants shall be included
		 * @param {string} [mPropertyBag.cacheKey] - Key to validate the cache entry stored on client side
		 * @param {boolean} [mPropertyBag.invalidateCache] - should the cache be invalidated
		 *
		 * @returns {Promise} Promise resolves with a map of all change instances {@see sap.ui.fl.Change}
		 * @private
		 */
		_getUIChanges: function(vSelector, mPropertyBag) {
			mPropertyBag = mPropertyBag || {};
			return ChangesController.getFlexControllerInstance(vSelector)
				._oChangePersistence.getChangesForComponent(mPropertyBag, mPropertyBag.invalidateCache);
		}
	};
	return PersistenceWriteAPI;
}, true);