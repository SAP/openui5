/*!
 * ${copyright}
 */
sap.ui.define([],
	function() {
		"use strict";

		/**
		 * Constants used in the Support Assistant
		 * @enum
		 * @private
		 * @author SAP SE
		 * @namespace
		 * @name sap.ui.support.Constants
		 * @alias sap.ui.support.AssistantConstants
		 * @returns {Object} Object that contains all the constants.
		 */
		return {
			/**
			 * @enum
			 * @readonly
			 * The following constants are used to store rules and user data in the local storage.
			 */

			/**
			 * Stores temporary rules.
			 * @type {string}
			 */
			TEMP_RULESETS_NAME: "temporary",

			/**
			 * Name of the SupportAssistant.
			 * @type {string}
			 */
			SUPPORT_ASSISTANT_NAME: "Support Assistant",

			/**
			 * Key for storing temporary rules in the local storage.
			 * @type {string}
			 */
			LOCAL_STORAGE_TEMP_RULES_KEY: "support-assistant-temprules",

			/**
			 * Key for storing selected rules in the local storage.
			 * @type {string}
			 */
			LOCAL_STORAGE_SELECTED_RULES_KEY: "support-assistant-selected-rules",

			/**
			 * Key for storing selected context in the local storage.
			 * @type {string}
			 */
			LOCAL_STORAGE_SELECTED_CONTEXT_KEY: "support-assistant-settings-selected-context",

			/**
			 * Stores temporary rules in the local storage.
			 * @type {string}
			 */
			LOCAL_STORAGE_SELECTED_CONTEXT_COMPONENT_KEY: "support-assistant-settings-selected-context-components",

			/**
			 * The name of the persistence cookie.
			 * @type {string}
			 */
			COOKIE_NAME: "persistence-cookie"
		};


	}, /* bExport= */ true);
