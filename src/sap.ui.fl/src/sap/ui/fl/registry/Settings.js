/*!
 * ${copyright}
 */
/*global Error */

sap.ui.define([
	"jquery.sap.global", "sap/ui/fl/LrepConnector", "sap/ui/fl/Cache", "sap/ui/fl/Utils", "sap/ui/base/EventProvider"
], function(jQuery, LrepConnector, Cache, Utils, EventProvider) {
	"use strict";

	/**
	 * FlexSettings access
	 *
	 * @param {object} oSettings settings as JSON object
	 * @constructor
	 * @alias sap.ui.fl.registry.Settings
	 * @author SAP SE
	 * @experimental Since 1.27.0
	 * @private
	 */
	var Settings = function(oSettings) {
		EventProvider.apply(this);
		if (!oSettings) {
			throw new Error("no flex settings provided");
		}
		// Defaults layers used for standard changes, such as 'move' or 'add'
		if (!oSettings.defaultLayerPermissions) {
			oSettings.defaultLayerPermissions = {
				"VENDOR": true,
				"CUSTOMER_BASE": true,
				"CUSTOMER": true,
				"USER": false
			};
		}

		// These are the permissions for the Developer Mode Changes, e.g. 'propertyChange', 'propertyBindingChange'
		if (!oSettings.developerModeLayerPermissions) {
			oSettings.developerModeLayerPermissions = {
				"VENDOR": true,
				"CUSTOMER_BASE": true,
				"CUSTOMER": false,
				"USER": false
			};
		}

		// By default, variant sharing is enabled
		if (!(Settings._IS_VARIANT_SHARING_ENABLED in oSettings)) {
			oSettings.isVariantSharingEnabled = true;
		}

		this._oSettings = oSettings;
		this._hasMergeErrorOccured = false;
	};

	Settings.prototype = jQuery.sap.newObject(EventProvider.prototype);

	Settings.events = {
		flexibilityAdaptationButtonAllowedChanged: "flexibilityAdaptationButtonAllowedChanged",
		changeModeUpdated: "changeModeUpdated"
	};

	Settings._instance = undefined;
	Settings._bFlexChangeMode = true;
	Settings._bFlexibilityAdaptationButtonAllowed = false;
	Settings._oEventProvider = new EventProvider();
	Settings._IS_VARIANT_SHARING_ENABLED = "isVariantSharingEnabled";

	/**
	 * fires the passed event via its event provider
	 *
	 * @param {string} sEventId name of the event
	 * @param {object} mParameters
	 *
	 * @public
	 */
	Settings.fireEvent = function(sEventId, mParameters) {
		Settings._oEventProvider.fireEvent(sEventId, mParameters);
	};

	/**
	 * attaches a callback to an event on the event provider of Settings
	 *
	 * @param {string} sEventId name of the event
	 * @param {function} oCallback
	 *
	 * @public
	 */
	Settings.attachEvent = function(sEventId, oCallback) {
		Settings._oEventProvider.attachEvent(sEventId, oCallback);
	};

	/**
	 * detaches a callback to an event on the event provider of Settings
	 *
	 * @param {string} sEventId name of the event
	 * @param {function} oCallback
	 *
	 * @public
	 */
	Settings.detachEvent = function(sEventId, oCallback) {
		Settings._oEventProvider.detachEvent(sEventId, oCallback);
	};

	/**
	 * Returns a settings instance after reading the settings from the back end if not already done. There is only one instance of settings during a
	 * session.
	 *
	 * @returns {Promise} with parameter <code>oInstance</code> of type {sap.ui.fl.registry.Settings}
	 * @public
	 */
	Settings.getInstance = function() {
		if (Settings._instance) {
			return Promise.resolve(Settings._instance);
		}
		var oPromise = Cache.getFlexDataPromise();
		if (oPromise) {
			return oPromise.then(
				function (oFileContent) {
					var oSettings = {};
					if (oFileContent.changes && oFileContent.changes.settings) {
						oSettings = oFileContent.changes.settings;
					}
					return Settings._storeInstance(oSettings);
				},
				function () {
					// In case /flex/data request failed, send /flex/settings as a fallback
					return Settings._loadSettings();
				});
		}
		return Settings._loadSettings();
	};

	/**
	 * Sends request to the back end for settings content. Stores content into internal setting instance and returns the instance.
	 *
	 * @returns {Promise} With parameter <code>oInstance</code> of type {sap.ui.fl.registry.Settings}
	 * @private
	 */
	Settings._loadSettings = function() {
		return LrepConnector.createConnector().loadSettings().then(function (oSettings){
			return Settings._storeInstance(oSettings);
		});
	};

	/**
	 * Writes the data received from the back end or cache into an internal instance and then returns the settings object within a Promise.
	 *
	 * @param oSettings - Data received from the back end or cache
	 * @returns {Promise} with parameter <code>oInstance</code> of type {sap.ui.fl.registry.Settings}
	 * @protected
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
	 * @returns {sap.ui.fl.registry.Settings} instance or undefined if no instance has been created so far.
	 * @public
	 */
	Settings.getInstanceOrUndef = function() {
		var oSettings;
		if (Settings._instance) {
			oSettings = Settings._instance;
		}
		return oSettings;
	};

	/**
	 * Checks if the flexibility change mode is enabled.
	 *
	 * @returns {boolean} true if the flexibility change mode is enabled
	 * @public
	 */
	Settings.isFlexChangeMode = function() {
		var bFlexChangeModeUrl = this._isFlexChangeModeFromUrl();
		if (bFlexChangeModeUrl !== undefined) {
			return bFlexChangeModeUrl;
		}

		return Settings._bFlexChangeMode;
	};

	/**
	 * Checks if the flexibility change mode is enabled via URL query parameter
	 *
	 * @returns {boolean} bFlexChangeMode true if the flexibility change mode is enabled, false if not enabled, undefined if not set via url.
	 * @public
	 */
	Settings._isFlexChangeModeFromUrl = function() {
		var bFlexChangeMode;
		var oUriParams = jQuery.sap.getUriParameters();
		if (oUriParams && oUriParams.mParams && oUriParams.mParams['sap-ui-fl-changeMode'] && oUriParams.mParams['sap-ui-fl-changeMode'][0]) {
			if (oUriParams.mParams['sap-ui-fl-changeMode'][0] === 'true') {
				bFlexChangeMode = true;
			} else if (oUriParams.mParams['sap-ui-fl-changeMode'][0] === 'false') {
				bFlexChangeMode = false;
			}
		}
		return bFlexChangeMode;
	};

	/**
	 * Activates the flexibility change mode.
	 *
	 * @public
	 */
	Settings.activateFlexChangeMode = function() {
		var bFlexChangeModeOn = true;
		Settings._setFlexChangeMode(bFlexChangeModeOn);
	};

	/**
	 * Deactivates / leaves the flexibility change mode.
	 *
	 * @public
	 */
	Settings.leaveFlexChangeMode = function() {
		var bFlexChangeModeOff = false;
		Settings._setFlexChangeMode(bFlexChangeModeOff);
	};


	/**
	 * sets the flexChangeMode flag
	 * fires an event if the flag has been toggled
	 *
	 * @private
	 */
	Settings._setFlexChangeMode = function (bFlexChangeModeOn) {
		if (Settings._bFlexChangeMode === bFlexChangeModeOn) {
			return; // no change
		}

		Settings._bFlexChangeMode = bFlexChangeModeOn;
		var mParameter = {
			bFlexChangeMode: bFlexChangeModeOn
		};
		Settings.fireEvent(Settings.events.changeModeUpdated, mParameter);
	};

	/**
	 * Method to check for adaptation button allowance
	 *
	 * @returns {boolean} Settings._bFlexibilityAdaptationButtonAllowed
	 * @public
	 */
	Settings.isFlexibilityAdaptationButtonAllowed = function () {
		return Settings._bFlexibilityAdaptationButtonAllowed;
	};

	/**
	 * Method to allow the adaptation button
	 *
	 * @public
	 */
	Settings.allowFlexibilityAdaptationButton = function () {
		var bFlexibilityAdaptationButtonAllowed = true;
		Settings.setFlexibilityAdaptationButtonAllowed(bFlexibilityAdaptationButtonAllowed);
	};

	/**
	 * Method to disallow the adaptation button
	 *
	 * @public
	 */
	Settings.disallowFlexibilityAdaptationButton = function () {
		var bFlexibilityAdaptationButtonDisallowed = false;
		Settings.setFlexibilityAdaptationButtonAllowed(bFlexibilityAdaptationButtonDisallowed);
	};

	/**
	 * Method to set the adaptation button allowance flag on or off depending on the passed parameter
	 * fires an event if the flag has been toggled
	 *
	 * @param {boolean} bFlexibilityAdaptationButtonAllowed
	 *
	 * @public
	 */
	Settings.setFlexibilityAdaptationButtonAllowed = function (bFlexibilityAdaptationButtonAllowed) {
		if (Settings._bFlexibilityAdaptationButtonAllowed === bFlexibilityAdaptationButtonAllowed) {
			return; // no change
		}

		Settings._bFlexibilityAdaptationButtonAllowed = bFlexibilityAdaptationButtonAllowed;

		var mParameter = {
			bFlexibilityAdaptationButtonAllowed: bFlexibilityAdaptationButtonAllowed
		};
		Settings.fireEvent(Settings.events.flexibilityAdaptationButtonAllowedChanged, mParameter);

	};

	/**
	 * Returns the key user status of the current user.
	 *
	 * @returns {boolean} true if the user is a flexibility key user, false if not supported.
	 * @public
	 */
	Settings.prototype.isKeyUser = function() {
		var bIsKeyUser = false;
		if (this._oSettings.isKeyUser) {
			bIsKeyUser = this._oSettings.isKeyUser;
		}
		return bIsKeyUser;
	};

	/**
	 * Returns true if back end is ModelS back end.
	 *
	 * @returns {boolean} true if ATO coding exists in back end.
	 * @public
	 */
	Settings.prototype.isModelS = function() {
		var bIsModelS = false;
		if (this._oSettings.isAtoAvailable) {
			bIsModelS = this._oSettings.isAtoAvailable;
		}
		return bIsModelS;
	};

	/**
	 * Returns true if ATO is enabled in the back end.
	 *
	 * @returns {boolean} true if ATO is enabled.
	 * @public
	 */
	Settings.prototype.isAtoEnabled = function() {
		var bIsAtoEnabled = false;
		if (this._oSettings.isAtoEnabled) {
			bIsAtoEnabled = this._oSettings.isAtoEnabled;
		}
		return bIsAtoEnabled;
	};

	/**
	 * Returns true if ATO is available in the back end.
	 *
	 * @returns {boolean} true if ATO is available.
	 * @public
	 */
	Settings.prototype.isAtoAvailable = function() {
		var bIsAtoAvailable = false;
		if (this._oSettings.isAtoAvailable) {
			bIsAtoAvailable = this._oSettings.isAtoAvailable;
		}
		return bIsAtoAvailable;
	};

	/**
	 * Checks whether the current system is defined as a productive system.
	 *
	 * @public
	 * @returns {boolean} true if system is productive system
	 */
	Settings.prototype.isProductiveSystem = function() {
		var bIsProductiveSystem = false;
		if (this._oSettings.isProductiveSystem) {
			bIsProductiveSystem = this._oSettings.isProductiveSystem;
		}
		return bIsProductiveSystem;
	};

	/**
	 * Checks whether sharing of variants is enabled.
	 *
	 * @public
	 * @returns {boolean} true if sharing of variants is enabled
	 */
	Settings.prototype.isVariantSharingEnabled = function() {
		return (this._oSettings.isVariantSharingEnabled === true);
	};

	Settings.prototype.setMergeErrorOccured = function(bErrorOccured) {
		this._hasMergeErrorOccoured = bErrorOccured;
	};
	/**
	 * Checks if a merge error occured during merging changes into the view on startup
	 */
	Settings.prototype.hasMergeErrorOccured = function() {
		return this._hasMergeErrorOccured;
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
