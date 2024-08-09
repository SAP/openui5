/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/condenser/Condenser",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils"
], function(
	_omit,
	Log,
	JsControlTreeModifier,
	FlexCustomData,
	DescriptorChangeTypes,
	ManifestUtils,
	Settings,
	Condenser,
	FlexObjectManager,
	Storage,
	FeaturesAPI,
	FlexInfoSession,
	ChangePersistenceFactory,
	FlexControllerFactory,
	Layer,
	LayerUtils,
	Utils
) {
	"use strict";

	/**
	 * Provides an API for tools to query, provide, save or reset {@link sap.ui.fl.apply._internal.flexObjects.FlexObject}s.
	 *
	 * @namespace sap.ui.fl.write.api.PersistenceWriteAPI
	 * @since 1.68
	 * @private
	 * @ui5-restricted sap.ui.rta, similar tools
	 *
	 */
	var PersistenceWriteAPI = /** @lends sap.ui.fl.write.api.PersistenceWriteAPI */ {};

	/**
	 * Retrieves the changes from the flex persistence for the selector.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change instance
	 *
	 * @returns {boolean} Returns a boolean value if it is a descriptor change
	 */
	function isDescriptorChange(oChange) {
		return (oChange._getMap
			&& DescriptorChangeTypes.getChangeTypes().includes(oChange._getMap().changeType))
			|| (oChange.getChangeType && DescriptorChangeTypes.getChangeTypes().includes(oChange.getChangeType()));
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
		return PersistenceWriteAPI._getUIChanges(mPropertyBag)
		.then(function(aChanges) {
			return aChanges.length > 0;
		});
	}

	/**
	 * Checks if dirty changes exist for the flex persistence associated with the selector control;
	 *
	 * @param {object} mPropertyBag Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector To retrieve the associated flex persistence
	 * @returns {boolean} <code>true</code> if dirty changes exist
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	PersistenceWriteAPI.hasDirtyChanges = function(mPropertyBag) {
		return FlexObjectManager.hasDirtyFlexObjects(mPropertyBag);
	};

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
		mPropertyBag.upToLayer ||= LayerUtils.getCurrentLayer();

		return FlexObjectManager.getFlexObjects(mPropertyBag)
		.then(function(aFlexObjects) {
			return aFlexObjects.filter(function(oFlexObject) {
				return LayerUtils.isOverLayer(oFlexObject.getLayer(), mPropertyBag.upToLayer);
			});
		})
		.then(function(aFilteredFlexObjects) {
			if (aFilteredFlexObjects.length === 0) {
				return false;
			}
			// Hidden control variants and their related changes might be necessary for referenced variants, but are not relevant for this check
			// Same apply for changes of deleted comp variants
			return FlexObjectManager.filterHiddenFlexObjects(aFilteredFlexObjects, mPropertyBag.reference).length > 0;
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
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	PersistenceWriteAPI.save = function(mPropertyBag) {
		// when save or activate a version in rta no reload is triggered but flex/data request is send
		// and will delete version and maxLayer without saveChangeKeepSession
		// after the request saveChangeKeepSession needs to be delete again
		var sReference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.selector);
		var oFlexInfoSession = FlexInfoSession.getByReference(sReference);
		oFlexInfoSession.saveChangeKeepSession = true;
		FlexInfoSession.setByReference(oFlexInfoSession, sReference);
		return FlexObjectManager.saveFlexObjects(mPropertyBag).then(function(oFlexObject) {
			if (oFlexObject && oFlexObject.length !== 0) {
				return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function(oResult) {
					// other attributes like adaptationId, isEndUserAdaptation, init needs to be taken from flex info session if available
					oFlexInfoSession = FlexInfoSession.getByReference(sReference);
					delete oFlexInfoSession.saveChangeKeepSession;
					FlexInfoSession.setByReference(Object.assign(oFlexInfoSession, oResult), sReference);
					return oFlexObject;
				});
			}
			oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			delete oFlexInfoSession.saveChangeKeepSession;
			FlexInfoSession.setByReference(oFlexInfoSession, sReference);
			return oFlexObject;
		});
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
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
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
					Log.error(`Sending request to flex/info route failed: ${oError.message}`);
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
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	PersistenceWriteAPI.getResetAndPublishInfoFromSession = function(oControl) {
		var sParameter = ManifestUtils.getFlexReferenceForControl(oControl) || "true";
		return JSON.parse(window.sessionStorage.getItem(`sap.ui.fl.info.${sParameter}`));
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
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	PersistenceWriteAPI.reset = function(mPropertyBag) {
		var oAppComponent = Utils.getAppComponentForSelector(mPropertyBag.selector);
		var oFlexController = FlexControllerFactory.createForSelector(oAppComponent);
		return oFlexController.resetChanges(
			mPropertyBag.layer,
			mPropertyBag.generator,
			oAppComponent,
			mPropertyBag.selectorIds,
			mPropertyBag.changeTypes
		);
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
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	PersistenceWriteAPI.publish = function(mPropertyBag) {
		mPropertyBag.styleClass ||= "";
		return ChangePersistenceFactory.getChangePersistenceForControl(Utils.getAppComponentForSelector(mPropertyBag.selector))
		.transportAllUIChanges({}, mPropertyBag.styleClass, mPropertyBag.layer, mPropertyBag.appVariantDescriptors);
	};

	/**
	 * Adds flexObjects to the flex persistence.
	 * If there is a descriptor change, a transport request is set.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} mPropertyBag.flexObjects - Array of flexObjects
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} [mPropertyBag.change] - FlexObject instance
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - To retrieve the associated flex persistence
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[] | sap.ui.fl.apply._internal.flexObjects.FlexObject} An array of flexObjects or a single flexObject (depending on the input)
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	PersistenceWriteAPI.add = function(mPropertyBag) {
		var oAppComponent = Utils.getAppComponentForSelector(mPropertyBag.selector);
		var sFlexReference = ManifestUtils.getFlexReferenceForSelector(mPropertyBag.selector);
		var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sFlexReference);

		function addSingleFlexObject(oFlexObject) {
			if (isDescriptorChange(oFlexObject)) {
				return oFlexObject.store();
			}
			return oChangePersistence.addChange(oFlexObject, oAppComponent);
		}

		if (mPropertyBag.change && mPropertyBag.flexObjects) {
			throw new Error("Using 'flexObjects' and 'change' properties together not supported. Please use the 'flexObjects' property.");
		}

		if (mPropertyBag.change) {
			return addSingleFlexObject(mPropertyBag.change);
		}

		var bHasDescriptorChanges = mPropertyBag.flexObjects.some(function(oFlexObject) {
			return isDescriptorChange(oFlexObject);
		});

		if (bHasDescriptorChanges) {
			// if the flexObjects array has descriptor changes we add every change individually
			return mPropertyBag.flexObjects.map(addSingleFlexObject);
		}

		return oChangePersistence.addChanges(mPropertyBag.flexObjects, oAppComponent);
	};

	/**
	 * Removes changes from the applied flexObjects on a control and from the flex persistence map.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} mPropertyBag.flexObjects - Array of flexObjects to be removed
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} [mPropertyBag.change] - FlexObject to be removed
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - To retrieve the associated flex persistence
	 * @returns {Promise} resolves when flexObjects are removed
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	PersistenceWriteAPI.remove = function(mPropertyBag) {
		return Promise.resolve()
		.then(function() {
			if (mPropertyBag.change && mPropertyBag.flexObjects) {
				return Promise.reject(
					new Error("Using 'flexObjects' and 'change' properties together not supported. Please use the 'flexObjects' property.")
				);
			}
			if (!mPropertyBag.selector) {
				return Promise.reject(
					new Error(`An invalid selector was passed so change could not be removed with id: ${mPropertyBag.change.getId()}`));
			}
			var oAppComponent = Utils.getAppComponentForSelector(mPropertyBag.selector);
			if (!oAppComponent) {
				return Promise.reject(
					new Error(
						`Invalid application component for selector, change could not be removed with id: ${mPropertyBag.change.getId()}`
					));
			}

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oAppComponent);

			function destroyAppliedCustomData(oFlexObject) {
				var oElement = JsControlTreeModifier.bySelector(oFlexObject.getSelector(), oAppComponent);
				if (oElement) {
					FlexCustomData.destroyAppliedCustomData(oElement, oFlexObject, JsControlTreeModifier);
				}
			}

			if (mPropertyBag.change) {
				if (!isDescriptorChange(mPropertyBag.change)) {
					destroyAppliedCustomData(mPropertyBag.change);
				}
				return oChangePersistence.deleteChange(mPropertyBag.change);
			}

			mPropertyBag.flexObjects.forEach(function(oFlexObject) {
				if (!isDescriptorChange(oFlexObject)) {
					destroyAppliedCustomData(oFlexObject);
				}
			});

			return oChangePersistence.deleteChanges(mPropertyBag.flexObjects);
		});
	};

	/**
	 * Decides which warning should be shown if changes were made
	 * in a different system or in a P system with no changes at all.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Retrieves the associated flex persistence
	 * @param {string} [mPropertyBag.layer] - Layer for which changes should be checked
	 * @returns {Promise} Resolves with object that decides if warning should be shown
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	PersistenceWriteAPI.getChangesWarning = function(mPropertyBag) {
		return this._getUIChanges(mPropertyBag).then(function(aChanges) {
			var bHasChangesFromOtherSystem = aChanges.some(function(oChange) {
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
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} mPropertyBag.changes - Array of changes
	 * @returns {Promise<sap.ui.fl.apply._internal.flexObjects.FlexObject[]>} Resolves with all necessary changes
	 * @private
	 * @ui5-restricted sap.ui.rta.test
	 */
	PersistenceWriteAPI._condense = function(mPropertyBag) {
		return Promise.resolve().then(function() {
			if (!mPropertyBag.selector) {
				throw Error("An invalid selector was passed");
			}
			var oAppComponent = Utils.getAppComponentForSelector(mPropertyBag.selector);
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
	 * @param {boolean} [mPropertyBag.onlyCurrentVariants] - Whether only changes for the currently active variants should be considered
	 *
	 * @returns {Promise} Promise resolves with an array of all change instances {@see sap.ui.fl.apply._internal.flexObjects.FlexObject}
	 * @private
	 */
	PersistenceWriteAPI._getUIChanges = function(mPropertyBag) {
		if (mPropertyBag.layer) {
			// TODO: sync the layer parameter name with new persistence and remove this line
			mPropertyBag.currentLayer = mPropertyBag.layer;
		}

		mPropertyBag.invalidateCache = false;
		// TODO: Check the mPropertyBag.selector parameter name - the methods called on FlexObjectManager expect a control
		return FlexObjectManager.getFlexObjects(mPropertyBag);
	};

	/**
	 * Adds layer property to the flex info session.
	 *
	 * @param {string} sLayer - Layer of the adaptation
	 * @param {object} oControl - Control
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	PersistenceWriteAPI.setAdaptationLayer = function(sLayer, oControl) {
		const sReference = ManifestUtils.getFlexReferenceForControl(oControl);
		const oFlexInfoSession = FlexInfoSession.getByReference(sReference);
		oFlexInfoSession.adaptationLayer = sLayer;
		FlexInfoSession.setByReference(oFlexInfoSession, sReference);
	};

	return PersistenceWriteAPI;
});