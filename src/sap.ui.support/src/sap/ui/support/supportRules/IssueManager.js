/*!
 * ${copyright}
 */

/**
 * The IssueManager interface stores, groups and converts issues from the Core Object to a usable model by the Support Assistant.
 * Issues can be added only through the IssueManager using <code>addIssue</code> method.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/base/Object", "sap/ui/support/supportRules/Constants"],
	function (jQuery, BaseObject, constants) {
		"use strict";
		/**
		 * @type {object[]} _aIssues Issues stored in the IssueManager
		 * @private
		 */
		var _aIssues = [];

		/**
		 * @type {object[]} _aHistory Array of history objects which contain issues key that has an array of issues.
		 * @private
		 */
		var _aHistory = [];

		/**
		 * Converts Issue Object to a ViewModel that can be used by the IssueManager.
		 * @param {object} oIssue Issue Object that is to be converted
		 * @returns {object} Converted Issue Object
		 */
		var _convertIssueToViewModel = function (oIssue) {
			var element = sap.ui.getCore().byId(oIssue.context.id),
				className = "";

			if (oIssue.context.id === "WEBPAGE") {
				className = "sap.ui.core";
			} else if (element) {
				className = element.getMetadata().getName();
			}

			return {
				severity: oIssue.severity,
				name: oIssue.rule.title,
				description: oIssue.rule.description,
				resolution: oIssue.rule.resolution,
				resolutionUrls: oIssue.rule.resolutionurls,
				audiences: oIssue.rule.audiences,
				categories: oIssue.rule.categories,
				details: oIssue.details,
				ruleLibName: oIssue.rule.libName,
				ruleId: oIssue.rule.id,
				async: oIssue.rule.async === true, // Ensure async is either true or false
				minVersion: oIssue.rule.minversion,
				context: {
					className: className,
					id: oIssue.context.id
				}
			};
		};

		/**
		 * @class
		 * The IssueManager is used to store and export issues to the Support Assistant.
		 * <h3>Overview</h3>
		 * The IssueManager is used to store and export issues found by the Support Assistant.
		 * <h3>Usage</h3>
		 * The IssueManager can be used as a static class and add issues using the <code>addIssue</code> method of both the IssueManager or the IssueManagerFacade.
		 * @public
		 * @name sap.ui.support.IssueManager
		 * @alias IssueManager
		 *
		 * @lends IssueManager
		 */
		var IssueManager = {


			/**
			 * Adds an issue to the list of issues found.
			 * @public
			 * @method
			 * @name sap.ui.support.IssueManager.addIssue
			 * @param {object} oIssue The issue to be added in the IssueManager
			 */
			addIssue: function (oIssue) {
				_aIssues.push(oIssue);
			},
			/**
			 * Cycles through issues stored in the IssueManager and executes the given callback function.
			 * @public
			 * @method
			 * @name sap.ui.support.IssueManager.walkIssues
			 * @param {function} fnCallback Callback function to be used in the same fashion as Array.prototype.forEach
			 */
			walkIssues: function (fnCallback) {
				_aIssues.forEach(fnCallback);
			},

			/**
			 * Clears all issues in the IssueManager.
			 * @public
			 * @method
			 * @name sap.ui.support.IssueManager.clearIssues
			 * @returns {void}
			 */
			clearIssues: function () {
				_aIssues = [];
			},

			/**
			 * Saves a new history object with the current issues.
			 * @public
			 * @method
			 * @name sap.ui.support.IssueManager.saveHistory
			 * @returns {void}
			 */
			saveHistory: function () {
				_aHistory.push({
					issues: _aIssues.slice()
				});
			},

			/**
			 * Gets history objects with current issues. Each history object has an issues key that contains an array of issues.
			 * @public
			 * @method
			 * @name sap.ui.support.IssueManager.getHistory
			 * @returns {object[]} Current history in the IssueManager.
			 */
			getHistory: function () {
				// Copy and return history
				return _aHistory.slice();
			},

			/**
			 * Gets grouped history containing <code>ViewModel</code>. Each history object has an issues key that contains the issues grouped by library and rule in ViewModel format.
			 * @public
			 * @method
			 * @name sap.ui.support.IssueManager.getConvertedHistory
			 * @returns {object[]} convertedHistory Grouped issue history object containing converted issues to ViewModel format.
			 */
			getConvertedHistory: function () {
				var that = this,
					issueHistory = that.getHistory(),
					convertedHistory = [],
					issues = null;

				issueHistory.forEach(function (run) {
					issues = that.groupIssues(
						that.convertToViewModel(run.issues)
					);
					convertedHistory.push({ issues: issues });
				});

				return convertedHistory;
			},

			/**
			 * Converts the issues inside the IssueManager.
			 * @public
			 * @method
			 * @name sap.ui.support.IssueManager.getIssuesModel
			 * @returns {object[]} viewModel Issues in ViewModel format
			 */
			getIssuesModel: function () {
				var aViewModel = [];

				this.walkIssues(function (issue) {
					aViewModel.push(_convertIssueToViewModel(issue));
				});

				return aViewModel;
			},

			/**
			 * Gets rules and issues, and converts each rule to a ruleViewModel - parameters should be converted as specified beforehand.
			 * @public
			 * @method
			 * @name sap.ui.support.IssueManager.getRulesViewModel
			 * @param {object} rules All the rules from _mRulesets
			 * @param {array} selectedRulesIDs The rule ID's of the selected rules.
			 * @param {array} issues The issues to map to the rulesViewModel
			 * The issues passes should be grouped and in ViewModel format.
			 * @returns {object} rulesViewModel All the rules with issues, selected flag and issueCount properties
			 * The issues are in ViewModel format.
			 */
			getRulesViewModel: function (rules, selectedRulesIDs, issues) {
				var rulesViewModel = {},
					issueCount = 0,
					group = {},
					library = {},
					rule = {},
					rulesCopy = jQuery.extend(true, {}, rules),
					issuesCopy = jQuery.extend(true, {}, issues);

				for (group in rulesCopy) {
					rulesViewModel[group] = jQuery.extend(true, {}, rulesCopy[group].ruleset._mRules);
					library = rulesViewModel[group];

					// Create non-enumerable properties
					Object.defineProperty(library, 'selected', {
						enumerable: false,
						configurable: true,
						writable: true,
						value: false
					});
					Object.defineProperty(library, 'issueCount', {
						enumerable: false,
						configurable: true,
						writable: true,
						value: 0
					});

					for (rule in rulesCopy[group].ruleset._mRules) {
						library[rule] = jQuery.extend(true, [], library[rule]);

						// Create non-enumerable properties
						Object.defineProperty(library[rule], 'selected', {
							enumerable: false,
							configurable: true,
							writable: true,
							value: false
						});
						Object.defineProperty(library[rule], 'issueCount', {
							enumerable: false,
							configurable: true,
							writable: true,
							value: 0
						});

						// Add selected flag to library and rule level.
						if (selectedRulesIDs[rule]) {
							library[rule].selected = true;
							library.selected = true;
						}

						// Add issue count to library and rule level.
						if (issuesCopy[group] && issuesCopy[group][rule]) {
							// Not creating a new array to keep the properties.
							library[rule].push.apply(library[rule], issuesCopy[group][rule]);
							issueCount = issuesCopy[group][rule].length;
							library[rule].issueCount = issueCount;
							library.issueCount += issueCount;
						}
					}
				}

				return rulesViewModel;
			},

			/**
			 * Gets rules and converts them into treeTable format.
			 * @public
			 * @method
			 * @name sap.ui.support.IssueManager.getTreeTableViewModel
			 * @param {object} oRules Deserialized rules found within the current state
			 * @returns {object} TreeTableModel Rules in treeTable usable format
			 * The rules are in a TreeTable format.
			 */
			getTreeTableViewModel: function(oRules) {
				var index = 0,
					innerIndex = 0,
					treeTableModel = {},
					rulesViewModel,
					rule;

				rulesViewModel = this.getRulesViewModel(oRules, [], []);
				for (var libraryName in rulesViewModel) {
					treeTableModel[index] = {
						name: libraryName,
						type: "lib",
						rules: []
					};

					for (var ruleName in rulesViewModel[libraryName]) {
						rule = rulesViewModel[libraryName][ruleName];
						treeTableModel[index][innerIndex] = {
							name: rule.title,
							description: rule.description,
							id: rule.id,
							audiences: rule.audiences,
							categories: rule.categories,
							minversion: rule.minversion,
							resolution: rule.resolution,
							title:  rule.title,
							libName: libraryName
						};
						innerIndex++;
					}
					index++;
				}
				return treeTableModel;
			},

			/**
			 * Gets issues in TreeTable format.
			 * @public
			 * @method
			 * @name sap.ui.support.IssueManager.getIssuesViewModel
			 * @param {object} issuesModel All the issues after they have been grouped with <code>groupIssues</code>
			 * @returns {object} All the issues in TreeTable usable model
			 */
			getIssuesViewModel: function(issuesModel) {

				var treeTableModel = {},
					index = 0,
					innerIndex = 0,
					issueCount = 0,
					oSortedSeverityCount,
					iHighSeverityCount = 0,
					iMediumSeverityCount = 0,
					iLowSeverityCount = 0;

				for (var libName in issuesModel) {
					treeTableModel[index] = {
						name: libName,
						showAudiences: false,
						showCategories: false,
						type: "lib"
					};

					for (var rule in issuesModel[libName]) {

						oSortedSeverityCount = this._sortSeverityIssuesByPriority(issuesModel[libName][rule]);
						treeTableModel[index][innerIndex] = {
							formattedName: this._getFormattedName({
								name: issuesModel[libName][rule][0].name,
								highCount: oSortedSeverityCount.high,
								mediumCount: oSortedSeverityCount.medium,
								lowCount: oSortedSeverityCount.low,
								highName: 'H',
								mediumName: 'M',
								lowName: 'L'}),
							name: issuesModel[libName][rule][0].name,
							showAudiences: true,
							showCategories: true,
							categories: issuesModel[libName][rule][0].categories.join(", "),
							audiences: issuesModel[libName][rule][0].audiences.join(", "),
							issueCount: issuesModel[libName][rule].length,
							description: issuesModel[libName][rule][0].description,
							resolution: issuesModel[libName][rule][0].resolution,
							type: "rule",
							ruleLibName: issuesModel[libName][rule][0].ruleLibName,
							ruleId: issuesModel[libName][rule][0].ruleId,
							selected: issuesModel[libName][rule][0].selected,
							details: issuesModel[libName][rule][0].details,
							severity: issuesModel[libName][rule][0].severity
						};


						issueCount += issuesModel[libName][rule].length;
						innerIndex++;
						iHighSeverityCount  += oSortedSeverityCount.high;
						iMediumSeverityCount += oSortedSeverityCount.medium;
						iLowSeverityCount += oSortedSeverityCount.low;
					}


					treeTableModel[index].formattedName = this._getFormattedName({
						name: treeTableModel[index].name,
						highCount: iHighSeverityCount,
						mediumCount: iMediumSeverityCount,
						lowCount: iLowSeverityCount,
						highName: 'High',
						mediumName: 'Medium',
						lowName: 'Low'
					});
					treeTableModel[index].name += " (" + issueCount + " issues)";
					treeTableModel[index].issueCount = issueCount;
					issueCount = 0;
					innerIndex = 0;
					index++;
					iHighSeverityCount = 0;
					iMediumSeverityCount = 0;
					iLowSeverityCount = 0;
				}

				return treeTableModel;
			},

			/**
			 * Builds a string containing the formatted name e.g. (1 H, 0 M, 0 L ).
			 * @private
			 * @param {object} oValues
			 * @name sap.ui.support.IssueManager._getFormattedName
			 * @returns {string} String containing the formatted name.
			 */
			_getFormattedName: function(oValues) {
				var sHighColor = "",
					sMediumColor = "",
					sLowColor = "";

				if (oValues.highCount > 0) {
					sHighColor = "color: " + constants.SUPPORT_ASSISTANT_SEVERITY_HIGH_COLOR + ";";
				}

				if (oValues.mediumCount > 0) {
					sMediumColor = "color: " + constants.SUPPORT_ASSISTANT_SEVERITY_MEDIUM_COLOR + ";";
				}

				if (oValues.lowCount > 0) {
					sLowColor = "color: " + constants.SUPPORT_ASSISTANT_SEVERITY_LOW_COLOR + ";";
				}

				return oValues.name +
					" (<span style=\"" + sHighColor + "\"> " + oValues.highCount + " " + oValues.highName + ", </span> " +
					"<span style=\"" + sMediumColor + "\"> " + oValues.mediumCount + " " + oValues.mediumName + ", </span> " +
					"<span style=\"" + sLowColor + "\"> " + oValues.lowCount + " " + oValues.lowName + "</span> )";
			},

			/**
			 * Sorts number of severity issues e.g. 1 High, 0 Medium, 0 Low.
			 * @private
			 * @param {array} aIssues
			 * @name sap.ui.support.IssueManager._sortSeverityIssuesByPriority
			 * @returns {object} Object containing the number of issues sorted by severity.
			 */
			_sortSeverityIssuesByPriority: function(aIssues) {
				var iHighIssues = 0,
					iMediumIssues = 0,
					iLowIssues = 0;
				aIssues.forEach(function(element) {
					switch (element.severity) {
						case constants.SUPPORT_ASSISTANT_ISSUE_SEVERITY_LOW:
							iLowIssues++;
							break;
						case constants.SUPPORT_ASSISTANT_ISSUE_SEVERITY_MEDIUM:
							iMediumIssues++;
							break;
						case constants.SUPPORT_ASSISTANT_ISSUE_SEVERITY_HIGH:
							iHighIssues++;
							break;
					}
				});

				return {high: iHighIssues, medium: iMediumIssues, low: iLowIssues};
			},

			/**
			 * Clears the history object within the IssueManager.
			 * @public
			 * @method
			 * @name sap.ui.support.IssueManager.clearHistory
			 * @returns {void}
			 */
			clearHistory: function () {
				_aHistory = [];
			},

			/**
			 * Converts issues to view model format.
			 * @public
			 * @method
			 * @name sap.ui.support.IssueManager.convertToViewModel
			 * @param {array} oIssues The issues to convert
			 * @returns {array} viewModel Issues in ViewModel format
			 */
			convertToViewModel: function (oIssues) {
				var viewModel = [];
				for (var i = 0; i < oIssues.length; i++) {
					viewModel.push(_convertIssueToViewModel(oIssues[i]));
				}
				return viewModel;
			},

			/**
			 * Groups all issues by library and rule ID.
			 * @public
			 * @method
			 * @name sap.ui.support.IssueManager.groupIssues
			 * @param {array} oIssues The issues to group. Must be in a ViewModel format
			 * @returns {array} groupedIssues Grouped issues by library and rule id
			 */
			groupIssues: function (oIssues) {
				var groupedIssues = {},
					issue = {};

				for (var i = 0; i < oIssues.length; i++) {
					issue = oIssues[i];

					if (!groupedIssues[issue.ruleLibName]) {
						groupedIssues[issue.ruleLibName] = {};
					}

					if (!groupedIssues[issue.ruleLibName][issue.ruleId]) {
						groupedIssues[issue.ruleLibName][issue.ruleId] = [];
					}

					groupedIssues[issue.ruleLibName][issue.ruleId].push(issue);
				}

				return groupedIssues;
			},

			/**
			 * Creates an instance of the IssueManagerFacade.
			 * @public
			 * @method
			 * @name sap.ui.support.IssueManager.createIssueManagerFacade
			 * @param {object} oRule Given rule
			 * @returns {object} New IssueManagerFacade
			 */
			createIssueManagerFacade: function (oRule) {
				return new IssueManagerFacade(oRule);
			}
		};

		/**
		 * Creates an IssueManagerFacade.
		 * @constructor
		 * @private
		 * @method
		 * @namespace
		 * @name sap.ui.support.IssueManagerFacade
		 * @param {object} oRule Rule for the IssueManagerFacade
		 * @returns {void}
		 */
		var IssueManagerFacade = function (oRule) {
			this.oRule = oRule;
		};

		/**
		 * Adds issue to the IssueManager via the IssueManagerFacade.
		 * @public
		 * @method
		 * @memberof IssueManagerFacade
		 * @param {object} oIssue Issue object to be added in the IssueManager
		 * @returns {void}
		 */
		IssueManagerFacade.prototype.addIssue = function (oIssue) {
			oIssue.rule = this.oRule;

			if (!sap.ui.support.Severity[oIssue.severity]) {
				throw "The issue from rule " + this.oRule.title + " does not have proper severity defined. Allowed values can be found" +
						"in sap.ui.support.Severity";
			}

			if (!oIssue.context || !oIssue.context.id) {
				throw "The issue from rule '" + this.oRule.title + "' should provide a context id.";
			}

			if (!oIssue.details) {
				throw "The issue from rule '" + this.oRule.title + "' should provide details for the generated issue.";
			}

			IssueManager.addIssue(oIssue);
		};

		return IssueManager;

	}, true);
