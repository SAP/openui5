/**
* ${copyright}
*/
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/support/supportRules/IssueManager",
	"sap/ui/support/supportRules/RuleSetLoader"
],
function (jQuery, IssueManager, RuleSetLoader ) {
	"use strict";
	var _aRuns = [];

	var _generateRootLevelKeys = function (oRun) {
		return {
			loadedLibraries: {},
			analysisInfo: {
				duration: oRun.analysisDuration,
				date: oRun.date,
				executionScope: oRun.scope.executionScope
			},
			applicationInfo: oRun.application,
			technicalInfo: oRun.technical,
			totalIssuesCount: 0,
			//This is stored for backward compatibility.
			issues: oRun.onlyIssues
		};
	};

	var _generateLibraryStructure = function (oTmp, sLibraryName, oRun) {

		oTmp.loadedLibraries[sLibraryName] = {};
		var oLibrary = oTmp.loadedLibraries[sLibraryName];

		oLibrary["rules"] = {};
		oLibrary["issueCount"] = oRun.rules[sLibraryName].issueCount;
		oLibrary["allRulesSelected"] = true;

		//This sum the total issues count in root level
		oTmp.totalIssuesCount += oRun.rules[sLibraryName].issueCount;
	};

	var _generateRuleStructure = function (oTmp, sLibraryName, sRuleId, oRun) {
		var oRule = oRun.rules[sLibraryName][sRuleId];

		//Generate specific rule properties
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

		//This controls the selected key on the library level
		//if some of library child rules has not be selected the hole library is
		//marked as selected false
		if (oRule.selected === false) {
			oTmp.loadedLibraries[sLibraryName]["allRulesSelected"] = false;
		}
	};
	/**
	 * Gets all issues reported from specific rule in shorted format - containing
	 * only the necessary details of the issue.
	 * @param oRun
	 * @param sLibraryName
	 * @param sRuleName
	 * @returns {Array}
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
		 * Get the passed runs as array.
		 * @returns {Array}  Returns a copy of passed runs array.
		 */
		getRuns: function () {
			return _aRuns.slice();
		},

		/**
		 * Stores the passed analysis object to an array of passed runs.
		 * @public
		 * @method
		 * @param oContext the context of the analysis
		 * @name sap.ui.support.History.saveAnalysis
		 */
		saveAnalysis: function (oContext) {
			var mIssues = IssueManager.groupIssues(IssueManager.getIssuesModel()),
				aIssues = IssueManager.getIssues(),
				mRules = RuleSetLoader.getRuleSets(),
				mSelectedRules = oContext._oSelectedRulesIds;

			_aRuns.push({
				date: new Date().toUTCString(),
				issues: mIssues,
				onlyIssues: aIssues,
				application: oContext._oDataCollector.getAppInfo(),
				technical: oContext._oDataCollector.getTechInfoJSON(),
				rules: IssueManager.getRulesViewModel(mRules, mSelectedRules, mIssues),
				scope: {
					executionScope: {
						type: oContext._oExecutionScope._getType(),
						selectors: oContext._oExecutionScope._getContext().parentId || oContext._oExecutionScope._getContext().components
					}
				},
				analysisDuration: oContext._oAnalyzer.getElapsedTimeString()
			});
		},

		/**
		 * Clears all stored analysis history objects
		 * @public
		 * @method
		 * @name sap.ui.support.History.clearHistory
		 */
		clearHistory: function () {
			_aRuns = [];
		},

		/**
		 * Gets the all passed analysis in proper json object which can be converted easily in string.
		 * @public
		 * @method
		 * @name sap.ui.support.History.getHistory
		 * @returns {Array} which contains all passed run analysis object in its elements.
		 */
		getHistory: function () {
			var aOutput = [];

			//Loops over each stored run
			_aRuns.forEach(function (oRun) {
				var oTmp = _generateRootLevelKeys(oRun);

				//Loops over each library
				for (var sLibraryName in oRun.rules) {
					_generateLibraryStructure(oTmp, sLibraryName, oRun);

					//Loops over each rule in his library
					for (var sRuleName in oRun.rules[sLibraryName]) {
						_generateRuleStructure(oTmp, sLibraryName, sRuleName, oRun);
					}
				}

				aOutput.push(oTmp);
			});

			return aOutput;
		}
	};

	return History;

}, true);