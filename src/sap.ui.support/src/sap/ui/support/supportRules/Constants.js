/*!
 * ${copyright}
 */
sap.ui.define([],
	function() {
		"use strict";

		/**
		 * Constants used in the Support Assistant.
		 * @private
		 * @author SAP SE
		 * @namespace
		 * @name sap.ui.support.Constants
		 */
		return /** @lends sap.ui.support.Constants */ {
			/*
			 * The following constants are used to store rules and user data in the local storage.
			 */

			/**
			 * Stores temporary rules.
			 * @readonly
			 */
			TEMP_RULESETS_NAME: "temporary",

			/**
			 * Name of the SupportAssistant.
			 * @readonly
			 */
			SUPPORT_ASSISTANT_NAME: "Support Assistant",

			/**
			 * Key for storing temporary rules in the local storage.
			 * @readonly
			 */
			LOCAL_STORAGE_TEMP_RULES_KEY: "support-assistant-temprules",

			/**
			 * Key for storing selected rules in the local storage.
			 * @readonly
			 */
			LOCAL_STORAGE_SELECTED_RULES_KEY: "support-assistant-selected-rules",

			/**
			 * Key for storing selected context in the local storage.
			 * @readonly
			 */
			LOCAL_STORAGE_SELECTED_CONTEXT_KEY: "support-assistant-settings-selected-context",

			/**
			 * Stores temporary rules in the local storage.
			 * @readonly
			 */
			LOCAL_STORAGE_SELECTED_CONTEXT_COMPONENT_KEY: "support-assistant-settings-selected-context-components",

			/**
			 * Stores the visible column setting
			 * @readonly
			 */
			LOCAL_STORAGE_SELECTED_VISIBLE_COLUMN_KEY: "support-assistant-visible-column-setting",

			/**
			 * Stores selections presets list
			 * @readonly
			 */
			LOCAL_STORAGE_SELECTION_PRESETS_KEY: "support-assistant-selection-presets",

			/**
			 * Stores custom presets list
			 * @readonly
			 */
			LOCAL_STORAGE_CUSTOM_PRESETS_KEY: "support-assistant-custom-presets",

			/**
			 * Tells if the user was already warned that temp rules are disabled
			 * @readonly
			 */
			LOCAL_STORAGE_TEMP_RULES_DISABLED_WARNED: "support-assistant-temp-rules-disabled-warned",

			/**
			 * The name of the persistence cookie.
			 * @readonly
			 */
			COOKIE_NAME: "persistence-cookie",

			/**
			 * Color used for severity high issues
			 * @readonly
			 */
			SUPPORT_ASSISTANT_SEVERITY_HIGH_COLOR: "#bb0000",

			/**
			 * Color used for severity medium issues
			 * @readonly
			 */
			SUPPORT_ASSISTANT_SEVERITY_MEDIUM_COLOR: "#e78c07",

			/**
			 * Color used for severity high issues
			 * @readonly
			 */
			SUPPORT_ASSISTANT_SEVERITY_LOW_COLOR: "#5e696e",

			/**
			 * Low severity of produced issue by Support Assistant
			 * @readonly
			 */
			SUPPORT_ASSISTANT_ISSUE_SEVERITY_LOW: "Low",

			/**
			 * Medium severity of produced issue by Support Assistant
			 * @readonly
			 */
			SUPPORT_ASSISTANT_ISSUE_SEVERITY_MEDIUM: "Medium",

			/**
			 * High severity of produced issue by Support Assistant
			 * @readonly
			 */
			SUPPORT_ASSISTANT_ISSUE_SEVERITY_HIGH: "High",

			/**
			 * Extension added to library.js files of every library that contains support rules
			 * @readonly
			 */
			SUPPORT_ASSISTANT_EXTENSION: "sap.ui.support",

			/**
			 * The maximum number of visible issues for selected rule (in the issues table)
			 * @readonly
			 */
			MAX_VISIBLE_ISSUES_FOR_RULE: 5,

			/**
			 * Copy text for ruleset loading indicator
			 * @readonly
			 */
			RULESET_LOADING: "Loading ruleset files:",

			/**
			 * Initial value of all filters in Support Assistant views
			 * @readonly
			 */
			FILTER_VALUE_ALL: "All",

			/**
			 * Name of file produced by selection export
			 * @readonly
			 */
			RULE_SELECTION_EXPORT_FILE_NAME: "sa-rule-preset",

			HIGHLIGHTER_ID: "ui5-highlighter"
		};


	}, /* bExport= */ true);
