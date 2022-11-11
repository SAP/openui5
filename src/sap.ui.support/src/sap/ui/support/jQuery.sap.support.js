/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/thirdparty/jquery",
		"sap/ui/support/supportRules/Main",
		"sap/ui/support/supportRules/RuleSetLoader"],
	function (jQuery,
			  Main,
			  RuleSetLoader) {
		"use strict";

		jQuery.sap = jQuery.sap || {};

		/**
		 * The <code>jQuery.sap.support</code> namespace is the central entry point for the Support Assistant functionality.
		 *
		 * <h3>Overview</h3>
		 * <code>jQuery.sap.support</code> reveals an API for the Support Assistant which you can easily work with to analyze an application.
		 *
		 * <h3>Usage</h3>
		 *
		 * <ul>
		 * <li> <code>jQuery.sap.support.addRule</code> method allows adding a new rule. </li>
		 * <li> <code>jQuery.sap.support.analyze</code> starts the analysis of the application. </li>
		 * <li> Then the result can be accessed with methods <code>jQuery.sap.support.getAnalysisHistory</code>,
		 * <code>jQuery.sap.support.getLastAnalysisHistory</code> or <code>jQuery.sap.support.getFormattedAnalysisHistory</code>. </li>
		 * </ul>
		 *
		 * For more information, see {@link topic:a34eb58aaf124f538a3ead23a6cab04a Support Assistant API}.
		 *
		 * @namespace
		 * @deprecated Since version 1.60.0. Please use sap/ui/support/RuleAnalyzer instead.
		 * @author SAP SE
		 * @version ${version}
		 * @public
		 */
		jQuery.sap.support = {

			/**
			 * Main method to perform analysis of a given running application.
			 *
			 * Allows to choose a particular execution scope - desired part of the UI
			 * to be checked and a flexible way to specify the list of rules to be used.
			 *
			 * @deprecated Since version 1.60.0. Please use sap/ui/support/RuleAnalyzer instead.
			 * @public
			 * @param {object} [oExecutionScope] The execution scope of the analysis (see {@link topic:e15067d976f24b11907f4c262bd749a0 Execution Scopes}).
			 * @param {string} [oExecutionScope.type = "global"] Possible values are <code>global</code>, <code>subtree</code> or <code>component</code>.
			 * @param {string} [oExecutionScope.parentId] ID of the root element that forms a subtree. Use when the scope is not <code>global</code>.
			 * @param {object|string|object[]} [vPresetOrRules=All rules] This optional parameter allows for selection of subset of rules for the analysis.
			 * You can pass:
			 * <ul>
			 *  <li>A rule preset object containing the preset ID and the list of rules it contains.</li>
			 *  <li>A string that refers to the ID of a system preset.</li>
			 *  <li>An object array with a plain list of rules.</li>
			 * </ul>
			 * @returns {Promise} Notifies the finished state by starting the Analyzer
			 */
			analyze: function (oExecutionScope, vPresetOrRules) {

				if (RuleSetLoader._bRulesCreated) {
					return Main.analyze(oExecutionScope, vPresetOrRules);
				}

				return RuleSetLoader._oMainPromise.then(function () {
					return Main.analyze(oExecutionScope, vPresetOrRules);
				});
			},

			/**
			 * Returns the result of the last analysis performed.
			 * @deprecated Since version 1.60.0. Please use sap/ui/support/RuleAnalyzer instead.
			 * @public
			 * @returns {Object} Last analysis history.
			 */
			getLastAnalysisHistory: function () {
				return Main.getLastAnalysisHistory();
			},

			/**
			 * Returns the history of all executed analyses.
			 *
			 * @deprecated Since version 1.60.0. Please use sap/ui/support/RuleAnalyzer instead.
			 * @public
			 * @returns {Object[]} Array of history objects in the order of analyses performed. The results of the last analysis are contained in the last element in the array.
			 */
			getAnalysisHistory: function () {
				return Main.getAnalysisHistory();
			},

			/**
			 * Returns the history of all executed analyses into formatted output depending on the passed format.
			 *
			 * @deprecated Since version 1.60.0. Please use sap/ui/support/RuleAnalyzer instead.
			 * @public
			 * @param {sap.ui.support.HistoryFormats} [sFormat=sap.ui.support.HistoryFormats.String] The format into which the history object will be converted. Possible values are listed in sap.ui.support.HistoryFormats.
			 * @returns {*} All analysis history objects in the correct format.
			 */
			getFormattedAnalysisHistory: function (sFormat) {
				return Main.getFormattedAnalysisHistory(sFormat);
			},

			 /**
			 * Adds new temporary rule when in silent mode
			 *
			 * @deprecated Since version 1.60.0. Please use sap/ui/support/RuleAnalyzer instead.
			 * @public
			 * @since 1.60
			 * @param {Object} oRule Settings for the new rule. For detailed information about its properties see {@link topic:eaeea19a991d46f29e6d8d8827317d0e Rule Property Values}
			 * @returns {string} Rule creation status. Possible values are "success" or description of why adding failed.
			 */
			addRule: function (oRule) {
				return Main.addRule(oRule);
			}
		};

		return jQuery.sap.support;
	});