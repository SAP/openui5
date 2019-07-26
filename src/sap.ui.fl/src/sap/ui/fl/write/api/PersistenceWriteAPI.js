/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/internal/ChangesController",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/base/util/includes",
	"sap/ui/fl/write/internal/SaveAs",
	"sap/ui/fl/Utils"
], function(
	ChangesController,
	JsControlTreeModifier,
	DescriptorInlineChangeFactory,
	includes,
	SaveAs,
	flexUtils
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

	/**
	 * Retrieves the changes from the flex persistence for the selector.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change instance
	 *
	 * @returns {Boolean} Returns a boolean value if it is a descriptor change
	 * @private
	 */
	function isDescriptorChange(oChange) {
		return (oChange._getMap
			&& includes(DescriptorInlineChangeFactory.getDescriptorChangeTypes(), oChange._getMap().changeType))
			|| (oChange.getChangeType && includes(DescriptorInlineChangeFactory.getDescriptorChangeTypes(), oChange.getChangeType()));
	}

	var PersistenceWriteAPI = {
		/**
		 * Determines if user specific changes or variants are present in the flex persistence.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - To retrieve the associated flex persistence
		 * @param {string} [mPropertyBag.upToLayer] - layer to compare with
		 * @param {boolean} [mPropertyBag.ignoreMaxLayerParameter] - Indicates that personalization shall be checked without max layer filtering
		 * @returns {Promise<boolean>} Promise resolving to a boolean, indicating if a personalization change created during runtime is active in the application
		 * @public
		 */
		hasHigherLayerChanges: function (mPropertyBag) {
			return ChangesController.getFlexControllerInstance(mPropertyBag.selector)
				.hasHigherLayerChanges(flexUtils.omit(mPropertyBag, "selector"));
		},

		/**
		 * Saves all flex changes and descriptor changes on the relevant flex persistence.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - To retrieve the associated flex persistence
		 * @param {boolean} [mPropertyBag.skipUpdateCache] - If cache update should be skipped
		 *
		 * @returns {Promise} resolving with an array of responses or rejecting with the first error
		 * @public
		 */
		save: function (mPropertyBag) {
			var oFlexController = ChangesController.getFlexControllerInstance(mPropertyBag.selector);
			var oDescriptorFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);
			mPropertyBag.invalidateCache = true;
			return oFlexController.saveAll(mPropertyBag.skipUpdateCache)
				.then(oDescriptorFlexController.saveAll.bind(oDescriptorFlexController, mPropertyBag.skipUpdateCache))
				.then(PersistenceWriteAPI._getUIChanges.bind(null, flexUtils.omit(mPropertyBag, "skipUpdateCache")));
		},

		/**
		 * Saves the app variant to backend.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - a selector
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
		saveAs: function(mPropertyBag) {
			var oFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);
			mPropertyBag.reference = oFlexController.getComponentName();

			return SaveAs.saveAs(mPropertyBag);
		},

		/**
		 * Deletes the app variant from the backend
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - a selector
		 * @param {string} [mPropertyBag.transport] the transport request for the app variant - Smart Business must pass the package
		 *
		 * @returns {Promise} resolving with AppVariant deletion response
		 * @public
		 */
		deleteAppVariant: function(mPropertyBag) {
			var oFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);
			mPropertyBag.referenceAppId = oFlexController.getComponentName();

			return SaveAs.deleteAppVar(mPropertyBag);
		},

		/**
		 * Reset changes in the backend.
		 * If the reset is performed for an entire component, a browser reload is required.
		 * If the reset is performed for a control, this function also triggers a reversion of deleted UI changes.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - To retrieve the associated flex persistence
		 * @param {string} [mPropertyBag.layer] - Layer for which changes shall be deleted
		 * @param {string} [mPropertyBag.generator] - Generator of changes
		 * @param {string[]} [mPropertyBag.selectorIds] - Selector IDs in local format
		 * @param {string[]} [mPropertyBag.changeTypes] - Types of changes
		 *
		 * @returns {Promise} Promise that resolves after the deletion took place
		 */
		reset: function (mPropertyBag) {
			var oAppComponent = ChangesController.getAppComponentForSelector(mPropertyBag.selector);
			var oFlexController = ChangesController.getFlexControllerInstance(oAppComponent);
			var oDescriptorFlexController = ChangesController.getDescriptorFlexControllerInstance(oAppComponent);
			var aArguments = [mPropertyBag.layer, mPropertyBag.generator, oAppComponent, mPropertyBag.selectorIds, mPropertyBag.changeTypes];
			return oFlexController.resetChanges.apply(oFlexController, aArguments)
				.then(oDescriptorFlexController.resetChanges.bind.apply(
					oDescriptorFlexController.resetChanges, [oDescriptorFlexController].concat(aArguments))
				);
		},

		/**
		 * Transports all the UI changes and app variant descriptor (if exists) to the target system.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - To retrieve the associated flex persistence
		 * @param {string} mPropertyBag.styleClass - RTA style class name
		 * @param {string} mPropertyBag.layer - Working layer
		 * @param {array} [mPropertyBag.appVariantDescriptors] - an array of app variant descriptors which needs to be transported
		 *
		 * @returns {Promise} promise that resolves when all the artifacts are successfully transported
		 * @private
		 * TODO: Must be changed in future.
		 */
		publish: function(mPropertyBag) {
			var oAppComponent = ChangesController.getAppComponentForSelector(mPropertyBag.selector);
			return ChangesController.getFlexControllerInstance(oAppComponent)
				._oChangePersistence.transportAllUIChanges({}, mPropertyBag.styleClass, mPropertyBag.layer, mPropertyBag.appVariantDescriptors);
		},

		/**
		 * Adds a change to the flex persistence.
		 * If it's a descriptor change, then a transport request is set.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Change} mPropertyBag.change - Change instance
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - To retrieve the associated flex persistence
		 * @public
		 */
		add: function (mPropertyBag) {
			if (isDescriptorChange(mPropertyBag.change)) {
				return mPropertyBag.change.store();
			}
			var oAppComponent = ChangesController.getAppComponentForSelector(mPropertyBag.selector);
			return ChangesController.getFlexControllerInstance(oAppComponent).addPreparedChange(mPropertyBag.change, oAppComponent);
		},

		/**
		 * Removes a change from from the applied changes on a control and from flex persistence map
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Change} mPropertyBag.change - Change to be removed
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - To retrieve the associated flex persistence
		 *
		 * @public
		 */
		remove: function (mPropertyBag) {
			var oAppComponent = ChangesController.getAppComponentForSelector(mPropertyBag.selector);
			// descriptor change
			if (isDescriptorChange(mPropertyBag.change)) {
				var oDescriptorFlexController = ChangesController.getDescriptorFlexControllerInstance(oAppComponent);
				oDescriptorFlexController.deleteChange(mPropertyBag.change, oAppComponent);
				return;
			}
			var oElement = JsControlTreeModifier.bySelector(mPropertyBag.change.getSelector(), oAppComponent);
			var oFlexController = ChangesController.getFlexControllerInstance(oElement);
			// remove custom data for flex change
			oFlexController._removeChangeFromControl(oElement, mPropertyBag.change, JsControlTreeModifier);
			// delete from flex persistence map
			oFlexController.deleteChange(mPropertyBag.change, oAppComponent);
		},

		/**
		 * Check if changes exist for the flex persistence associated with the selector control.
		 * If the optional layer parameter is passed then changes are checked on only that layer.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - To retrieve the associated flex persistence
		 * @param {string} [mPropertyBag.currentLayer] - Layer on which changes should be checked
		 * @returns {Promise<boolean>} Promise resolving to a boolean indicating if changes exist on the optionally passed layer
		 * @public
		 */
		hasChanges: function(mPropertyBag) {
			mPropertyBag.includeCtrlVariants = true;
			mPropertyBag.invalidateCache = false;
			return PersistenceWriteAPI._getUIChanges(mPropertyBag)
				.then(function(aChanges) {
					return aChanges.length > 0;
				});
		},

		/**
		 * Check if changes exist to publish.
		 * If the optional layer parameter is passed then changes are checked on only that layer.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - To retrieve the associated flex persistence
		 * @param {string} [mPropertyBag.currentLayer] Layer on which changes should be checked
		 * @returns {Promise<boolean>} Promise resolving to a boolean indicating if changes exist on the optionally passed layer
		 * @public
		 */
		hasChangesToPublish: function(mPropertyBag) {
			return PersistenceWriteAPI.hasChanges(mPropertyBag)
				.then(function(bChangesExist) {
					if (!bChangesExist) {
						return ChangesController.getFlexControllerInstance(mPropertyBag.selector)
							._oChangePersistence.getDirtyChanges().length > 0
						|| ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector)
							._oChangePersistence.getDirtyChanges().length > 0;
					}
					return true;
				});
		},

		/**
		 * Retrieves the changes from the flex persistence for the selector.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector to retrieve the associated flex persistence
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
		_getUIChanges: function(mPropertyBag) {
			return ChangesController.getFlexControllerInstance(mPropertyBag.selector)
				._oChangePersistence.getChangesForComponent(flexUtils.omit(mPropertyBag, ["invalidateCache", "selector"]), mPropertyBag.invalidateCache);
		}
	};
	return PersistenceWriteAPI;
}, true);