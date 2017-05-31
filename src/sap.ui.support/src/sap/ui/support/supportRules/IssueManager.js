/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.global", "sap/ui/base/Object"],
	function (jQuery, BaseObject) {
		"use strict";

		var _aIssues = [];
		var _aHistory = [];
		var _convertIssueToViewModel = function (issue) {
			var element = sap.ui.getCore().byId(issue.context.id),
				className = "";

			if (issue.context.id === "WEBPAGE") {
				className = "sap.ui.core";
			} else if (element) {
				className = element.getMetadata().getName();
			}

			return {
				severity: issue.severity,
				name: issue.rule.title,
				description: issue.rule.description,
				resolution: issue.rule.resolution,
				resolutionUrls: issue.rule.resolutionurls,
				audiences: issue.rule.audiences,
				categories: issue.rule.categories,
				details: issue.details,
				ruleLibName: issue.rule.libName,
				ruleId: issue.rule.id,
				context: {
					className: className,
					id: issue.context.id
				}
			};
		};

		var IssueManager = {

			/**
			 * Adds an issue to the list of issues found
			 * @param {object} oIssue
			 */
			addIssue: function (oIssue) {
				_aIssues.push(oIssue);
			},
			/**
			 * @param {function} fnCb Callback function to be used in the same
			 * fashion as Array.prototype.forEach
			 */
			walkIssues: function (fnCb) {
				_aIssues.forEach(fnCb);
			},
			clearIssues: function () {
				// Return if no issues
				if (!_aIssues.length) {
					return;
				}

				// Add to history. Using object for future compatibility
				_aHistory.push({
					// Copy array
					issues: _aIssues.slice()
				});

				// Reset issues array
				_aIssues = [];

			},
			/**
			 * @returns {array} Issue history - array of objects.
			 * Each history object has an issues key that contains an array of
			 * issues
			 */
			getHistory: function () {
				this.clearIssues();
				// Copy and return history
				return _aHistory.slice();
			},
			/**
			 * @returns {array} Issue history - array of objects.
			 * Each history object has an issues key that contains the issues grouped
			 * by library and rule in ViewModel format
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
			 * @returns {array} Issues in ViewModel format
			 * Converts the issues inside the IssueManager
			 */
			getIssuesModel: function () {
				var viewModel = [];
				this.walkIssues(function (issue) {
					viewModel.push(_convertIssueToViewModel(issue));
				});
				return viewModel;
			},
			/**
			 * @returns {object} All the rules with issues, selected flag and issueCount properties
			 * The issues are in ViewModel format
			 * @param {object} rules All the rules from _mRulesets
			 * @param {array} issues The issues to map to the rulesViewModel.
			 * The issues passes should be grouped and in ViewModel format
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
			 * The rules are in TreeTable format
			 * @returns {object} All the rules in TreeTable usable model
			 * @param {object} TreeTableModel All the rules in treeTable usable format.
			 */
			getTreeTableViewModel: function(rules) {
				var index = 0,
					innerIndex = 0,
					treeTableModel = {},
					rulesViewModel;

				rulesViewModel = this.getRulesViewModel(rules, [], []);
				for (var libraryName in rulesViewModel) {
					treeTableModel[index] = {
						name: libraryName,
						type: "lib",
						rules: []
					};

					for (var ruleName in rulesViewModel[libraryName]) {
						treeTableModel[index][innerIndex] = {
							name: rulesViewModel[libraryName][ruleName].title,
							description: rulesViewModel[libraryName][ruleName].description,
							id: rulesViewModel[libraryName][ruleName].id,
							audiences: rulesViewModel[libraryName][ruleName].audiences,
							categories: rulesViewModel[libraryName][ruleName].categories,
							minversion: rulesViewModel[libraryName][ruleName].minversion,
							resolution: rulesViewModel[libraryName][ruleName].resolution,
							title:  rulesViewModel[libraryName][ruleName].title,
							libName: libraryName
						};
						innerIndex++;
					}
					index++;
				}
				return treeTableModel;
			},

			/**
			 * The issues are in TreeTable format
			 * @returns {object} All the issues in TreeTable usable model
			 * @param {object} issuesModel All the issues after they have been grouped by groupIssues().
			 */
			getIssuesViewModel: function(issuesModel) {

				var treeTableModel = {},
					index = 0,
					innerIndex = 0,
					issueCount = 0;

				for (var libName in issuesModel) {
					treeTableModel[index] = {
						name: libName,
						showAudiences: false,
						showCategories: false,
						type: "lib"
					};

					for (var rule in issuesModel[libName]) {
						treeTableModel[index][innerIndex] = {
							name: issuesModel[libName][rule][0].name + " (" + issuesModel[libName][rule].length + " issues)",
							showAudiences: true,
							showCategories: true,
							categories: issuesModel[libName][rule][0].categories.join(", "),
							audiences: issuesModel[libName][rule][0].audiences.join(", "),
							issueCount: issuesModel[libName][rule].length,
							description: issuesModel[libName][rule][0].description,
							resolution: issuesModel[libName][rule][0].resolution,
							type: "rule",
							ruleLibName: issuesModel[libName][rule][0].ruleLibName,
							ruleId: issuesModel[libName][rule][0].ruleId
						};

						issueCount += issuesModel[libName][rule].length;
						innerIndex++;
					}

					treeTableModel[index].name += " (" + issueCount + " issues)";
					treeTableModel[index].issueCount = issueCount;
					issueCount = 0;
					innerIndex = 0;
					index++;
				}

				return treeTableModel;
			},
			clearHistory: function () {
				_aHistory = [];
			},
			/**
			 * @returns {array} Issues in ViewModel format
			 * @param {array} The issues to convert
			 * Converts issues to ViewModel format
			 */
			convertToViewModel: function (issues) {
				var viewModel = [];
				for (var i = 0; i < issues.length; i++) {
					viewModel.push(_convertIssueToViewModel(issues[i]));
				}
				return viewModel;
			},
			/**
			 * @returns {array} Grouped issues
			 * @param {array} issues The issues to group. Must be in ViewModel format
			 * Groups issues by library and rule
			 */
			groupIssues: function (issues) {
				var groupedIssues = {},
					issue = {};

				for (var i = 0; i < issues.length; i++) {
					issue = issues[i];

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
			createIssueManagerFacade: function (oRule) {
				return new IssueManagerFacade(oRule);
			}
		};

		var IssueManagerFacade = function (oRule) {
			this.oRule = oRule;
		};

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
