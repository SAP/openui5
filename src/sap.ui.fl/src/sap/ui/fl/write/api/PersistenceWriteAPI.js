/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/ChangesController",
	"sap/ui/fl/Cache",
	"sap/ui/fl/Utils",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/base/util/includes"
], function(
	ChangesController,
	Cache,
	Utils,
	JsControlTreeModifier,
	DescriptorInlineChangeFactory,
	includes
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
		NOTAG: Cache.NOTAG,

		/**
		 * Returns a cache key for caching views.
		 *
		 * @param {sap.ui.core.Component} oAppComponent - Application component
		 *
		 * @returns {Promise} Returns a promise with an ETag for caching
		 * @public
		 */
		getCacheKey: function (oAppComponent) {
			var mComponentProperties = {
				name: Utils.getComponentName(oAppComponent),
				appVersion: Utils.getAppVersionFromManifest(oAppComponent.getManifest())
			};
			return Cache.getCacheKey(mComponentProperties, oAppComponent);
		},

		/**
		 * Determines if user specific changes or variants are present in the flex persistence.
		 *
		 * @param {sap.ui.base.ManagedObject} oManagedObject - To retrieve the associated flex persistence
		 * @param {map} [mPropertyBag] - Contains additional data needed for checking personalization
		 * @param {string} [mPropertyBag.upToLayer] - layer to compare with
		 * @param {boolean} [mPropertyBag.ignoreMaxLayerParameter] - Indicates that personalization shall be checked without max layer filtering
		 * @returns {Promise} Resolves with a boolean; true if a personalization change created during runtime is active in the application
		 * @public
		 */
		hasHigherLayerChanges: function (oManagedObject, mPropertyBag) {
			return ChangesController.getFlexControllerInstance(oManagedObject)
				.hasHigherLayerChanges(mPropertyBag);
		},

		/**
		 * Saves all flex changes and descriptor changes on the relevant flex persistence.
		 *
		 * @param {boolean} bSkipUpdateCache - If cache update should be skipped
		 * @param {sap.ui.base.ManagedObject} oManagedObject - Managed object for retrieving the associated flex persistence
		 *
		 * @returns {Promise} resolving with an array of responses or rejecting with the first error
		 * @public
		 */
		saveChanges: function (bSkipUpdateCache, oManagedObject) {
			var oFlexController = ChangesController.getFlexControllerInstance(oManagedObject);
			var oDescriptorFlexController = ChangesController.getDescriptorFlexControllerInstance(oManagedObject);
			return oFlexController.saveAll(bSkipUpdateCache)
				.then(oDescriptorFlexController.saveAll.bind(oDescriptorFlexController));
		},

		/**
		 * Reset changes in the backend.
		 * If the reset is performed for an entire component, a browser reload is required.
		 * If the reset is performed for a control, this function also triggers a reversion of deleted UI changes.
		 *
		 * @param {string} sLayer - Layer for which changes shall be deleted
		 * @param {string} [sGenerator] - Generator of changes
		 * @param {sap.ui.core.Component} [oComponent] - Component instance
		 * @param {string[]} [aSelectorIds] - Selector IDs in local format
		 * @param {string[]} [aChangeTypes] - Types of changes
		 *
		 * @returns {Promise} Promise that resolves after the deletion took place
		 */
		resetChanges: function (sLayer, sGenerator, oComponent, aSelectorIds, aChangeTypes) {
			var oFlexController = ChangesController.getFlexControllerInstance(oComponent);
			var oDescriptorFlexController = ChangesController.getDescriptorFlexControllerInstance(oComponent);
			return oFlexController.resetChanges(sLayer, sGenerator, oComponent, aSelectorIds, aChangeTypes)
				.then(oDescriptorFlexController.resetChanges.bind(oDescriptorFlexController, sLayer, sGenerator, oComponent, aSelectorIds, aChangeTypes));
		},

		/**
		 * Transports all the UI changes and app variant descriptor (if exists) to the target system.
		 *
		 * @param {object} oRootControl - The root control of the running application
		 * @param {string} sStyleClass - RTA style class name
		 * @param {string} sLayer - Working layer
		 * @param {array} [aAppVariantDescriptors] - an array of app variant descriptors which needs to be transported
		 *
		 * @returns {Promise} promise that resolves when all the artifacts are successfully transported
		 * @private
		 * TODO: Must be changed in future.
		 */
		_transportChanges: function(oRootControl, sStyleClass, sLayer, aAppVariantDescriptors) {
			return ChangesController.getFlexControllerInstance(oRootControl)
				._oChangePersistence.transportAllUIChanges(oRootControl, sStyleClass, sLayer, aAppVariantDescriptors);
		},


		/**
		 * Adds a change to the flex persistence.
		 * If it's a descriptor change, then a transport request is set.
		 *
		 * @param {sap.ui.fl.Change} oChange - Change instance
		 * @param {sap.ui.base.ManagedObject} oManagedObject - To retrieve the associated flex persistence
		 * @public
		 */
		add: function (oChange, oManagedObject) {
			if (includes(DescriptorInlineChangeFactory.getDescriptorChangeTypes(), oChange.getChangeType())) {
				return oChange.store();
			}
			var oAppComponent = Utils.getAppComponentForControl(oManagedObject);
			return ChangesController.getFlexControllerInstance(oAppComponent).addPreparedChange(oChange, oAppComponent);
		},

		/**
		 * Removes a change from the flex persistence or from the applied changes on a control with revert.
		 *
		 * @param {sap.ui.fl.Change} oChange - Change to be removed
		 * @param {Object} mPropertyBag - Contains additional Data
		 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component instance
		 * @param {boolean} mPropertyBag.revert - If change should be reverted on control
		 *
		 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Promise or fake promise resolving when changes has been deleted
		 * @public
		 */
		remove: function (oChange, mPropertyBag) {
			// descriptor change
			if (includes(DescriptorInlineChangeFactory.getDescriptorChangeTypes(), oChange.getChangeType())) {
				var oDescriptorFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.appComponent);
				oDescriptorFlexController.deleteChange(oChange, mPropertyBag.appComponent);
				return Promise.resolve();
			}

			// flex change
			var oFlexController = ChangesController.getFlexControllerInstance(mPropertyBag.appComponent);
			if (mPropertyBag.revert) {
				return oFlexController.revertChangesOnControl([oChange], mPropertyBag.appComponent);
			}
			var oControl = JsControlTreeModifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent);
			return oFlexController.removeFromAppliedChangesOnControl(oChange, mPropertyBag.appComponent, oControl)
				.then(oFlexController.deleteChange.bind(oFlexController, oChange, mPropertyBag.appComponent));
		},

		/**
		 * Retrieves the changes from the flex persistence for the passed managed object.
		 *
		 * @param {map} mPropertyBag Contains additional Data needed for reading changes
		 * @param {object} [mPropertyBag.appDescriptor] - Manifest that belongs to the current running component
		 * @param {string} [mPropertyBag.siteId] - ID of the site belonging to the current running component
		 * @param {string} [mPropertyBag.currentLayer] - Specifies a single layer for loading changes. If this parameter is set, the max layer filtering is not applied
		 * @param {boolean} [mPropertyBag.ignoreMaxLayerParameter] - Indicates that changes shall be loaded without layer filtering
		 * @param {boolean} [mPropertyBag.includeVariants] - Indicates that smart variants shall be included
		 * @param {string} [mPropertyBag.cacheKey] - Key to validate the cache entry stored on client side
		 * @param {boolean} [mPropertyBag.invalidateCache] - should the cache be invalidated
		 * @param {sap.ui.base.ManagedObject} mPropertyBag.managedObject - To retrieve the associated flex persistence
		 *
		 * @returns {Promise} Promise resolves with a map of all change instances {@see sap.ui.fl.Change}
		 * @public
		 */
		getUIChanges: function(mPropertyBag) {
			return ChangesController.getFlexControllerInstance(mPropertyBag.managedObject)
				.getComponentChanges(mPropertyBag, mPropertyBag.invalidateCache);
		},

		/**
		 * Get dirty changes from the flex persistence of the managed object instance
		 *
		 * @param {sap.ui.base.ManagedObject} oManagedObject - To retrieve the associated flex persistence
		 *
		 * @returns {sap.ui.fl.Change[]} Array of dirty change instances {@see sap.ui.fl.Change}
		 * @public
		 */
		getDirtyChanges: function(oManagedObject) {
			return ChangesController.getFlexControllerInstance(oManagedObject)
				._oChangePersistence.getDirtyChanges();
		}
	};
	return PersistenceWriteAPI;
}, true);