/*!
 * ${copyright}
 */

/* global localStorage */

sap.ui.define([
	"sap/ui/support/supportRules/RuleSerializer",
	"sap/ui/support/supportRules/Constants"
], function (RuleSerializer, Constants) {
	"use strict";

	/**
	 * Encodes rules written by the user.
	 * @private
	 * @function
	 * @name Encode
	 * @param {string} sData Stringified object containing rule properties.
	 * @returns {string} base-64 encoded string.
	 */
	function encode(sData) {
		return window.btoa(unescape(encodeURIComponent(sData)));
	}

	/**
	 * Decodes the already encoded data by the user.
	 * @private
	 * @function
	 * @name Decode
	 * @param {string} sData Stringified base-64 object containing rule properties.
	 * @returns {string} Stringified object containing rule properties.
	 */
	function decode(sData) {
		return decodeURIComponent(escape(window.atob(sData)));
	}

	var _storage = localStorage,
		_cookieInterface = {
			get cookie() {
				return document.cookie;
			},
			set cookie(sValue) {
				document.cookie = sValue;
			}
		};

	/**
	 * @class
	 * The Storage is used to store and receive data in/from the LocalStorage in the browser.
	 * <h3>Overview</h3>
	 * The Storage class is used to persist user settings.
	 * <h3>Usage</h3>
	 * This class must be used with {@link sap.ui.support.RuleSerializer} and {@link sap.ui.support.Constants} in order to store user data in the LocalStorage.
	 *
	 * @name sap.ui.support.Storage
	 * @alias sap.ui.support.Storage
	 * @author SAP SE.
	 * @version ${version}
	 * @private
	 */
	return {

		/**
		 * Returns all previously created temporary rules.
		 * @private
		 * @name sap.ui.support.Storage.getRules
		 * @method
		 * @returns {object[]} An array containing all the temporary rules.
		 */
		getRules: function () {
			var tempRules = [],
				rawLSData;

			try {
				rawLSData = _storage.getItem(Constants.LOCAL_STORAGE_TEMP_RULES_KEY);

				if (!rawLSData) {
					return null;
				}

				tempRules = JSON.parse(decode(rawLSData));

				tempRules = tempRules.map(function (tempRule) {
					return RuleSerializer.deserialize(tempRule, true);
				});
			} catch (oError) {
				// Swallow "Access Denied" exceptions in cross-origin scenarios.
			}

			return tempRules;
		},

		/**
		 * Saves the temporary rules into the LocalStorage persistence layer.
		 * @private
		 * @name sap.ui.support.Storage.setRules
		 * @method
		 * @param {object[]} rules The temporary rules from the shared model.
		 */
		setRules: function (rules) {
			var stringifyRules = encode(JSON.stringify(rules));
			_storage.setItem(Constants.LOCAL_STORAGE_TEMP_RULES_KEY, stringifyRules);
		},

		/**
		 * Retrieves the selected rules which are stored in the LocalStorage persistence layer.
		 * @private
		 * @method
		 * @name sap.ui.support.Storage.getSelectedRules
		 * @returns {object[]} All selected rules that are stored in the LocalStorage persistence layer.
		 */
		getSelectedRules: function () {
			var rawLSData = _storage.getItem(Constants.LOCAL_STORAGE_SELECTED_RULES_KEY);

			if (!rawLSData) {
				return null;
			}

			return JSON.parse(rawLSData);
		},

		/**
		 * Stores which rules are selected to be run by the analyzer on the next check.
		 * @private
		 * @method
		 * @name sap.ui.support.Storage.setSelectedRules
		 * @param {object[]} aSelectedRules The data for the libraries and their rules.
		 */
		setSelectedRules: function (aSelectedRules) {
			_storage.setItem(Constants.LOCAL_STORAGE_SELECTED_RULES_KEY, JSON.stringify(aSelectedRules));
		},

		/**
		 * Sets the context for the execution scope in the LocalStorage persistence layer.
		 * @private
		 * @method
		 * @name sap.ui.support.Storage.setSelectedContext
		 * @param {object} selectedContext Object containing the <code>analyzeContext</code> and <code>subtreeExecutionContextId</code>.
		 */
		setSelectedContext: function(selectedContext) {
			_storage.setItem(Constants.LOCAL_STORAGE_SELECTED_CONTEXT_KEY, JSON.stringify(selectedContext));
		},

		/**
		 * Retrieves the selected context from the LocalStorage persistence layer.
		 * @private
		 * @method
		 * @name sap.ui.support.Storage.getSelectedContext
		 * @returns {string} Parsed value of the <code>selectedContext</code> key in the LocalStorage persistence layer.
		 */
		getSelectedContext: function() {
			return JSON.parse(_storage.getItem(Constants.LOCAL_STORAGE_SELECTED_CONTEXT_KEY));
		},

		/**
		 * Sets the scope components that are selected.
		 * @private
		 * @method
		 * @name sap.ui.support.Storage.setSelectedScopeComponents
		 * @param {object} contextComponent Component that's stored in the LocalStorage.
		 */
		setSelectedScopeComponents: function(contextComponent)  {
			_storage.setItem(Constants.LOCAL_STORAGE_SELECTED_CONTEXT_COMPONENT_KEY, JSON.stringify(contextComponent));
		},

		/**
		 * Gets the scope components that are selected.
		 * @private
		 * @method
		 * @name sap.ui.support.Storage.getSelectedScopeComponents
		 * @returns {string} componentContext The selected components within a given scope.
		 */
		getSelectedScopeComponents: function() {
			var componentContext = _storage.getItem(Constants.LOCAL_STORAGE_SELECTED_CONTEXT_COMPONENT_KEY);
			return JSON.parse(componentContext);
		},

		/**
		 * Overwrites the temporary rules into the local storage persistence layer.
		 * @private
		 * @method
		 * @name sap.ui.support.Storage.removeSelectedRules
		 * @param {object[]} aSelectedRules The temporary rules from the shared model.
		 */
		removeSelectedRules: function(aSelectedRules) {
			this.setRules(aSelectedRules);
		},

		/**
		 * Sets the visible column setting selection.
		 * @method
		 * @name sap.ui.support.Storage.setVisibleColumns
		 * @param {string[]} aVisibleColumns visible columns ids
		 */
		setVisibleColumns: function(aVisibleColumns)  {
			_storage.setItem(Constants.LOCAL_STORAGE_SELECTED_VISIBLE_COLUMN_KEY, JSON.stringify(aVisibleColumns));
		},

		/**
		 * Gets the visible column setting selection.
		 * @method
		 * @name sap.ui.support.Storage.getVisibleColumns
		 * @returns {string[]} ids of visible columns.
		 */
		getVisibleColumns: function()  {
			return JSON.parse(_storage.getItem(Constants.LOCAL_STORAGE_SELECTED_VISIBLE_COLUMN_KEY));
		},

		/**
		 * Retrieves the list of selection presets
		 * @private
		 * @method
		 * @name sap.ui.support.Storage.getSelectionPresets
		 * @returns {Object[]} The list of selection presets
		 */
		getSelectionPresets: function() {
			return JSON.parse(_storage.getItem(Constants.LOCAL_STORAGE_SELECTION_PRESETS_KEY));
		},

		/**
		 * Retrieves the list of custom presets
		 * @private
		 * @method
		 * @name sap.ui.support.Storage.getCustomPresets
		 * @returns {Object[]} The list of custom presets
		 */
		getCustomPresets: function() {
			return JSON.parse(_storage.getItem(Constants.LOCAL_STORAGE_CUSTOM_PRESETS_KEY));
		},

		/**
		 * Sets the list of selection presets
		 * @private
		 * @method
		 * @name sap.ui.support.Storage.setSelectionPresets
		 * @param {Object[]} selectionPresets The list of selection presets
		 */
		setSelectionPresets: function(selectionPresets)  {
			_storage.setItem(Constants.LOCAL_STORAGE_SELECTION_PRESETS_KEY, JSON.stringify(selectionPresets));
		},

		/**
		 * Sets the list of custom presets
		 * @private
		 * @method
		 * @name sap.ui.support.Storage.setCustomPresets
		 * @param {Object[]} customPresets The list of custom presets
		 */
		setCustomPresets: function(customPresets)  {
			_storage.setItem(Constants.LOCAL_STORAGE_CUSTOM_PRESETS_KEY, JSON.stringify(customPresets));
		},

		/**
		 * Removes all data from LocalStorage persistence layer.
		 * @private
		 * @method
		 * @name sap.ui.support.Storage.removeAllData
		 */
		removeAllData: function() {
			_storage.removeItem(Constants.LOCAL_STORAGE_TEMP_RULES_KEY);
			_storage.removeItem(Constants.LOCAL_STORAGE_SELECTED_RULES_KEY);
			_storage.removeItem(Constants.LOCAL_STORAGE_SELECTED_CONTEXT_KEY);
			_storage.removeItem(Constants.LOCAL_STORAGE_SELECTED_CONTEXT_COMPONENT_KEY);
			_storage.removeItem(Constants.LOCAL_STORAGE_SELECTED_VISIBLE_COLUMN_KEY);
			_storage.removeItem(Constants.LOCAL_STORAGE_SELECTION_PRESETS_KEY);
			_storage.removeItem(Constants.LOCAL_STORAGE_CUSTOM_PRESETS_KEY);
			_storage.removeItem(Constants.LOCAL_STORAGE_CUSTOM_PRESETS_KEY);
			_storage.removeItem(Constants.LOCAL_STORAGE_TEMP_RULES_DISABLED_WARNED);
		},

		/**
		 * Creates a cookie with encoded information in the LocalStorage persistence layer.
		 * @private
		 * @method
		 * @name sap.ui.support.Storage.createPersistenceCookie
		 * @param {string} sCookieName Name of the cookie.
		 * @param {boolean} sCookieValue Contents of the cookie.
		 * @returns {void}
		 */
		createPersistenceCookie: function(sCookieName, sCookieValue) {
			_cookieInterface.cookie = sCookieName + "=" + sCookieValue;
		},

		/**
		 * Retrieves the persistence options of the user in the LocalStorage layer.
		 * @private
		 * @method
		 * @name sap.ui.support.Storage.readPersistenceCookie
		 * @alias readPersistenceCookie
		 * @param {string} sCookieName Name of the cookie.
		 * @returns {string} sOutput The persistence options of the user.
		 */
		readPersistenceCookie: function(sCookieName) {

			var name = sCookieName + "=",
				decodedCookie = decodeURIComponent(_cookieInterface.cookie),
				ca = decodedCookie.split(';'),
				sOutput = "";
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) == 0) {
					sOutput = c.substring(name.length, c.length);
					return sOutput;
				}
			}

			return sOutput;

		},

		/**
		 * Removes the cookie with persistence information in the LocalStorage.
		 * @private
		 * @method
		 * @name sap.ui.support.Storage.deletePersistenceCookie
		 * @param {string} sCookieName Name of the cookie
		 * @returns {void}
		 */
		deletePersistenceCookie: function(sCookieName) {
			_cookieInterface.cookie = sCookieName + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		},

		markTempRulesDisabledWarned: function () {
			_storage.setItem(Constants.LOCAL_STORAGE_TEMP_RULES_DISABLED_WARNED, true);
		},

		getTempRulesDisabledWarned: function () {
			return _storage.getItem(Constants.LOCAL_STORAGE_TEMP_RULES_DISABLED_WARNED);
		},

		_setStorage: function (oStorage) {
			_storage = oStorage;
		},

		_getStorage: function () {
			return _storage;
		},

		_setCookieInterface: function (oCookieInterface) {
			_cookieInterface = oCookieInterface;
		},

		_getCookieInterface: function () {
			return _cookieInterface;
		}
	};

}, true);
