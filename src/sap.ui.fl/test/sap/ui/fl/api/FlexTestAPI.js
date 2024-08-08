/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/_internal/connectors/LocalStorageConnector",
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Layer"
], function(
	FlexObjectState,
	FlexState,
	FlexRuntimeInfoAPI,
	ChangesWriteAPI,
	LocalStorageConnector,
	SessionStorageConnector,
	Versions,
	VariantModel,
	ChangePersistenceFactory,
	FlexControllerFactory,
	Layer
) {
	"use strict";

	/**
	 * Includes functionality for testing purposes. Must not be used in productive coding
	 *
	 * @since 1.77
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	var FlexTestAPI = {};
	var FL_PREFIX = "sap.ui.fl";

	/**
	 * Clears the instance cache of FlexController, ChangePersistence and Versions as well as the FlexState
	 */
	FlexTestAPI.reset = function() {
		ChangePersistenceFactory._instanceCache = {};
		FlexControllerFactory._instanceCache = {};
		Versions.clearInstances();
		FlexState.clearState();
	};

	/**
	 * Returns dirty changes on the flex persistence of the passed selector.
	 *
	 * @param {object} mPropertyBag - Object with additional information
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector
	 * @returns {array} Array of dirty changes
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	FlexTestAPI.getDirtyChanges = function(mPropertyBag) {
		const sReference = FlexRuntimeInfoAPI.getFlexReference({element: mPropertyBag.selector});
		return FlexObjectState.getDirtyFlexObjects(sReference);
	};

	/**
	 * Returns a VariantModel instance for testing for the passed application component and with the passed data set.
	 *
	 * @param {object} mPropertyBag - Object with additional information
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - application component owning the VariantModel
	 * @param {object} mPropertyBag.data - Preset data
	 * @param {boolean} mPropertyBag.initFlexState - Flag to indicate whether additionally the FlexState should be initialized
	 * @returns {Promise<sap.ui.fl.variants.VariantModel>} Resolving to the initialized variant model
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	FlexTestAPI.createVariantModel = function(mPropertyBag) {
		var oInitPromise = Promise.resolve();
		if (mPropertyBag.initFlexState) {
			oInitPromise = FlexState.initialize({
				componentId: mPropertyBag.appComponent.getId()
			});
		}
		return oInitPromise.then(function() {
			var oFlexController = FlexControllerFactory.createForControl(mPropertyBag.appComponent);
			var oModel = new VariantModel(mPropertyBag.data, {
				flexController: oFlexController,
				appComponent: mPropertyBag.appComponent
			});
			return oModel.initialize()
			.then(function() {
				return oModel;
			});
		});
	};

	/**
	 * Creates a FlexObject with the given data and calls the complete change content function
	 *
	 * @param {object} mPropertyBag - Object with additional information
	 * @param {object} mPropertyBag.changeSpecificData - Change Information
	 * @param {sap.ui.core.Control} mPropertyBag.selector - Control instance for which the flex object should be created
	 * @param {sap.ui.core.Component} [mPropertyBag.appComponent] - App component instance
	 * @returns {Promise<sap.ui.fl.apply._internal.flexObjects.FlexObject>} FlexObject instance
	 */
	FlexTestAPI.createFlexObject = function(mPropertyBag) {
		// TODO: this logs an error when there is no proper app component
		if (mPropertyBag.appComponent) {
			mPropertyBag.selector.appComponent = mPropertyBag.appComponent;
		}
		mPropertyBag.changeSpecificData.layer ||= Layer.CUSTOMER;
		return ChangesWriteAPI.create({
			changeSpecificData: mPropertyBag.changeSpecificData,
			selector: mPropertyBag.selector
		});
	};

	/**
	 * Returns the number of changes stored on a storage
	 *
	 * @param {string} sStorageType Type of storage being used ("LocalStorage" or "SessionStorage")
	 * @param {string} sReference Flex Reference
	 * @returns {Promise} Resolving with the number of changes on the storage
	 */
	FlexTestAPI.getNumberOfStoredChanges = function(sStorageType, sReference) {
		var oConnector = sStorageType === "LocalStorage" ? LocalStorageConnector : SessionStorageConnector;

		return oConnector.loadFlexData({reference: sReference})
		.then(function(aResponses) {
			return aResponses.reduce(function(iNumberOfChanges, oResponse) {
				return iNumberOfChanges + oResponse.changes.length;
			}, 0);
		});
	};

	/**
	 * Returns the number of changes on a storage
	 *
	 * @param {string} sStorageType Type of storage being used ("LocalStorage" or "SessionStorage")
	 * @param {string} sReference Flex Reference
	 * @returns {int} Number of changes on the storage
	 */
	FlexTestAPI.getNumberOfChangesSynchronous = function(sStorageType, sReference) {
		var oStorage = sStorageType === "LocalStorage" ? LocalStorageConnector.storage : SessionStorageConnector.storage;

		var iCount = 0;
		Object.keys(oStorage).map(function(sKey) {
			var bIsFlexObject = sKey.includes(FL_PREFIX);

			if (!bIsFlexObject) {
				return;
			}
			var oFlexObject = JSON.parse(oStorage.getItem(sKey));
			if (oFlexObject.reference === sReference || `${oFlexObject.reference}.Component` === sReference && oFlexObject.fileType !== "version") {
				iCount++;
			}
		});
		return iCount;
	};

	/**
	 * Clears the flex entries in the given storage
	 *
	 * @param {string} sStorageType Type of storage being used ("LocalStorage" or "SessionStorage")
	 */
	FlexTestAPI.clearStorage = function(sStorageType) {
		var oStorage = sStorageType === "LocalStorage" ? LocalStorageConnector.storage : SessionStorageConnector.storage;
		var fnRemoveItem = function(sKey) {
			var bIsFlexObject = sKey.includes(FL_PREFIX);

			if (!bIsFlexObject) {
				return;
			}

			oStorage.removeItem(sKey);
		};

		Object.keys(oStorage).map(fnRemoveItem);

		Versions.clearInstances();
	};

	return FlexTestAPI;
});