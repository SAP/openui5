/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/Utils",
	"sap/base/Log"
], function(
	Storage,
	Utils,
	Log
) {
	"use strict";

	function retrieveUserId(oSettings) {
		if (oSettings && oSettings.logonUser) {
			return Promise.resolve(oSettings.logonUser);
		}
		var oUShellContainer = Utils.getUshellContainer();
		if (oUShellContainer) {
			return Utils.getUShellService("UserInfo")
			.then(function(oUserInfoService) {
				var oUser = oUserInfoService.getUser();
				return oUser && oUser.getId();
			})
			.catch(function(oError) {
				Log.error(`Error getting service from Unified Shell: ${oError.message}`);
			});
		}
		return Promise.resolve();
	}

	/**
	 * FlexSettings access
	 *
	 * @param {object} oSettings - Settings as JSON object
	 * @constructor
	 * @alias sap.ui.fl.registry.Settings
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var Settings = function(oSettings) {
		if (!oSettings) {
			throw new Error("no flex settings provided");
		}
		this._oSettings = oSettings;
	};

	/**
	 * attaches a callback to an event on the event provider of Settings
	 *
	 * @param {string} sEventId - Name of the event
	 * @param {function} oCallback - Callback that should be attached to the event
	 */
	Settings.attachEvent = function(sEventId, oCallback) {
		Settings._oEventProvider.attachEvent(sEventId, oCallback);
	};

	/**
	 * detaches a callback to an event on the event provider of Settings
	 *
	 * @param {string} sEventId - Name of the event
	 * @param {function} oCallback - Callback that should be detached from the event
	 */
	Settings.detachEvent = function(sEventId, oCallback) {
		Settings._oEventProvider.detachEvent(sEventId, oCallback);
	};

	/**
	 * Returns a settings instance after reading the settings from the back end if not already done. There is only one instance of settings during a
	 * session.
	 *
	 * @returns {Promise} With parameter <code>oInstance</code> of type {sap.ui.fl.registry.Settings}
	 */
	Settings.getInstance = function() {
		if (Settings._instance) {
			return Promise.resolve(Settings._instance);
		}
		if (Settings._oLoadSettingsPromise) {
			return Settings._oLoadSettingsPromise;
		}
		return Settings._loadSettings();
	};

	/**
	 * Sends request to the back end for settings content; Stores content into internal setting instance and returns the instance.
	 *
	 * @returns {Promise} With parameter <code>oInstance</code> of type {sap.ui.fl.registry.Settings}
	 */
	Settings._loadSettings = function() {
		var oSettings;
		var oLoadingPromise = Storage.loadFeatures()
		.then(function(oLoadedSettings) {
			oSettings = oLoadedSettings;
			return retrieveUserId(oSettings);
		})
		.then(function(sUserId) {
			if (!oSettings) {
				Log.error("The request for flexibility settings failed; A default response is generated and returned to consuming APIs");
				// in case the back end cannot respond resolve with a default response
				oSettings = {
					isKeyUser: false,
					isKeyUserTranslationEnabled: false,
					isVariantSharingEnabled: false,
					isVariantPersonalizationEnabled: true,
					isAtoAvailable: false,
					isAtoEnabled: false,
					isAppVariantSaveAsEnabled: false,
					isContextSharingEnabled: true,
					isContextBasedAdaptationEnabled: false,
					isCondensingEnabled: false,
					isProductiveSystem: true,
					isPublicLayerAvailable: false,
					isLocalResetEnabled: false,
					isVariantAdaptationEnabled: false,
					isVariantAuthorNameAvailable: false,
					isSeenFeaturesAvailable: false,
					versioning: {},
					_bFlexChangeMode: false,
					_bFlexibilityAdaptationButtonAllowed: false
				};
			}
			// The following line is used by the Flex Support Tool to set breakpoints - please adjust the tool if you change it!
			oSettings.userId = sUserId;
			return Settings._storeInstance(oSettings);
		});
		Settings._oLoadSettingsPromise = oLoadingPromise;
		return oLoadingPromise;
	};

	/**
	 * Writes the data received from the storage into an internal instance and then returns the settings object within a Promise.
	 *
	 * @param {object} oSettings - Data received from the storage
	 * @returns {Promise} With parameter <code>oInstance</code> of type {sap.ui.fl.registry.Settings}
	 *
	 */
	Settings._storeInstance = function(oSettings) {
		Settings._instance ||= new Settings(oSettings);
		return Settings._instance;
	};

	/**
	 * Returns a settings instance from the local instance cache. There is only one instance of settings during a session. If no instance has been
	 * created before, undefined will be returned.
	 *
	 * @returns {sap.ui.fl.registry.Settings} Instance or undefined if no instance has been created so far
	 */
	Settings.getInstanceOrUndef = function() {
		return Settings._instance;
	};

	/**
	 * Getter for the default layer permissions
	 * @returns {object} Map with the default layer permissions
	 */
	Settings.getDefaultLayerPermissions = function() {
		return {
			VENDOR: true,
			CUSTOMER_BASE: true,
			CUSTOMER: true,
			PUBLIC: false,
			USER: false
		};
	};

	/**
	 * Getter for the developer mode layer permissions
	 * @returns {object} Map with the default developer mode layer permissions
	 */
	Settings.getDeveloperModeLayerPermissions = function() {
		return {
			VENDOR: true,
			CUSTOMER_BASE: true,
			CUSTOMER: false,
			PUBLIC: false,
			USER: false
		};
	};

	/**
	 * Reads boolean property of settings.
	 *
	 * @param {string} sPropertyName - Name of property
	 * @returns {boolean} <code>true</code> if the property exists and is true
	 */
	Settings.prototype._getBooleanProperty = function(sPropertyName) {
		return this._oSettings[sPropertyName] || false;
	};

	/**
	 * Returns the key user status of the current user.
	 *
	 * @returns {boolean} <code>true</code> if the user is a flexibility key user, <code>false</code> if not supported
	 */
	Settings.prototype.isKeyUser = function() {
		return this._getBooleanProperty("isKeyUser");
	};

	/**
	 * Returns the information if translation is enabled for the KeyUser or not (has admin role).
	 *
	 * @returns {boolean} <code>true</code> if the user is a flexibility key user and has the admin role.
	 */
	Settings.prototype.isKeyUserTranslationEnabled = function() {
		return this._getBooleanProperty("isKeyUserTranslationEnabled");
	};

	/**
	 * Returns the information if a back end supports the PUBLIC layer.
	 *
	 * @returns {boolean} <code>true</code> if the PUBLIC layer is supported
	 */
	Settings.prototype.isPublicLayerAvailable = function() {
		return this._getBooleanProperty("isPublicLayerAvailable");
	};

	/**
	 * Returns the information if the adaptation of <code>sap.ui.comp.smartvariant.SmartVariantManagement</code> is enabled.
	 *
	 * @returns {boolean} <code>true</code> if the adaptation of <code>sap.ui.comp.smartvariant.SmartVariantManagement</code> is supported
	 */
	Settings.prototype.isVariantAdaptationEnabled = function() {
		return this._getBooleanProperty("isVariantAdaptationEnabled");
	};

	/**
	 * Returns a flag if save as app variants is enabled in the backend
	 *
	 * @returns {boolean} <code>true</code> if the underlying ABAP system allows app variants, <code>false</code> if not supported
	 */
	Settings.prototype.isAppVariantSaveAsEnabled = function() {
		return !this.isContextBasedAdaptationEnabled() && this._getBooleanProperty("isAppVariantSaveAsEnabled");
	};

	/**
	 * Returns a flag if save as key user adaptation is enabled in the backend
	 *
	 * @returns {boolean} <code>true</code> if the underlying ABAP system allows save as adaptation, <code>false</code> if not supported
	 */
	Settings.prototype.isContextBasedAdaptationEnabled = function() {
		var oUriParameters = new URLSearchParams(window.location.search);
		var bIsContextBasedAdaptationEnabled = oUriParameters.get("sap-ui-xx-rta-adaptations");
		return bIsContextBasedAdaptationEnabled === "true" || this._getBooleanProperty("isContextBasedAdaptationEnabled");
	};

	/**
	 * Returns a flag if the versioning is enabled for a given layer.
	 *
	 * @param {string} sLayer - Layer to check.
	 * @returns {boolean} <code>true</code> if versioning is supported in the given layer
	 */
	Settings.prototype.isVersioningEnabled = function(sLayer) {
		// there may be a versioning information for all layers
		return !!(this._oSettings.versioning[sLayer] || this._oSettings.versioning.ALL);
	};

	/**
	 * Returns <code>true</code> if back end is ModelS back end.
	 *
	 * @returns {boolean} <code>true</code> if ATO coding exists in back end
	 */
	Settings.prototype.isModelS = function() {
		return this._getBooleanProperty("isAtoAvailable");
	};

	/**
	 * Returns <code>true</code> if ATO is enabled in the back end.
	 *
	 * @returns {boolean} <code>true</code> if ATO is enabled
	 */
	Settings.prototype.isAtoEnabled = function() {
		return this._getBooleanProperty("isAtoEnabled");
	};

	/**
	 * Returns <code>true</code> if ATO is available in the back end.
	 *
	 * @returns {boolean} <code>true</code> if ATO is available
	 */
	Settings.prototype.isAtoAvailable = function() {
		return this._getBooleanProperty("isAtoAvailable");
	};

	/**
	 * Checks whether the current system is defined as a productive system.
	 *
	 * @returns {boolean} <code>true</code> if system is productive system
	 */
	Settings.prototype.isProductiveSystem = function() {
		return this._getBooleanProperty("isProductiveSystem");
	};

	/**
	 * Checks whether sharing of <code>sap.ui.fl.apply._internal.flexObjects.CompVariant</code>s  is enabled for the given user.
	 *
	 * @returns {boolean} <code>true</code> if sharing of <code>sap.ui.comp</code> variants is enabled
	 */
	Settings.prototype.isVariantSharingEnabled = function() {
		return this._getBooleanProperty("isVariantSharingEnabled");
	};

	/**
	 * Checks whether sharing of <code>sap.ui.fl</code> variants is enabled for the given user.
	 *
	 * @returns {boolean} <code>true</code> if sharing of <code>sap.ui.fl</code> variants is enabled
	 */
	Settings.prototype.isPublicFlVariantEnabled = function() {
		return this._getBooleanProperty("isPublicFlVariantEnabled");
	};

	/**
	 * Checks whether sharing of <code>sap.ui.fl</code> variants can be based on contexts.
	 *
	 * @returns {boolean} <code>true</code> if context based sharing of <code>sap.ui.fl</code> variants is enabled
	 */
	Settings.prototype.isContextSharingEnabled = function() {
		return this._getBooleanProperty("isContextSharingEnabled");
	};

	/**
	 * Checks whether personalization of variants is enabled or not.
	 *
	 * @returns {boolean} <code>true</code> if personalization of variants is enabled
	 */
	Settings.prototype.isVariantPersonalizationEnabled = function() {
		return this._getBooleanProperty("isVariantPersonalizationEnabled");
	};

	/**
	 * Checks whether full names of variants' authors are available or not.
	 *
	 * @returns {boolean} <code>true</code> if personalization of variants is enabled
	 */
	Settings.prototype.isVariantAuthorNameAvailable = function() {
		return this._getBooleanProperty("isVariantAuthorNameAvailable");
	};

	/**
	 * Checks whether condensing of changes is enabled for the used backend.
	 *
	 * @returns {boolean} <code>true</code> if condensing of changes is enabled
	 */
	Settings.prototype.isCondensingEnabled = function() {
		return this._getBooleanProperty("isCondensingEnabled");
	};

	/**
	 * Checks whether the personalization connector is used.
	 *
	 * @returns {boolean} <code>true</code> if personalization connector is used
	 */
	Settings.prototype.hasPersoConnector = function() {
		return this._getBooleanProperty("hasPersoConnector");
	};

	/**
	 * Checks whether change transport mechanism is available for the current system or not.
	 *
	 * @returns {boolean} <code>true</code> if transport of changes is available
	 */
	 Settings.prototype.isSystemWithTransports = function() {
		// Currently, transport mechanism is only available in ABAP stack which can be identified by system and client ids
		return !!(this._oSettings.system && this._oSettings.client);
	};

	/**
	 * Checks whether publishing of versions is available for the current backend or not.
	 *
	 * @returns {boolean} <code>true</code> if publishing of versions is available
	 */
	Settings.prototype.isPublishAvailable = function() {
		// Currently, only Keyuser service with Content Agent integrated will return this settings value
		return !!this._oSettings.isPublishAvailable;
	};

	/**
	 * Checks whether the current system is defined as a productive system and transport mechanism of changes is also available or not.
	 *
	 * @returns {boolean} <code>true</code> if transport of changes is available
	 */
	Settings.prototype.isProductiveSystemWithTransports = function() {
		return this.isProductiveSystem() && this.isSystemWithTransports();
	};

	/**
	 * Returns the information if a back end supports local reset.
	 *
	 * @returns {boolean} <code>true</code> if the local reset is supported
	 */
	 Settings.prototype.isLocalResetEnabled = function() {
		return this._getBooleanProperty("isLocalResetEnabled");
	};

	/**
	 * Returns the information if a backend supports to save viewed features for Whats New.
	 *
	 * @returns {boolean} <code>true</code> if viewed features is supported
	 */
	 Settings.prototype.isSeenFeaturesAvailable = function() {
		return this._getBooleanProperty("isSeenFeaturesAvailable");
	};

	/**
	 * Getter for the system ID of the connected back end.
	 * This is taken from the <code>system</code> property of the flex settings. Only filled for an ABAP back end.
	 *
	 * @returns {string} System ID of the connected back end or undefined (when property <code>system</code> does not exist in the flex settings file)
	 */
	Settings.prototype.getSystem = function() {
		return this._oSettings.system;
	};

	/**
	 * Getter for the client of the connected back end.
	 * This is taken from the <code>client</code> property of the flex settings. Only filled for an ABAP back end.
	 *
	 * @returns {string} Client of the connected backend or undefined (when property <code>system</code> does not exist in the flex settings file)
	 */
	Settings.prototype.getClient = function() {
		return this._oSettings.client;
	};

	// Used for stubbing in tests
	Settings.prototype._getHostname = function() {
		return document.location.hostname;
	};

	/**
	 * Detects whether the system is a customer system.
	 * This is taken from the <code>systemType</code> property of the flex settings (only filled for an ABAP back end)
	 * or the hostname.
	 *
	 * @returns {boolean} <code>true</code> if it is a customer system
	 */
	 Settings.prototype.isCustomerSystem = function() {
		var sSystemType = this._oSettings.systemType;
		var bIsCustomerSystem = {
			CUSTOMER: true,
			SAP: false
		}[sSystemType];
		var sHostname = this._getHostname();

		return bIsCustomerSystem !== undefined
			? bIsCustomerSystem
			// Fallback if back end has no info, guess based on hostname
			: !(
				sHostname === "localhost"
				|| sHostname === "127.0.0.1"
			);
	};

	/**
	 * Getter for the id of the current user.
	 * This is taken from the <code>userId</code> property of the flex settings.
	 *
	 * @returns {string} User ID of the current user.
	 */
	 Settings.prototype.getUserId = function() {
		return this._oSettings.userId;
	};

	return Settings;
});