/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/apply/_internal/flexObjects/AnnotationChange",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/condenser/Condenser",
	"sap/ui/fl/write/_internal/flexState/changes/UIChangeManager",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils"
], function(
	_omit,
	Log,
	JsControlTreeModifier,
	DescriptorChangeTypes,
	FlexCustomData,
	AnnotationChange,
	FlexState,
	ManifestUtils,
	FlexInfoSession,
	Settings,
	Condenser,
	UIChangeManager,
	FlexObjectManager,
	Storage,
	FeaturesAPI,
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
	PersistenceWriteAPI.save = async function(mPropertyBag) {
		// when save or activate a version in rta no reload is triggered but flex/data request is send
		// and will delete version and maxLayer without saveChangeKeepSession
		// after the request saveChangeKeepSession needs to be delete again
		const sReference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.selector);
		let oFlexInfoSession = FlexInfoSession.getByReference(sReference);
		oFlexInfoSession.saveChangeKeepSession = true;
		FlexInfoSession.setByReference(oFlexInfoSession, sReference);
		const aFlexObjects = await FlexObjectManager.saveFlexObjects(mPropertyBag);
		if (aFlexObjects?.length > 0) {
			await PersistenceWriteAPI.updateResetAndPublishInfo(mPropertyBag);
		}
		oFlexInfoSession = FlexInfoSession.getByReference(sReference);
		delete oFlexInfoSession.saveChangeKeepSession;
		FlexInfoSession.setByReference(oFlexInfoSession, sReference);
		return aFlexObjects;
	};

	/**
	 * Updates information in Flex Info Session from backend and persistence in an application if it can be published/reset.
	 *
	 * @param {object} mPropertyBag Contains additional data needed for checking flex/info
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector Selector
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer Layer on which the request is sent to the backend
	 *
	 * @returns {Promise<object>} Resolves the information if the application to which the selector belongs has content that can be published/reset
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	PersistenceWriteAPI.updateResetAndPublishInfo = async function(mPropertyBag) {
		const [bHasChanges, bIsPublishAvailable] = await Promise.all([
			hasChanges(mPropertyBag),
			FeaturesAPI.isPublishAvailable()
		]);

		// Default flex info object
		const oFlexInfo = {
			isResetEnabled: bHasChanges,
			isPublishEnabled: false,
			allContextsProvided: true
		};
		const bIsLayerTransportable = mPropertyBag.layer !== Layer.USER && mPropertyBag.layer !== Layer.PUBLIC;

		// If the layer is transportable, fetch additional information from the backend
		if (bIsLayerTransportable) {
			try {
				const oResponse = await Storage.getFlexInfo(mPropertyBag);
				// default is true, so only set to false if explicitly set to false
				oFlexInfo.allContextsProvided = oResponse.allContextsProvided !== false;
				oFlexInfo.isResetEnabled = oResponse.isResetEnabled;
				oFlexInfo.isPublishEnabled = bIsPublishAvailable && oResponse.isPublishEnabled;
			} catch (oError) {
				Log.error(`Sending request to flex/info route failed: ${oError.message}`);
			}
		}

		// Update the Flex Info Session
		const sReference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.selector);
		const oOldFlexInfoSession = FlexInfoSession.getByReference(sReference);
		const oNewFlexInfoSession = {
			...oOldFlexInfoSession,
			...oFlexInfo
		};

		FlexInfoSession.setByReference(oNewFlexInfoSession, sReference);
		FlexState.setAllContextsProvided(sReference, oNewFlexInfoSession.allContextsProvided);
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
		return FlexObjectManager.resetFlexObjects({
			..._omit(mPropertyBag, "selector"),
			appComponent: oAppComponent
		});
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
		const oAppComponent = Utils.getAppComponentForSelector(mPropertyBag.selector);
		const sFlexReference = ManifestUtils.getFlexReferenceForSelector(mPropertyBag.selector);

		function addSingleFlexObject(oFlexObject) {
			if (isDescriptorChange(oFlexObject)) {
				return oFlexObject.store();
			}
			if (oFlexObject instanceof AnnotationChange) {
				return FlexObjectManager.addDirtyFlexObjects(sFlexReference, [oFlexObject])?.[0];
			}
			return UIChangeManager.addDirtyChanges(sFlexReference, [oFlexObject], oAppComponent)?.[0];
		}

		if (mPropertyBag.change && mPropertyBag.flexObjects) {
			throw new Error("Using 'flexObjects' and 'change' properties together not supported. Please use the 'flexObjects' property.");
		}

		if (mPropertyBag.change) {
			return addSingleFlexObject(mPropertyBag.change);
		}

		const bHasDescriptorChanges = mPropertyBag.flexObjects.some(function(oFlexObject) {
			return isDescriptorChange(oFlexObject);
		});

		if (bHasDescriptorChanges) {
			// if the flexObjects array has descriptor changes we add every change individually
			return mPropertyBag.flexObjects.map(addSingleFlexObject);
		}

		const aUIChanges = [];
		const aAnnotationChanges = [];

		mPropertyBag.flexObjects.forEach((oFlexObject) => {
			if (oFlexObject instanceof AnnotationChange) {
				aAnnotationChanges.push(oFlexObject);
			} else {
				aUIChanges.push(oFlexObject);
			}
		});

		const aAddedFlexObjects = FlexObjectManager.addDirtyFlexObjects(sFlexReference, aAnnotationChanges);
		const aAddedUIChanges = UIChangeManager.addDirtyChanges(sFlexReference, aUIChanges, oAppComponent);

		// Ensure that the added changes are returned in the same order as they were passed
		return mPropertyBag.flexObjects.map((oFlexObject) => {
			return aAddedFlexObjects.find((oAddedFlexObject) => oAddedFlexObject === oFlexObject)
				|| aAddedUIChanges.find((oAddedFlexObject) => oAddedFlexObject === oFlexObject);
		});
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
		if (mPropertyBag.change && mPropertyBag.flexObjects) {
			return Promise.reject(
				new Error("Using 'flexObjects' and 'change' properties together not supported. Please use the 'flexObjects' property.")
			);
		}
		if (!mPropertyBag.selector) {
			return Promise.reject(
				new Error(`An invalid selector was passed so change could not be removed with id: ${mPropertyBag.change.getId()}`));
		}
		const oAppComponent = Utils.getAppComponentForSelector(mPropertyBag.selector);
		if (!oAppComponent) {
			return Promise.reject(
				new Error(
					`Invalid application component for selector, change could not be removed with id: ${mPropertyBag.change.getId()}`
				));
		}

		const aFlexObjects = mPropertyBag.change ? [mPropertyBag.change] : mPropertyBag.flexObjects;
		const sFlexReference = ManifestUtils.getFlexReferenceForSelector(mPropertyBag.selector);

		aFlexObjects.forEach(function(oFlexObject) {
			if (oFlexObject.isValidForDependencyMap()) {
				const oElement = JsControlTreeModifier.bySelector(oFlexObject.getSelector(), oAppComponent);
				if (oElement) {
					FlexCustomData.destroyAppliedCustomData(oElement, oFlexObject, JsControlTreeModifier);
				}
			}
		});

		FlexObjectManager.deleteFlexObjects({
			reference: sFlexReference,
			flexObjects: aFlexObjects
		});
		return Promise.resolve();
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
	 * Retrieves the annotation changes for the given control from the FlexState.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control to retrieve the flex reference
	 * @returns {sap.ui.fl.apply._internal.flexObjects.AnnotationChange[]} List of all annotation changes
	 * @private
	 */
	PersistenceWriteAPI._getAnnotationChanges = function(mPropertyBag) {
		const sFlexReference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.control);
		return FlexState.getAnnotationChanges(sFlexReference);
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