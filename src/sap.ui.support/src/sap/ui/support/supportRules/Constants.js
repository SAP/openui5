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
			TEMP_RULESETS_NAME: "temporary",
			SUPPORT_ASSISTANT_NAME: "Support Assistant",
			LOCAL_STORAGE_TEMP_RULES_KEY: "support-assistant-temprules",
			LOCAL_STORAGE_SELECTED_RULES_KEY: "support-assistant-selected-rules",
			LOCAL_STORAGE_SELECTED_CONTEXT_KEY: "support-assistant-settings-selected-context",
			LOCAL_STORAGE_SELECTED_CONTEXT_COMPONENT_KEY: "support-assistant-settings-selected-context-components",
			COOKIE_NAME: "persistence-cookie"
		};


	}, /* bExport= */ true);
