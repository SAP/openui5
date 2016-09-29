/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global", "sap/ui/fl/LrepConnector", "sap/ui/fl/Cache"
], function(jQuery, LrepConnector, Cache) {
	"use strict";

	/**
	 * DescriptorSettings access
	 *
	 * @param {object} oSettings settings as JSON object
	 * @constructor
	 * @alias sap.ui.fl.descriptorRelated.api.Settings
	 * @author SAP SE
	 * @private
	 * @sap-restricted
	 */
	var Settings = function(oSettings) {
		if (!oSettings) {
			throw new Error("no descriptor settings provided");
		}
		this._oSettings = oSettings;
	};

	Settings._cachedSettingsPromise = null;

	/**
	 * Returns a settings instance after reading the settings from the backend if not already done. There is only one instance of settings during a
	 * session.
	 *
	 * @returns {Promise} with parameter <code>oInstance</code> of type {sap.ui.fl.descriptorRelated.api.Settings}
	 * @private
	 * @sap-restricted
	 */
	Settings.getInstance = function() {
		if (!Settings._cachedSettingsPromise) {
			Settings._cachedSettingsPromise = Cache.getChangesFillingCache(LrepConnector.createConnector(), "dummy").then(function(oFileContent) {
				var oSettings;
				if (oFileContent.changes && oFileContent.changes.settings) {
					oSettings = new Settings(oFileContent.changes.settings);
				} else {
					oSettings = new Settings({});
				}
				return oSettings;
			});
		}
		return Settings._cachedSettingsPromise;
	};

	/**
	 * Returns the key user status of the current user.
	 *
	 * @returns {boolean} true if the user is a flexibility key user, false if not supported.
	 * @private
	 * @sap-restricted
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
	 * @private
	 * @sap-restricted
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
	 * @private
	 * @sap-restricted
	 */
	Settings.prototype.isAtoEnabled = function() {
		var bIsAtoEnabled = false;
		if (this._oSettings.isAtoEnabled) {
			bIsAtoEnabled = this._oSettings.isAtoEnabled;
		}
		return bIsAtoEnabled;
	};

	/**
	 * Is current back end system defined as productive system which can also transport changes
	 *
	 * @returns {boolean} true if system is productive system
	 * @private
	 * @sap-restricted
	 */
	Settings.prototype.isProductiveSystem = function() {
		var bIsProductiveSystem = false;
		if (this._oSettings.isProductiveSystem) {
			bIsProductiveSystem = this._oSettings.isProductiveSystem;
		}
		return bIsProductiveSystem;
	};

	return Settings;
}, /* bExport= */true);
