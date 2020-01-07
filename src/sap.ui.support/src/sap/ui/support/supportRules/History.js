/**
* ${copyright}
*/
sap.ui.define([
	"sap/ui/support/library",
	"sap/ui/support/supportRules/IssueManager",
	"sap/ui/support/supportRules/RuleSetLoader",
	"sap/ui/support/supportRules/report/StringHistoryFormatter",
	"sap/ui/support/supportRules/report/AbapHistoryFormatter"
],
function (library, IssueManager, RuleSetLoader, StringHistoryFormatter, AbapHistoryFormatter) {
	"use strict";

	/**
	 * Analysis result which is created after analysis with the SupportAssistant.
	 *
	 * @typedef {object} sap.ui.support.AnalysisResult
	 * @property {Object<string,Object>} loadedLibraries The loaded libraries.
	 * @property {Object} analysisInfo Data for the performed analysis.
	 * @property {Object} analysisMetadata The metadata provided in the analyze method, if any.
	 * @property {Object[]} applicationInfo Array with information about the application.
	 * @property {Object[]} technicalInfo Technical information.
	 * @property {number} totalIssuesCount Count of the issues, found in the application.
	 * @property {Object[]} issues Array with all the issues, which were found.
	 * @public
	 */

	var _aRuns = [];

	var _generateRootLevelKeys = function (oRun, sFormat) {
		var oRulePreset = null;
		if (oRun.rulePreset) {
			oRulePreset = {
				id: oRun.rulePreset.id,
				title: oRun.rulePreset.title,
				description: oRun.rulePreset.description,
				dateExported: oRun.rulePreset.dateExported
			};
		}

		// when updating this object also update sap.ui.support.AnalysisResult
		return {
			loadedLibraries: {},
			analysisInfo: {
				duration: oRun.analysisDuration,
				date: oRun.date,
				executionScope: oRun.scope.executionScope,
				rulePreset: oRulePreset
			},
			analysisMetadata: oRun.analysisMetadata,
			applicationInfo: oRun.application,
			technicalInfo: oRun.technical,
			totalIssuesCount: 0,
			// This is stored for backward compatibility.
			issues: oRun.onlyIssues
		};
	};

	var _generateLibraryStructure = function (oTmp, sLibraryName, oRun) {

		oTmp.loadedLibraries[sLibraryName] = {};
		var oLibrary = oTmp.loadedLibraries[sLibraryName];

		oLibrary["rules"] = {};
		oLibrary["issueCount"] = oRun.rules[sLibraryName].issueCount;
		oLibrary["allRulesSelected"] = true;

		// This sum the total issues count in root level.
		oTmp.totalIssuesCount += oRun.rules[sLibraryName].issueCount;
	};

	var _generateRuleStructure = function (oTmp, sLibraryName, sRuleId, oRun) {
		var oRule = oRun.rules[sLibraryName][sRuleId];

		// Generate specific rule properties.
		oTmp.loadedLibraries[sLibraryName]["rules"][sRuleId] = {
			id: sRuleId,
			library: sLibraryName,
			name: oRule.title,
			selected: oRule.selected,
			issuesCount: oRule.issueCount,
			issues: _getIssuesFromRule(oRun, sLibraryName, sRuleId),
			resolution: oRule.resolution,
			minVersion: oRule.minversion,
			categories: oRule.categories,
			audiences: oRule.audiences,
			description: oRule.description
		};

		// This controls the selected key on the library level
		// if some of library child rules has not be selected the hole library is
		// marked as selected false
		if (oRule.selected === false) {
			oTmp.loadedLibraries[sLibraryName]["allRulesSelected"] = false;
		}
	};

	/**
	 * Gets all issues reported from a specific rule in shortened format - containing
	 * only the necessary details of the issue.
	 *
	 * @param {Object} oRun The analysis run
	 * @param {string} sLibraryName The name of the library
	 * @param {string} sRuleName The name of the rule
	 * @returns {Array} All issues from a rule
	 * @private
	 * @method
	 */
	var _getIssuesFromRule = function (oRun, sLibraryName, sRuleName) {
		var aIssues = [];

		if (oRun.issues[sLibraryName] && oRun.issues[sLibraryName][sRuleName]) {
			oRun.issues[sLibraryName][sRuleName].forEach(function (oIssue) {
				var oMinimizedIssue = {
					"context": oIssue.context,
					"details": oIssue.details,
					"name": oIssue.name,
					"severity": oIssue.severity
				};
				aIssues.push(oMinimizedIssue);
			});
		}

		return aIssues;
	};

	var History = {

		/**
		 * Gets the passed runs as an array.
		 *
		 * @returns {Array}  Returns a copy of passed runs array.
		 */
		getRuns: function () {
			return _aRuns.slice();
		},

		/**
		 * Stores the passed analysis object to an array of passed runs.
		 *
		 * @public
		 * @method
		 * @param {Object} oContext the context of the analysis
		 * @name sap.ui.support.History.saveAnalysis
		 */
		saveAnalysis: function (oContext) {
			var mIssues = IssueManager.groupIssues(IssueManager.getIssuesModel()),
				aIssues = IssueManager.getIssues(),
				mRules = RuleSetLoader.getRuleSets(),
				mSelectedRules = oContext._oSelectedRulesIds,
				oSelectedRulePreset = oContext._oSelectedRulePreset;

			_aRuns.push({
				date: new Date().toUTCString(),
				issues: mIssues,
				onlyIssues: aIssues,
				application: oContext._oDataCollector.getAppInfo(),
				technical: oContext._oDataCollector.getTechInfoJSON(),
				rules: IssueManager.getRulesViewModel(mRules, mSelectedRules, mIssues),
				rulePreset: oSelectedRulePreset,
				scope: {
					executionScope: {
						type: oContext._oExecutionScope.getType(),
						selectors: oContext._oExecutionScope._getContext().parentId || oContext._oExecutionScope._getContext().components
					}
				},
				analysisDuration: oContext._oAnalyzer.getElapsedTimeString(),
				analysisMetadata: oContext._oAnalysisMetadata || null
			});
		},

		/**
		 * Clears all stored analysis history objects.
		 *
		 * @public
		 * @method
		 * @name sap.ui.support.History.clearHistory
		 */
		clearHistory: function () {
			_aRuns = [];
		},

		/**
		 * Gets all passed analyses in a JSON object that can easily be converted into a string.
		 *
		 * @public
		 * @method
		 * @name sap.ui.support.History.getHistory
		 * @returns {Array} Which contains all passed run analysis objects.
		 */
		getHistory: function () {
			var aOutput = [];

			_aRuns.forEach(function (oRun) {
				var oTmp = _generateRootLevelKeys(oRun);

				for (var sLibraryName in oRun.rules) {
					_generateLibraryStructure(oTmp, sLibraryName, oRun);

					for (var sRuleName in oRun.rules[sLibraryName]) {
						_generateRuleStructure(oTmp, sLibraryName, sRuleName, oRun);
					}
				}

				aOutput.push(oTmp);
			});

			return aOutput;
		},

		/**
		 * Returns the history into formatted output depending on the passed format.
		 *
		 * @public
		 * @method
		 * @param {string} sFormat The format into which the history object will be converted. Possible values are listed in sap.ui.support.HistoryFormats.
		 * @name sap.ui.support.History.getFormattedHistory
		 * @returns {*} All analysis history objects in the correct format.
		 */
		getFormattedHistory: function (sFormat) {
			var oFormattedHistory,
				aHistory = this.getHistory();

			switch (sFormat) {
				case library.HistoryFormats.Abap:
					oFormattedHistory = AbapHistoryFormatter.format(aHistory);
					break;
				default :
					oFormattedHistory = StringHistoryFormatter.format(aHistory);
			}

			return oFormattedHistory;
		}
	};

	return History;

}, true);