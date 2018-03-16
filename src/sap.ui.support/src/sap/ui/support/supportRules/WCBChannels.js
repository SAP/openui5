/*!
 * ${copyright}
 */

sap.ui.define([
],
function () {
	"use strict";

	/**
	 * <h3>Overview</h3>
	 * These channels enable the user to hook to the {@link sap.ui.support.WindowCommunicationBus }
	 * <h3>Usage</h3>
	 * These channels are used for communication with Main.
	 * @name sap.ui.support.WCBChannels
	 * @alias CommunicationBusChannels
	 * @readonly
	 * @protected
	 * @returns {Object} Returns the channel constants which are used to subscribe to sap.ui.support.WindowCommunicationBus
	 */
	return {
		/**
		 * @enum
		 * @readonly
		 * The following channels can subscribe to the WindowCommunicationBus
		 */

		/**
		 * State change in the core.
		 * @type {string}
		 * @const
		 */
		ON_CORE_STATE_CHANGE:       "ON_CORE_STATE_CHANGE",

		/**
		 * Shows a report.
		 * @type {string}
		 * @const
		 */
		ON_SHOW_REPORT_REQUEST:     "ON_SHOW_REPORT_REQUEST",

		/**
		 * Downloads a report.
		 * @type {string}
		 * @const
		 */
		ON_DOWNLOAD_REPORT_REQUEST: "ON_DOWNLOAD_REPORT_REQUEST",

		/**
		 * Starts an analysis.
		 * @type {string}
		 * @const
		 */
		ON_ANALYZE_REQUEST:         "ON_ANALYZE_REQUEST",

		/**
		 * Notifies when the rulesets have to be loaded.
		 * @type {string}
		 * @const
		 */
		ON_INIT_ANALYSIS_CTRL:      "ON_INIT_ANALYSIS_CTRL",

		/**
		 * Provides the current progress status of the analysis.
		 * @type {string}
		 * @const
		 */
		ON_PROGRESS_UPDATE:         "ON_PROGRESS_UPDATE",

		/**
		 * Notifies that the analysis has started.
		 * @type {string}
		 * @const
		 */
		ON_ANALYZE_STARTED:          "ON_ANALYZE_STARTED",

		/**
		 * Notifies after the analysis has finished.
		 * @type {string}
		 * @const
		 */
		ON_ANALYZE_FINISH:          "ON_ANALYZE_FINISH",

		/**
		 * Posts information about the UI and it's iframe.
		 * @type {string}
		 * @const
		 */
		POST_UI_INFORMATION:  "POST_UI_INFORMATION",

		/**
		 * Verifies rule creation.
		 * @type {string}
		 * @const
		 */
		VERIFY_CREATE_RULE:         "VERIFY_CREATE_RULE",

		/**
		 * Verifies rule creation after its finished.
		 * @type {string}
		 * @const
		 */
		VERIFY_RULE_CREATE_RESULT:  "VERIFY_RULE_CREATE_RESULT",

		/**
		 * Verifies rule update.
		 * @type {string}
		 * @const
		 */
		VERIFY_UPDATE_RULE:         "VERIFY_UPDATE_RULE",

		/**
		 * Verifies rule update after its finished.
		 * @type {string}
		 * @const
		 */
		VERIFY_RULE_UPDATE_RESULT:  "VERIFY_RULE_UPDATE_RESULT",

		/**
		 * Posts available libraries.
		 * @type {string}
		 * @const
		 */
		POST_AVAILABLE_LIBRARIES:    "POST_AVAILABLE_LIBRARIES",

		/**
		 * Loads all rule sets.
		 * @type {string}
		 * @const
		 */
		LOAD_RULESETS:               "LOAD_RULESETS",

		/**
		 * Gets components.
		 * @type {string}
		 * @const
		 */
		GET_AVAILABLE_COMPONENTS:   "GET_AVAILABLE_COMPONENTS",

		/**
		 * Posts components.
		 * @type {string}
		 * @const
		 */
		POST_AVAILABLE_COMPONENTS:  "POST_AVAILABLE_COMPONENTS",

		/**
		 * Highlight element in TreeTable.
		 * @type {string}
		 * @const
		 */
		HIGHLIGHT_ELEMENT:          "HIGHLIGHT_ELEMENT",

		/**
		 * Open given URL.
		 * @type {string}
		 * @const
		 */
		OPEN_URL:                   "OPEN_URL",

		/**
		 * Notifies onmouseenter event on the TreeTable.
		 * @type {string}
		 * @const
		 */
		TREE_ELEMENT_MOUSE_ENTER:   "TREE_ELEMENT_MOUSE_ENTER",

		/**
		 * Notifies onmouseout event on the TreeTable.
		 * @type {string}
		 * @const
		 */
		TREE_ELEMENT_MOUSE_OUT:     "TREE_ELEMENT_MOUSE_OUT",

		/**
		 * Updates support rules in IssueManager.
		 * @type {string}
		 * @const
		 */
		UPDATE_SUPPORT_RULES:       "UPDATE_SUPPORT_RULES",

		/**
		 * Upload external modules.
		 * @type {string}
		 * @const
		 */
		EXTERNAL_MODULE_UPLOADED:   "EXTERNAL_MODULE_UPLOADED",

		/**
		 * Hides SupportAssistant iframe.
		 * @type {string}
		 * @const
		 */
		TOGGLE_FRAME_HIDDEN:        "TOGGLE_FRAME_HIDDEN",

		/**
		 * Ensure SupportAssistant iframe is open.
		 * @type {string}
		 * @const
		 */
		ENSURE_FRAME_OPENED:        "ENSURE_FRAME_OPENED",

		/**
		 * Resize SupportAssistant iframe.
		 * @type {string}
		 * @const
		 */
		RESIZE_FRAME:               "RESIZE_FRAME",

		/**
		 * Request rules model.
		 * @type {string}
		 * @const
		 */
		REQUEST_RULES_MODEL:        "REQUEST_RULES_MODEL",

		/**
		 * Get rules model.
		 * @type {string}
		 * @const
		 */
		GET_RULES_MODEL:            "GET_RULES_MODEL",

		/**
		 * Request issues.
		 * @type {string}
		 * @const
		 */
		REQUEST_ISSUES:             "REQUEST_ISSUES",

		/**
		 * Gets the issues.
		 * @type {string}
		 * @const
		 */
		GET_ISSUES:                 "GET_ISSUES",

		/**
		 * Posts a message.
		 * @type {string}
		 * @const
		 */
		POST_MESSAGE:               "POST_MESSAGE",

		/**
		 * Get non loaded libraries with rules names
		 * @type {string}
		 * @const
		 */
		GET_NON_LOADED_RULE_SETS:   "GET_NON_LOADED_RULE_SETS",

		/**
		 * Progress of current loading process
		 * @type {string}
		 * @const
		 */
		CURRENT_LOADING_PROGRESS:   "CURRENT_LOADING_PROGRESS"
	};
}, true);
