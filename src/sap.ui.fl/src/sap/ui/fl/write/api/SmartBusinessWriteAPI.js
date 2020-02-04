/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/write/_internal/SaveAs",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/ui/fl/registry/Settings"
], function(
	DescriptorVariantFactory,
	PersistenceWriteAPI,
	ChangesWriteAPI,
	ChangesController,
	SaveAs,
	LrepConnector,
	Settings
) {
	"use strict";

	function _checkSettingsAndExecuteActionByName(sActionName, mPropertyBag) {
		return Settings.getInstance().then(function(oSettings) {
			if (oSettings.isAtoEnabled()) {
				mPropertyBag.skipIam = true;
				mPropertyBag.transport = "ATO_NOTIFICATION";
			}
			return SaveAs[sActionName](mPropertyBag);
		});
	}

	/**
	 * Provides an API for tools to create, update, delete app variants only for ABAP systems.
	 *
	 * @namespace sap.ui.fl.write.api.SmartBusinessWriteAPI
	 * @experimental Since 1.74
	 * @since 1.74
	 * @private
	 * @ui5-restricted sap.ui.rta, similar tools
	 *
	 */
	var SmartBusinessWriteAPI = /** @lends sap.ui.fl.write.api.SmartBusinessWriteAPI */ {
		/**
		 * Creates and saves the app variant in backend.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector
		 * @param {string} mPropertyBag.selector.appId - ID of the reference application
		 * @param {string} [mPropertyBag.selector.appVersion] - Version of the referenced application
		 * @param {string} mPropertyBag.id - App variant ID
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Current working layer
		 * @param {string} [mPropertyBag.transport] - Transport request for the app variant;
		 * Transport is required for onPremise systems until the app variant is not intended to be saved as a local object;
		 * Transport is not required for S4/Hana Cloud systems
		 *
		 *
		 * @param {string} [mPropertyBag.package] - Package info for the app variant;
		 * Package is required if the app variant is intended for VENDOR or CUSTOMER_BASE layer in onPremise systems;
		 * Package could be filled with $TMP if the app variant is intended to be saved as a local object
		 *
		 * @param {string} [mPropertyBag.version] - Version of the app variant
		 *
		 * @returns {Promise} Promise which gets resolved with the app variant update response or gets rejected with a first error
		 * @private
		 * @ui5-restricted
		 */
		create: function (mPropertyBag) {
			if (!mPropertyBag.layer) {
				return Promise.reject("Layer must be provided");
			}

			if (!mPropertyBag.selector || !mPropertyBag.selector.appId) {
				return Promise.reject("selector.appId must be provided");
			}

			if (!mPropertyBag.id) {
				return Promise.reject("App variant ID must be provided");
			}

			var oFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);
			mPropertyBag.reference = oFlexController.getComponentName();

			// Pass a flag to determine the consumer who is calling SaveAs handler
			mPropertyBag.isForSmartBusiness = true;

			return _checkSettingsAndExecuteActionByName("saveAs", mPropertyBag);
		},

		/**
		 * Updates the app variants in the back end.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.appId - App variant ID
		 *
		 * @param {string} [mPropertyBag.transport] - Transport request for the app variant;
		 * Transport is required for onPremise systems;
		 * Transport is not required for S4/Hana Cloud systems
		 *
		 * @returns {Promise} Promise which gets resolved with the app variant update response or gets rejected with a first error
		 * @private
		 * @ui5-restricted
		 */
		update: function (mPropertyBag) {
			if (!mPropertyBag.appId) {
				return Promise.reject("App Variant ID must be provided");
			}

			mPropertyBag.selector = {
				appId: mPropertyBag.appId
			};

			var oDescriptorFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);

			mPropertyBag.referenceAppId = oDescriptorFlexController.getComponentName();
			// Pass a flag to know which consumer is calling SaveAs handler
			mPropertyBag.isForSmartBusiness = true;

			return _checkSettingsAndExecuteActionByName("updateAppVariant", mPropertyBag);
		},

		/**
		 * Deletes the app variant from the backend.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.appId - App Variant ID
		 * @param {string} mPropertyBag.transport - Transport request for the app variant;
		 * Transport is required for onPremise systems;
		 * Transport is not required for S4/Hana Cloud systems
		 *
		 * @returns {Promise} Promise that resolves with the app variant deletion response
		 * @private
		 * @ui5-restricted
		 */
		remove: function (mPropertyBag) {
			if (!mPropertyBag.appId) {
				return Promise.reject("App Variant ID must be provided");
			}

			mPropertyBag.selector = {
				appId: mPropertyBag.appId
			};

			var oFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);
			mPropertyBag.referenceAppId = oFlexController.getComponentName();
			// Pass a flag to know which consumer is calling SaveAs handler
			mPropertyBag.isForSmartBusiness = true;

			return _checkSettingsAndExecuteActionByName("deleteAppVariant", mPropertyBag);
		},

		/**
		 * Returns the design time representation of the app variant.
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.appId - App variant ID
		 * @returns {Promise<object>} Resolving with the loaded variant
		 * @private
		 * @ui5-restricted
		 */
		getDesignTimeVariant: function (mPropertyBag) {
			if (!mPropertyBag.appId) {
				return Promise.reject("App Variant ID must be provided");
			}
			return DescriptorVariantFactory.loadAppVariant(mPropertyBag.appId);
		},

		/**
		 * Returns the run time representation of the app variant.
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.appId - ID of the reference application
		 * @param {string} mPropertyBag.id - App variant ID
		 * @returns {Promise<object>} Resolving with the loaded variant
		 *
		 * @private
		 * @ui5-restricted
		 */
		getRunTimeVariant: function (mPropertyBag) {
			if (!mPropertyBag.appId) {
				return Promise.reject("Reference App ID must be provided");
			}
			if (!mPropertyBag.id) {
				return Promise.reject("App Variant ID must be provided");
			}

			var sAppUrl = "/sap/bc/lrep/content/apps/" + mPropertyBag.appId + "/appVariants/" + mPropertyBag.id + "/manifest.appdescr_variant";
			return LrepConnector.appVariant.getManifest({
				appVarUrl: sAppUrl
			});
		},

		/**
		 * Creates a descriptor inline change content.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.appId - Reference app ID or an app variant ID
		 * @param {object} mPropertyBag.changeSpecificData - Property bag holding the change information, see {@link sap.ui.fl.Change#createInitialFileContent}
		 * The property <code>mPropertyBag.changeSpecificData.packageName</code> is set to <code>$TMP</code> and internally since flex changes are always local when they are created.
		 *
		 * @returns {Promise|sap.ui.fl.Change} Promise resolves with the created change.
		 * @private
		 * @ui5-restricted
		 */
		createDescriptorInlineChanges: function(mPropertyBag) {
			if (!mPropertyBag.appId) {
				return Promise.reject("appId must be provided");
			}
			if (!mPropertyBag.changeSpecificData) {
				return Promise.reject("changeSpecificData must be provided");
			}
			mPropertyBag.selector = {
				appId: mPropertyBag.appId
			};
			return ChangesWriteAPI.create(mPropertyBag);
		},

		/**
		 * Adds a descriptor inline change to the flex persistence.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.appId - Reference app ID or an app variant ID
		 * @param {sap.ui.fl.Change} mPropertyBag.change - Change instance
		 *
		 * @returns {Promise|sap.ui.fl.Change} Promise resolves with the added change in persistence.
		 * @private
	 	 * @ui5-restricted
		 */
		add: function (mPropertyBag) {
			if (!mPropertyBag.appId) {
				return Promise.reject("appId must be provided");
			}
			if (!mPropertyBag.change) {
				return Promise.reject("Change instance must be provided");
			}
			mPropertyBag.selector = {
				appId: mPropertyBag.appId
			};
			return PersistenceWriteAPI.add(mPropertyBag);
		}
	};

	return SmartBusinessWriteAPI;
});