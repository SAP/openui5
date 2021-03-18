/*!
 * ${copyright}
 */
/*global Error */

sap.ui.define([
	"sap/ui/fl/write/_internal/Storage",
	"sap/base/Log"
], function(
	Storage,
	Log
) {
	"use strict";

	/**
	 * FlexSettings access
	 *
	 * @param {object} oSettings settings as JSON object
	 * @constructor
	 * @alias sap.ui.fl.registry.Settings
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var Settings = function(oSettings) {
		if (!oSettings) {
			throw new Error("no flex settings provided");
		}
		// Defaults layers used for standard changes, such as 'move' or 'add'
		if (!oSettings.defaultLayerPermissions) {
			oSettings.defaultLayerPermissions = {
				VENDOR: true,
				CUSTOMER_BASE: true,
				CUSTOMER: true,
				PUBLIC: false,
				USER: false
			};
		}

		// These are the permissions for the Developer Mode Changes, e.g. 'propertyChange', 'propertyBindingChange'
		if (!oSettings.developerModeLayerPermissions) {
			oSettings.developerModeLayerPermissions = {
				VENDOR: true,
				CUSTOMER_BASE: true,
				CUSTOMER: false,
				PUBLIC: false,
				USER: false
			};
		}

		// By default, variant sharing is enabled
		if (oSettings.isVariantSharingEnabled === undefined) {
			oSettings.isVariantSharingEnabled = true;
		}

		this._oSettings = oSettings;
	};

	/**
	 * attaches a callback to an event on the event provider of Settings
	 *
	 * @param {string} sEventId name of the event
	 * @param {function} oCallback
	 */
	Settings.attachEvent = function(sEventId, oCallback) {
		Settings._oEventProvider.attachEvent(sEventId, oCallback);
	};

	/**
	 * detaches a callback to an event on the event provider of Settings
	 *
	 * @param {string} sEventId name of the event
	 * @param {function} oCallback
	 */
	Settings.detachEvent = function(sEventId, oCallback) {
		Settings._oEventProvider.detachEvent(sEventId, oCallback);
	};

	/**
	 * Returns a settings instance after reading the settings from the back end if not already done. There is only one instance of settings during a
	 * session.
	 *
	 * @returns {Promise} with parameter <code>oInstance</code> of type {sap.ui.fl.registry.Settings}
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
		var oLoadingPromise = Storage.loadFeatures().then(function (oSettings) {
			if (!oSettings) {
				Log.error("The request for flexibility settings failed; A default response is generated and returned to consuming APIs");
				// in case the back end cannot respond resolve with a default response
				oSettings = {
					isKeyUser: false,
					isVariantSharingEnabled: false,
					isVariantPersonalizationEnabled: true,
					isAtoAvailable: false,
					isAtoEnabled: false,
					isAppVariantSaveAsEnabled: false,
					isCondensingEnabled: false,
					isProductiveSystem: true,
					isPublicLayerAvailable: false,
					isVariantAdaptationEnabled: false,
					versioning: {},
					_bFlexChangeMode: false,
					_bFlexibilityAdaptationButtonAllowed: false
				};
			}
			return Settings._storeInstance(oSettings);
		});
		Settings._oLoadSettingsPromise = oLoadingPromise;
		return oLoadingPromise;
	};

	/**
	 * Writes the data received from the storage into an internal instance and then returns the settings object within a Promise.
	 *
	 * @param {object} oSettings - Data received from the storage
	 * @returns {Promise} with parameter <code>oInstance</code> of type {sap.ui.fl.registry.Settings}
	 *
	 */
	Settings._storeInstance = function(oSettings) {
		if (!Settings._instance) {
			Settings._instance = new Settings(oSettings);
		}
		return Settings._instance;
	};

	/**
	 * Returns a settings instance from the local instance cache. There is only one instance of settings during a session. If no instance has been
	 * created before, undefined will be returned.
	 *
	 * @returns {sap.ui.fl.registry.Settings} instance or undefined if no instance has been created so far
	 */
	Settings.getInstanceOrUndef = function() {
		return Settings._instance;
	};

	/**
	 * Reads boolean property of settings.
	 *
	 * @param {string} sPropertyName name of property
	 * @returns {boolean} true if the property exists and is true
	 */
	Settings.prototype._getBooleanProperty = function(sPropertyName) {
		return this._oSettings[sPropertyName] || false;
	};

	/**
	 * Returns the key user status of the current user.
	 *
	 * @returns {boolean} true if the user is a flexibility key user, false if not supported
	 */
	Settings.prototype.isKeyUser = function() {
		return this._getBooleanProperty("isKeyUser");
	};

	/**
	 * Returns the information if a back end supports the PUBLIC layer.
	 *
	 * @returns {boolean} true if the PUBLIC layer is supported
	 */
	Settings.prototype.isPublicLayerAvailable = function() {
		return this._getBooleanProperty("isPublicLayerAvailable");
	};

	/**
	 * Returns the information if the adaptation of <code>sap.ui.comp.smartvariant.SmartVariantManagement</code> is enabled.
	 *
	 * @returns {boolean} true if the adaptation of <code>sap.ui.comp.smartvariant.SmartVariantManagement</code> is supported
	 */
	Settings.prototype.isVariantAdaptationEnabled = function() {
		return this._getBooleanProperty("isVariantAdaptationEnabled");
	};

	/**
	 * Returns a flag if save as app variants is enabled in the backend
	 *
	 * @returns {boolean} true if the underlying ABAP system allows app variants, false if not supported
	 */
	Settings.prototype.isAppVariantSaveAsEnabled = function() {
		return this._getBooleanProperty("isAppVariantSaveAsEnabled");
	};

	/**
	 * Returns a flag if the versioning is enabled for a given layer.
	 *
	 * @param {string} sLayer - Layer to check.
	 * @returns {boolean} true if versioning is supported in the given layer
	 */
	Settings.prototype.isVersioningEnabled = function(sLayer) {
		// there may be a versioning information for all layers
		return !!(this._oSettings.versioning[sLayer] || this._oSettings.versioning["ALL"]);
	};

	/**
	 * Returns true if back end is ModelS back end.
	 *
	 * @returns {boolean} true if ATO coding exists in back end
	 */
	Settings.prototype.isModelS = function() {
		return this._getBooleanProperty("isAtoAvailable");
	};

	/**
	 * Returns true if ATO is enabled in the back end.
	 *
	 * @returns {boolean} true if ATO is enabled
	 */
	Settings.prototype.isAtoEnabled = function() {
		return this._getBooleanProperty("isAtoEnabled");
	};

	/**
	 * Returns true if ATO is available in the back end.
	 *
	 * @returns {boolean} true if ATO is available
	 */
	Settings.prototype.isAtoAvailable = function() {
		return this._getBooleanProperty("isAtoAvailable");
	};

	/**
	 * Checks whether the current system is defined as a productive system.
	 *
	 * @returns {boolean} true if system is productive system
	 */
	Settings.prototype.isProductiveSystem = function() {
		return this._getBooleanProperty("isProductiveSystem");
	};

	/**
	 * Checks whether sharing of variants is enabled for the given user.
	 *
	 * @returns {boolean} true if sharing of variants is enabled
	 */
	Settings.prototype.isVariantSharingEnabled = function() {
		return this._getBooleanProperty("isVariantSharingEnabled");
	};

	/**
	 * Checks whether personalization of variants is enabled or not.
	 *
	 * @returns {boolean} true if personalization of variants is enabled
	 */
	Settings.prototype.isVariantPersonalizationEnabled = function() {
		return this._getBooleanProperty("isVariantPersonalizationEnabled");
	};

	/**
	 * Checks whether condensing of changes is enabled for the used backend.
	 *
	 * @returns {boolean} true if condensing of changes is enabled
	 */
	Settings.prototype.isCondensingEnabled = function() {
		return this._getBooleanProperty("isCondensingEnabled");
	};

	/**
	 * Getter for the system Id of the connected backend.
	 * Taken from the property 'system' of the flex settings. Only filled for an ABAP backend.
	 *
	 * @returns {String} system Id of the connected backend or undefined (when property 'system' does not exist in the flex settings file)
	 */
	Settings.prototype.getSystem = function() {
		return this._oSettings.system;
	};

	/**
	 * Getter for the client of the connected backend.
	 * Taken from the property 'client' of the flex settings. Only filled for an ABAP backend.
	 *
	 * @returns {String} client of the connected backend or undefined (when property 'system' does not exist in the flex settings file)
	 */
	Settings.prototype.getClient = function() {
		return this._oSettings.client;
	};

	/**
	 * Getter for the default Layer-Permissions
	 */
	Settings.prototype.getDefaultLayerPermissions = function() {
		return this._oSettings.defaultLayerPermissions;
	};

	/**
	 * Getter for the Developer Mode Layer-Permissions
	 */
	Settings.prototype.getDeveloperModeLayerPermissions = function() {
		return this._oSettings.developerModeLayerPermissions;
	};

	return Settings;
}, /* bExport= */true);