/*!
 * ${copyright}
 */

/*global localStorage */

sap.ui.define([
	"sap/ui/support/supportRules/RuleSerializer",
	"sap/ui/support/supportRules/Constants"
],
function (RuleSerializer, constants) {
	"use strict";

	function encode(sData) {
		return window.btoa(unescape(encodeURIComponent(sData)));
	}

	function decode(sData) {
		return decodeURIComponent(escape(window.atob(sData)));
	}

	return {
		/**
		 * Returns all previously created user temporary rules
		 * @returns {Array} An array containing all the temporary rules
		 */
		getRules: function () {
			var rawLSData = localStorage.getItem(constants.LOCAL_STORAGE_TEMP_RULES_KEY);

			if (!rawLSData) {
				return null;
			}

			var tempRules = JSON.parse(decode(rawLSData));

			tempRules = tempRules.map(function (tempRule) {
				return RuleSerializer.deserialize(tempRule);
			});

			return tempRules;
		},

		/**
		 * Saves the temporary rules into the local storage persistence layer
		 * @param {Array} rules The temporary rules from the shared model
		 */
		setRules: function (rules) {
			var stringifyRules = encode(JSON.stringify(rules));
			localStorage.setItem(constants.LOCAL_STORAGE_TEMP_RULES_KEY, stringifyRules);
		},

		getSelectedRules: function () {
			var rawLSData = localStorage.getItem(constants.LOCAL_STORAGE_SELECTED_RULES_KEY);

			if (!rawLSData) {
				return null;
			}

			return JSON.parse(rawLSData);
		},

		setSelectedRules: function (selectedRules) {
			localStorage.setItem(constants.LOCAL_STORAGE_SELECTED_RULES_KEY, JSON.stringify(selectedRules));
		},

		setSelectedContext: function(selectedContext) {
			localStorage.setItem(constants.LOCAL_STORAGE_SELECTED_CONTEXT_KEY, JSON.stringify(selectedContext));
		},

		getSelectedContext: function() {
			return JSON.parse(localStorage.getItem(constants.LOCAL_STORAGE_SELECTED_CONTEXT_KEY));
		},

		setSelectedScopeComponents: function(contextComponent)  {
			localStorage.setItem(constants.LOCAL_STORAGE_SELECTED_CONTEXT_COMPONENT_KEY, JSON.stringify(contextComponent));
		},

		getSelectedScopeComponents: function() {
			var componentContext = localStorage.getItem(constants.LOCAL_STORAGE_SELECTED_CONTEXT_COMPONENT_KEY);
			return JSON.parse(componentContext);
		},
		/**
		 * Overwrites the temporary rules into the local storage persistence layer
		 * @param {Array} rules The temporary rules from the shared model
		 */
		removeSelectedRules: function(selectedRules) {
			this.setRules(selectedRules);
		},

		removeAllData: function() {
			localStorage.removeItem(constants.LOCAL_STORAGE_TEMP_RULES_KEY);
			localStorage.removeItem(constants.LOCAL_STORAGE_SELECTED_CONTEXT_KEY);
			localStorage.removeItem(constants.LOCAL_STORAGE_SELECTED_CONTEXT_COMPONENT_KEY);
		},

		/**
		 * Create cookie to save information if we wish to preserve data in local storage
		 * @param {String} name of the cookie
		 * @param {boolean} value of the cookie
		 */
		createPersistenceCookie: function(name, value) {
			document.cookie = name + "=" + value;
		},

		readPersistenceCookie: function(cname) {

			var name = cname + "=",
				decodedCookie = decodeURIComponent(document.cookie),
				ca = decodedCookie.split(';'),
				output = "";
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) == 0) {
					output = c.substring(name.length, c.length);
					return  output;
				}
			}
			return output;

		},

		deletePersistenceCookie: function(cookieName) {
			document.cookie = cookieName + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		}

	};
}, true);
