/*!
 * ${copyright}
 */

/**
 * The IssueManager interface stores, groups and converts issues from the Core Object to a usable model by the Support Assistant.
 * Issues can be added only through the IssueManager using <code>addIssue</code> method.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/base/Object"],
	function (jQuery, BaseObject) {
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
			 * Gets history objects with current issues. Each history object has an issues key that contains an array of issues.
			 * @public
			 * @method
			 * @name sap.ui.support.IssueManager.getHistory
			 * @returns {object[]} Current history in the IssueManager.
			 */
			getHistory: function () {
				this.clearIssues();
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
					rulesViewModel;

				rulesViewModel = this.getRulesViewModel(oRules, [], []);
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
							ruleId: issuesModel[libName][rule][0].ruleId,
							selected: issuesModel[libName][rule][0].selected,
							details: issuesModel[libName][rule][0].details,
							severity: issuesModel[libName][rule][0].severity
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
