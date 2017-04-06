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
	 * attaches an callback to an event on the event provider of Settings
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
	 * detaches an callback to an event on the event provider of Settings
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
	 * @param {string} sComponentName - Current SAPUI5 component name
	 * @param {string} [sAppVersion] - Current application version
	 * @param {map} [mPropertyBag] - Contains additional data needed for reading changes
	 * @param {object} [mPropertyBag.appDescriptor] - App descriptor belonging to actual component
	 * @param {string} [mPropertyBag.siteId] - Side ID that belongs to actual component
	 * @returns {Promise} with parameter <code>oInstance</code> of type {sap.ui.fl.registry.Settings}
	 * @public
	 */
	Settings.getInstance = function(sComponentName, sAppVersion, mPropertyBag) {
		if (Settings._instance) {
			return Promise.resolve(Settings._instance);
		}
		sAppVersion = sAppVersion || Utils.DEFAULT_APP_VERSION;
		return Cache.getChangesFillingCache(LrepConnector.createConnector(), { name: sComponentName, appVersion: sAppVersion }, mPropertyBag)
			.then(Settings._storeInstance.bind(Settings));
	};

	/**
	 * Writes the data received from the back end or cache into an internal map and then returns the settings object within a Promise.
	 *
	 * @param oFileContent - Data received from the back end or cache
	 * @returns {Promise} with parameter <code>oInstance</code> of type {sap.ui.fl.registry.Settings}
	 * @protected
	 *
	 */
	Settings._storeInstance = function(oFileContent) {
		var oSettings;

		if (oFileContent.changes && oFileContent.changes.settings) {
			oSettings = new Settings(oFileContent.changes.settings);
		} else {
			oSettings = new Settings({});
		}

		Settings._instance = oSettings;
		return oSettings;
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

	Settings.prototype.setMergeErrorOccured = function(bErrorOccured) {
		this._hasMergeErrorOccoured = bErrorOccured;
	};
	/**
	 * Checks if an merge error occured during merging changes into the view on startup
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
