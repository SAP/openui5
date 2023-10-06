/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/util/deepExtend", "sap/ui/base/Object", "sap/ui/support/library", "sap/ui/support/supportRules/Constants"],
	function (deepExtend, BaseObject, library, constants) {
		"use strict";
		/**
		 * Issues stored in the IssueManager.
		 * @type {object[]}
		 * @private
		 */
		var _aIssues = [];

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
		 *
		 * <h3>Usage</h3>
		 * The IssueManager can be used as a static class and add issues using the <code>addIssue</code> method of both the IssueManager or the IssueManagerFacade.
		 * @private
		 * @alias sap.ui.support.IssueManager
		 */
		var IssueManager = {

			/**
			 * Adds an issue to the list of issues found.
			 * @public
			 * @param {object} oIssue The issue to be added in the IssueManager
			 */
			addIssue: function (oIssue) {
				_aIssues.push(oIssue);
			},
			/**
			 * Cycles through issues stored in the IssueManager and executes the given callback function.
			 * @public
			 * @param {function} fnCallback Callback function to be used in the same fashion as Array.prototype.forEach
			 */
			walkIssues: function (fnCallback) {
				_aIssues.forEach(fnCallback);
			},

			/**
			 * Clears all issues in the IssueManager.
			 * @public
			 * @returns {void}
			 */
			clearIssues: function () {
				_aIssues = [];
			},

			getIssues: function () {
				return _aIssues.slice();
			},
			/**
			 * Converts the issues inside the IssueManager.
			 * @public
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
					rulesCopy = deepExtend({}, rules),
					issuesCopy = deepExtend({}, issues);

				for (group in rulesCopy) {
					rulesViewModel[group] = deepExtend({}, rulesCopy[group].ruleset._mRules);
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
						library[rule] = deepExtend([], library[rule]);

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
			 * @param {object} oRules Deserialized rules found within the current state
			 * @returns {object} TreeTableModel Rules in treeTable usable format
			 * The rules are in a TreeTable format.
			 */
			getTreeTableViewModel: function(oRules) {
				var index = 0,
					treeTableModel = {},
					rulesViewModel,
					rule,
					rules = [];

				rulesViewModel = this.getRulesViewModel(oRules, [], []);
				for (var libraryName in rulesViewModel) {
					treeTableModel[index] = {
						name: libraryName,
						id: libraryName + " " + index,
						selected: true,
						type: "lib",
						nodes: rules
					};

					for (var ruleName in rulesViewModel[libraryName]) {
						rule = rulesViewModel[libraryName][ruleName];
						rules.push({
							name: rule.title,
							description: rule.description,
							id: rule.id,
							audiences: rule.audiences.toString(),
							categories: rule.categories.toString(),
							minversion: rule.minversion,
							resolution: rule.resolution,
							title:  rule.title,
							libName: libraryName,
							selected: true
						});
					}
					rules = [];
					index++;
				}
				return treeTableModel;
			},

			/**
			 * Gets issues in TreeTable format.
			 * @public
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
			 * @returns {string} String containing the formatted name.
			 */
			_getFormattedName: function(oValues) {
				var sHighClass = "",
					sMediumClass = "",
					sLowClass = "";

				if (oValues.highCount > 0) {
					sHighClass = "issueSeverityHigh";
				}

				if (oValues.mediumCount > 0) {
					sMediumClass = "issueSeverityMedium";
				}

				if (oValues.lowCount > 0) {
					sLowClass = "issueSeverityLow";
				}

				return oValues.name +
					" (<span class=\"" + sHighClass + "\"> " + oValues.highCount + " " + oValues.highName + ", </span> " +
					"<span class=\"" + sMediumClass + "\"> " + oValues.mediumCount + " " + oValues.mediumName + ", </span> " +
					"<span class=\"" + sLowClass + "\"> " + oValues.lowCount + " " + oValues.lowName + "</span> )";
			},

			/**
			 * Sorts number of severity issues e.g. 1 High, 0 Medium, 0 Low.
			 * @private
			 * @param {array} aIssues
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
			 * Converts issues to view model format.
			 * @public
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
			 * @param {object} oRule Given rule
			 * @returns {sap.ui.support.IssueManagerFacade} New IssueManagerFacade
			 */
			createIssueManagerFacade: function (oRule) {
				return new IssueManagerFacade(oRule);
			}
		};

		/**
		 * @class
		 * The IssueManagerFacade allows rule developers to add new issues.
		 *
		 * <h3>Usage</h3>
		 * The IssueManagerFacade is passed as first argument to all rule check functions.
		 *
		 * @name sap.ui.support.IssueManagerFacade
		 * @param {object} oRule Rule for the IssueManagerFacade
		 * @hideconstructor
		 * @public
		 */
		var IssueManagerFacade = function (oRule) {
			this.oRule = oRule;
		};

		/**
		 * Adds issue
		 * @alias sap.ui.support.IssueManagerFacade#addIssue
		 * @public
		 * @param {{severity: sap.ui.support.Severity, details: string, context: {id: string}}} oIssue Issue object to be added
		 * @throws {Error} Will throw an error if some of the issue properties are invalid
		 */
		IssueManagerFacade.prototype.addIssue = function (oIssue) {
			oIssue.rule = this.oRule;

			if (!library.Severity[oIssue.severity]) {
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
