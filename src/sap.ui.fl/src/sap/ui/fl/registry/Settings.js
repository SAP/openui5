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
		if (!oSettings.features) {
			// hardcoded list of flex features (change types) and their valid "writable layer"
			oSettings.features = {
				"addField": [
					"CUSTOMER", "VENDOR"
				],
				"addGroup": [
					"CUSTOMER", "VENDOR"
				],
				"removeField": [
					"CUSTOMER", "VENDOR"
				],
				"removeGroup": [
					"CUSTOMER", "VENDOR"
				],
				"hideControl": [
					"CUSTOMER", "VENDOR"
				],
				"unhideControl": [
					"CUSTOMER", "VENDOR"
				],
				"stashControl": [
				  "CUSTOMER", "VENDOR"
				],
				"unstashControl": [
				  "CUSTOMER", "VENDOR"
				],
				"renameField": [
					"CUSTOMER", "VENDOR"
				],
				"renameGroup": [
					"CUSTOMER", "VENDOR"
				],
				"moveFields": [
					"CUSTOMER", "VENDOR"
				],
				"moveGroups": [
					"CUSTOMER", "VENDOR"
				],
				"moveElements": [
					"CUSTOMER", "VENDOR"
				],
				"moveControls": [
					"CUSTOMER", "VENDOR"
				],
				"propertyChange": [
					"VENDOR", "CUSTOMER_BASE"
				],
				"propertyBindingChange": [
					"VENDOR", "CUSTOMER_BASE"
				]
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

	Settings._instances = {};
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
	 * Returns a settings instance after reading the settings from the backend if not already done. There is only one instance of settings during a
	 * session.
	 *
	 * @param {string} sComponentName current UI5 component name
	 * @param {map} mPropertyBag - (optional) contains additional data that are needed for reading of changes
	 * - appDescriptor that belongs to actual component
	 * - siteId that belongs to actual component
	 * @returns {Promise} with parameter <code>oInstance</code> of type {sap.ui.fl.registry.Settings}
	 * @public
	 */
	Settings.getInstance = function(sComponentName, mPropertyBag) {
		return Cache.getChangesFillingCache(LrepConnector.createConnector(), sComponentName, mPropertyBag).then(function(oFileContent) {
			var oSettings;
			if (Settings._instances[sComponentName]) {
				// if instance exists the backend settings are coming from the cache as well and can be ignored
				oSettings = Settings._instances[sComponentName];
			} else if (oFileContent.changes && oFileContent.changes.settings) {
				oSettings = new Settings(oFileContent.changes.settings);
				Settings._instances[sComponentName] = oSettings;
			} else {
				oSettings = new Settings({});
				Settings._instances[sComponentName] = oSettings;
			}
			return oSettings;
		});
	};

	/**
	 * Returns a settings instance from the local instance cache. There is only one instance of settings during a session. If no instance has been
	 * created before, undefined will be returned.
	 *
	 * @param {string} sComponentName current UI5 component name
	 * @returns {sap.ui.fl.registry.Settings} instance or undefined if no instance has been created so far.
	 * @public
	 */
	Settings.getInstanceOrUndef = function(sComponentName) {
		var oSettings;
		if (Settings._instances[sComponentName]) {
			oSettings = Settings._instances[sComponentName];
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
	 * Returns true if backend is ModelS backend.
	 *
	 * @returns {boolean} true if ATO coding exists in backend.
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
	 * Returns true if ATO is enabled in the backend.
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
	 * Checks if a change type is enabled for the current writable layer
	 *
	 * @param {string} sChangeType change type to be checked
	 * @param {string} sActiveLayer active layer name; if not provided "USER" is the default.
	 * @returns {boolean} true if the change type is enabled, false if not supported.
	 * @public
	 */
	Settings.prototype.isChangeTypeEnabled = function(sChangeType, sActiveLayer) {
		if (!sActiveLayer) {
			sActiveLayer = 'USER';
		}
		var bIsEnabled = false;
		if (!this._oSettings.features[sChangeType]) {
			// if the change type is not in the feature list, the change type is not check relevant and therefore always enabled.
			// if a change type should be disabled for all layers, an entry in the feature map has to exist with an empty array.
			bIsEnabled = true;
		} else {
			var iArrayPos = jQuery.inArray(sActiveLayer, this._oSettings.features[sChangeType]);
			if (iArrayPos < 0) {
				bIsEnabled = false;
			} else {
				bIsEnabled = true;
			}
		}
		return bIsEnabled;
	};

	/**
	 * Is current back end system defined as productive system which can also transport changes
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

	return Settings;
}, /* bExport= */true);
