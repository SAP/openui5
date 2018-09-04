/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/support/library", "sap/ui/support/supportRules/Main"],
	function (library, Main) {
		"use strict";

		/**
		 * @namespace
		 * @alias jQuery.sap.support
		 * @author SAP SE
		 * @version ${version}
		 * @public
		 */
		jQuery.sap.support = {

			/**
			 * Analyzes all rules in the given execution scope.
			 *
			 * @memberof jQuery.sap.support
			 * @public
			 * @param {Object} oExecutionScope The execution scope of the analysis with the type of the scope
			 * @param {object|string|object[]} [vPresetOrRules=All rules] The preset or system preset ID or rules against which the analysis will be run
			 * @returns {Promise} Notifies the finished state by starting the Analyzer
			 */
			analyze: function (oExecutionScope, vPresetOrRules) {
				return Main.analyze(oExecutionScope, vPresetOrRules);
			},

			/**
			 * Gets last analysis history.
			 * @memberof jQuery.sap.support
			 * @public
			 * @returns {Object} Last analysis history.
			 */
			getLastAnalysisHistory: function () {
				return Main.getLastAnalysisHistory();
			},

			/**
			 * Gets history.
			 *
			 * @memberof jQuery.sap.support
			 * @public
			 * @returns {Object[]} Current history.
			 */
			getAnalysisHistory: function () {
				return Main.getAnalysisHistory();
			},

			/**
			 * Returns the history into formatted output depending on the passed format.
			 *
			 * @memberof jQuery.sap.support
			 * @public
			 * @param {sap.ui.support.HistoryFormats} [sFormat=sap.ui.support.HistoryFormats.String] The format into which the history object will be converted. Possible values are listed in sap.ui.support.HistoryFormats.
			 * @returns {*} All analysis history objects in the correct format.
			 */
			getFormattedAnalysisHistory: function (sFormat) {
				return Main.getFormattedAnalysisHistory(sFormat);
			}
		};

		return jQuery.sap.support;
	});