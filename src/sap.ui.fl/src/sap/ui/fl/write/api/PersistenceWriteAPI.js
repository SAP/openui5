/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/includes",
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
	"sap/ui/fl/write/_internal/condenser/Condenser",
	"sap/ui/fl/write/_internal/flexState/FlexObjectState",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/registry/Settings"
], function(
	includes,
	_omit,
	Log,
	JsControlTreeModifier,
	FlexCustomData,
	ChangesController,
	DescriptorChangeTypes,
	Condenser,
	FlexObjectState,
	Storage,
	ManifestUtils,
	FeaturesAPI,
	Layer,
	LayerUtils,
	Settings
) {
	"use strict";

	/**
	 * Provides an API for tools to query, provide, save or reset {@link sap.ui.fl.Change}s.
	 *
	 * @namespace sap.ui.fl.write.api.PersistenceWriteAPI
	 * @experimental Since 1.68
	 * @since 1.68
	 * @private
	 * @ui5-restricted sap.ui.rta, similar tools
	 *
	 */
	var PersistenceWriteAPI = /**@lends sap.ui.fl.write.api.PersistenceWriteAPI */ {};

	/**
	 * Retrieves the changes from the flex persistence for the selector.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change instance
	 *
	 * @returns {boolean} Returns a boolean value if it is a descriptor change
	 */
	function isDescriptorChange(oChange) {
		return (oChange._getMap
			&& includes(DescriptorChangeTypes.getChangeTypes(), oChange._getMap().changeType))
			|| (oChange.getChangeType && includes(DescriptorChangeTypes.getChangeTypes(), oChange.getChangeType()));
	}

	/**
	 * Checks if changes exist for the flex persistence associated with the selector control;
	 *
	 * @param {object} mPropertyBag Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector To retrieve the associated flex persistence
	 * @returns {Promise<boolean>} Promise that resolves to a boolean indicating if changes exist
	 */
	function hasChanges(mPropertyBag) {
		mPropertyBag.includeCtrlVariants = true;
		mPropertyBag.invalidateCache = false;
		return PersistenceWriteAPI._getUIChanges(mPropertyBag)
			.then(function(aChanges) {
				return aChanges.length > 0;
			});
	}

	/**
	 * Determines if user-specific changes or variants are present in the flex persistence.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.selector - Control to retrieve the associated flex persistence
	 * @param {string} [mPropertyBag.upToLayer] - Layer to compare with
	 * @param {boolean} [mPropertyBag.ignoreMaxLayerParameter] - Indicates that personalization is to be checked without max layer filtering
	 * @param {boolean} [mPropertyBag.includeCtrlVariants] - Indicates that control variant changes shall be included
	 * @returns {Promise<boolean>} Promise that resolves to a boolean, indicating if a personalization change that was created during runtime is active in the application
	 * @private
	 * @ui5-restricted
	 */
	PersistenceWriteAPI.hasHigherLayerChanges = function(mPropertyBag) {
		mPropertyBag.upToLayer = mPropertyBag.upToLayer || LayerUtils.getCurrentLayer();

		return FlexObjectState.getFlexObjects(mPropertyBag)
			.then(function(aFlexObjects) {
				return aFlexObjects.filter(function(oFlexObject) {
					return LayerUtils.isOverLayer(oFlexObject.getLayer(), mPropertyBag.upToLayer);
				});
			})
			.then(function(aFilteredFlexObjects) {
				return aFilteredFlexObjects.length > 0;
			});
	};

	/**
	 * Saves all flex changes, app variants and descriptor changes on the relevant flex persistence.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Retrieves the associated flex persistence
	 * @param {boolean} [mPropertyBag.skipUpdateCache] - Indicates if cache update should be skipped
	 * @param {string} [mPropertyBag.transport] - Transport request for the app variant - Smart Business must pass the transport in onPremise system
	 * @param {string} [mPropertyBag.layer=CUSTOMER] - Proposed layer (might be overwritten by the backend) when creating a new app variant - Smart Business must pass the layer
	 * @param {boolean} [mPropertyBag.draft=false] - Indicates if changes should be written as a draft
	 * @param {boolean} [mPropertyBag.removeOtherLayerChanges=false] - Whether to remove changes on other layers before saving
	 *
	 * @returns {Promise} Promise that resolves with an array of responses or is rejected with the first error
	 * @private
	 * @ui5-restricted
	 */
	PersistenceWriteAPI.save = function(mPropertyBag) {
		return FlexObjectState.saveFlexObjects(mPropertyBag);
	};

	/**
	 * Provides information if content from backend and persistence in an application can be published/reset.
	 *
	 * @param {object} mPropertyBag Contains additional data needed for checking flex/info
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector Selector
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer on which the request is sent to the backend
	 *
	 * @returns {Promise<object>} Resolves the information if the application to which the selector belongs has content that can be published/reset
	 * @private
	 * @ui5-restricted
	 */
	PersistenceWriteAPI.getResetAndPublishInfo = function(mPropertyBag) {
		return Promise.all([
			hasChanges(mPropertyBag),
			FeaturesAPI.isPublishAvailable()
		]).then(function(aResetPublishInfo) {
			var bHasChanges = aResetPublishInfo[0];
			var bIsPublishAvailable = aResetPublishInfo[1];
			var bIsLayerTransportable = mPropertyBag.layer !== Layer.USER && mPropertyBag.layer !== Layer.PUBLIC;
			// By default:
			// Reset is enabled if there is change
			// Publish is by default disabled
			// All contexts provided is true to not trigger a reload and add additional parameter to flex/data request
			var oFlexInfo = {
				isResetEnabled: bHasChanges,
				isPublishEnabled: false,
				allContextsProvided: true
			};
			// If there is change and the layer is transportable , the request to back end is always necessary
			// because of control variant reset logic through setVisible change and app descriptor changes
			if (bIsLayerTransportable) {
				return Storage.getFlexInfo(mPropertyBag)
					.then(function(oResponse) {
						oFlexInfo.allContextsProvided = oResponse.allContextsProvided === undefined || oResponse.allContextsProvided;
						oFlexInfo.isResetEnabled = oResponse.isResetEnabled;
						// Together with publish info from back end,
						// system setting info for publish availability also need to be checked
						oFlexInfo.isPublishEnabled = bIsPublishAvailable && oResponse.isPublishEnabled;
						return oFlexInfo;
					})
					.catch(function(oError) {
						Log.error("Sending request to flex/info route failed: " + oError.message);
						return oFlexInfo;
					});
			}
			return oFlexInfo;
		});
	};

	/**
	 * Provides information from session storage if content from an application can be published/reset.
	 *
	 * @param {object} oControl Control
	 *
	 * @returns {object} Information if the application has content that can be published/reset
	 * @private
	 * @ui5-restricted
	 */
	PersistenceWriteAPI.getResetAndPublishInfoFromSession = function(oControl) {
		var sParameter = ManifestUtils.getFlexReferenceForControl(oControl) || "true";
		return JSON.parse(window.sessionStorage.getItem("sap.ui.fl.info." + sParameter));
	};

	/**
	 * Reset changes in the backend;
	 * If the reset is performed for an entire component, a browser reload is required;
	 * If the reset is performed for a control, this function also triggers a reversion of deleted UI changes.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Retrieves the associated flex persistence
	 * @param {string} [mPropertyBag.layer] - Layer for which changes are to be deleted
	 * @param {string} [mPropertyBag.generator] - Generator of changes
	 * @param {string[]} [mPropertyBag.selectorIds] - Selector IDs in local format
	 * @param {string[]} [mPropertyBag.changeTypes] - Types of changes
	 *
	 * @returns {Promise} Promise that resolves after the deletion took place
	 * @private
	 * @ui5-restricted
	 */
	PersistenceWriteAPI.reset = function(mPropertyBag) {
		var oAppComponent = ChangesController.getAppComponentForSelector(mPropertyBag.selector);
		var oFlexController = ChangesController.getFlexControllerInstance(oAppComponent);
		var aArguments = [mPropertyBag.layer, mPropertyBag.generator, oAppComponent, mPropertyBag.selectorIds, mPropertyBag.changeTypes];
		return oFlexController.resetChanges.apply(oFlexController, aArguments);
	};

	/**
	 * Transports all the UI changes and the app variant descriptor (if exists) to the target system.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - To retrieve the associated flex persistence
	 * @param {string} [mPropertyBag.styleClass] - Style class name that will be added to the transport dialog
	 * @param {string} mPropertyBag.layer - Working layer
	 * @param {array} [mPropertyBag.appVariantDescriptors] - Array of app variant descriptors that need to be transported
	 *
	 * @returns {Promise<string>} Promise that can resolve to the following strings:
	 * - "Cancel" if publish process was canceled
	 * - <sMessage> when all the artifacts are successfully transported fl will return the message to show
	 * - "Error" in case of a problem
	 */
	PersistenceWriteAPI.publish = function(mPropertyBag) {
		mPropertyBag.styleClass = mPropertyBag.styleClass || "";
		var oAppComponent = ChangesController.getAppComponentForSelector(mPropertyBag.selector);
		return ChangesController.getFlexControllerInstance(oAppComponent)
			._oChangePersistence.transportAllUIChanges({}, mPropertyBag.styleClass, mPropertyBag.layer, mPropertyBag.appVariantDescriptors);
	};

	/**
	 * Adds a change to the flex persistence.
	 * If it's a descriptor change, a transport request is set.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Change} mPropertyBag.change - Change instance
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - To retrieve the associated flex persistence
	 * @returns {sap.ui.fl.Change} The change instance
	 *
	 * @private
	 * @ui5-restricted
	 */
	PersistenceWriteAPI.add = function(mPropertyBag) {
		if (isDescriptorChange(mPropertyBag.change)) {
			return mPropertyBag.change.store();
		}
		var oAppComponent = ChangesController.getAppComponentForSelector(mPropertyBag.selector);
		return ChangesController.getFlexControllerInstance(oAppComponent).addPreparedChange(mPropertyBag.change, oAppComponent);
	};

	/**
	 * Removes a change from from the applied changes on a control and from the flex persistence map.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Change} mPropertyBag.change - Change to be removed
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - To retrieve the associated flex persistence
	 * @returns {Promise} resolves when changes are removed
	 * @private
	 * @ui5-restricted
	 */
	PersistenceWriteAPI.remove = function(mPropertyBag) {
		var oFlexController;
		var oAppComponent;
		return Promise.resolve()
			.then(function () {
				if (!mPropertyBag.selector) {
					return Promise.reject(new Error("An invalid selector was passed so change could not be removed with id: " + mPropertyBag.change.getId()));
				}
				oAppComponent = ChangesController.getAppComponentForSelector(mPropertyBag.selector);
				if (!oAppComponent) {
					return Promise.reject(new Error("Invalid application component for selector, change could not be removed with id: " + mPropertyBag.change.getId()));
				}
				// descriptor change
				if (isDescriptorChange(mPropertyBag.change)) {
					var oDescriptorFlexController = ChangesController.getDescriptorFlexControllerInstance(oAppComponent);
					oDescriptorFlexController.deleteChange(mPropertyBag.change, oAppComponent);
					return undefined;
				}
				var oElement = JsControlTreeModifier.bySelector(mPropertyBag.change.getSelector(), oAppComponent);
				oFlexController = ChangesController.getFlexControllerInstance(oAppComponent);
				// remove custom data for flex change
				if (oElement) {
					FlexCustomData.sync.destroyAppliedCustomData(oElement, mPropertyBag.change, JsControlTreeModifier);
				}
				// delete from flex persistence map
				oFlexController.deleteChange(mPropertyBag.change, oAppComponent);
				return undefined;
			});
	};

	/**
	 * Decides which warning should be shown if changes were made
	 * in a different system or in a P system with no changes at all.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Retrieves the associated flex persistence
	 * @param {string} [mPropertyBag.layer] - Layer for which changes are to be deleted
	 * @param {string} [mPropertyBag.generator] - Generator of changes
	 * @param {string[]} [mPropertyBag.selectorIds] - Selector IDs in local format
	 * @param {string[]} [mPropertyBag.changeTypes] - Types of changes
	 * @returns {Promise} Resolves with object that decides if warning should be shown
	 *
	 */
	 PersistenceWriteAPI.getChangesWarning = function (mPropertyBag) {
		return this._getUIChanges(mPropertyBag).then(function (aChanges) {
			var bHasChangesFromOtherSystem = aChanges.some(function (oChange) {
				return oChange.isChangeFromOtherSystem();
			});

			var oSettingsInstance = Settings.getInstanceOrUndef();
			var isProductiveSystemWithTransports = oSettingsInstance && oSettingsInstance.isProductiveSystemWithTransports();
			var bHasNoChanges = aChanges.length === 0;
			var oChangesWarning = {showWarning: false};

			if (bHasChangesFromOtherSystem) {
				oChangesWarning = {showWarning: true, warningType: "mixedChangesWarning"};
			}

			if (isProductiveSystemWithTransports && bHasNoChanges) {
				oChangesWarning = {showWarning: true, warningType: "noChangesAndPSystemWarning"};
			}
			return oChangesWarning;
		});
	};

	/**
	 * Calls the Condenser with all the passed changes.
	 * ATTENTION: Only to be used by sap.ui.rta.test
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Retrieves the associated flex persistence
	 * @param {sap.ui.fl.Change[]} mPropertyBag.changes - Array of changes
	 * @returns {Promise<sap.ui.fl.Change[]>} Resolves with all necessary changes
	 * @private
	 * @ui5-restricted sap.ui.rta.test
	 */
	PersistenceWriteAPI._condense = function(mPropertyBag) {
		return Promise.resolve().then(function() {
			if (!mPropertyBag.selector) {
				throw Error("An invalid selector was passed");
			}
			var oAppComponent = ChangesController.getAppComponentForSelector(mPropertyBag.selector);
			if (!oAppComponent) {
				throw Error("Invalid application component for selector");
			}
			if (!mPropertyBag.changes || mPropertyBag.changes && !Array.isArray(mPropertyBag.changes)) {
				throw Error("Invalid array of changes");
			}
			return Condenser.condense(oAppComponent, mPropertyBag.changes);
		});
	};

	/**
	 * Retrieves the changes from the flex persistence for the selector.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector to retrieve the associated flex persistence
	 * @param {object} [mPropertyBag.appDescriptor] - Manifest that belongs to the current running component
	 * @param {string} [mPropertyBag.siteId] - ID of the site belonging to the current running component
	 * @param {string} [mPropertyBag.layer] - Specifies a single layer for loading change; if this parameter is set, the max layer filtering is not applied
	 * @param {boolean} [mPropertyBag.ignoreMaxLayerParameter] - Indicates that changes are to be loaded without layer filtering
	 * @param {boolean} [mPropertyBag.includeCtrlVariants] - Flag if control variant changes should be included
	 * @param {boolean} [mPropertyBag.includeDirtyChanges] - Flag if dirty UI changes should be included
	 * @param {string} [mPropertyBag.cacheKey] - Key to validate the cache entry stored on client side
	 * @param {boolean} [mPropertyBag.invalidateCache] - Indicates whether the cache is to be invalidated
	 * @param {boolean} [mPropertyBag.onlyCurrentVariants] - Whether only changes for the currently active variants should be considered
	 *
	 * @returns {Promise} Promise resolves with an array of all change instances {@see sap.ui.fl.Change}
	 * @private
	 */
	PersistenceWriteAPI._getUIChanges = function(mPropertyBag) {
		if (mPropertyBag.layer) {
			//TODO: sync the layer parameter name with new persistence and remove this line
			mPropertyBag.currentLayer = mPropertyBag.layer;
		}

		//TODO: Check the mPropertyBag.selector parameter name - the methods called on FlexObjectState expect a control
		return FlexObjectState.getFlexObjects(mPropertyBag);
	};

	return PersistenceWriteAPI;
});