/*!
 * ${copyright}
 */

sap.ui.define([
	'jquery.sap.global',
	'sap/ui/base/Object'
], function(jQuery, Ui5Object) {
	"use strict";

	var Extension = Ui5Object.extend("sap.ui.core.support.RuleEngineOpaExtension", {
		metadata : {
			publicMethods : [
				"getAssertions"
			]
		},

		/**
		 * When the application under test is started in a UIComponent container instead of an iframe
		 * the Support Assistant is not loaded because the application doesn't start a separate instance of the Core
		 * to start in Support Mode. In such cases manually start the Support Assistant in the current instance of the Core.
		 *
		 * @returns {jQuery.promise} A promise that gets resolved when the Support Assistant is ready.
		 */
		onAfterInit : function () {
			var bLoaded = sap.ui.getCore().getLoadedLibraries()["sap.ui.support"],
				deferred = jQuery.Deferred();

			if (!bLoaded) {
				sap.ui.require(["sap/ui/support/Bootstrap"], function (bootstrap) {
					bootstrap.initSupportRules(["true", "silent"], {
						onReady: function () {
							deferred.resolve();
						}
					});
				});
			} else {
				deferred.resolve();
			}

			return deferred.promise();
		},

		getAssertions : function () {

			var fnShouldSkipRulesIssues = function () {
				return jQuery.sap.getUriParameters().get('sap-skip-rules-issues') == 'true';
			};

			return {
				/**
				 * Run the Support Assistant and analyze against a specific state of the application.
				 * Depending on the options passed the assertion might either fail or not if any issues were found.
				 *
				 * If "sap-skip-rules-issues=true" is set as an URI parameter, assertion result will be always positive.
				 *
				 * @param {Object} [options] The options used to configure an analysis.
				 * @param {boolean} [options.failOnAnyIssues=true] Should the test fail or not if there are issues of any severity.
				 * @param {boolean} [options.failOnHighIssues] Should the test fail or not if there are issues of high severity.
				 * This parameter will override failOnAnyIssues if set.
				 * @param {Array.<{libName:string, ruleId:string}>} [options.rules] The rules to check.
				 * @param {Object} [executionScope] The execution scope of the analysis.
				 * @param {('global'|'subtree'|'components')} [executionScope.type=global] The type of the execution scope.
				 * @param {string|string[]} [executionScope.selectors] The ids of the components or the subtree.
				*/
				noRuleFailures: function(options) {
					var ruleDeferred = jQuery.Deferred(),
						failOnAnyRuleIssues = options[0] && options[0]["failOnAnyIssues"],
						failOnHighRuleIssues = options[0] && options[0]["failOnHighIssues"],
						rules = options[0] && options[0].rules,
						executionScope = options[0] && options[0].executionScope;

					jQuery.sap.support.analyze(executionScope, rules).then(function () {
						var analysisHistory = jQuery.sap.support.getAnalysisHistory(),
							lastAnalysis = { issues: [] };

						if (analysisHistory.length) {
							lastAnalysis = analysisHistory[analysisHistory.length - 1];
						}

						var issueSummary = lastAnalysis.issues.reduce(function (summary, issue) {
							summary[issue.severity.toLowerCase()] += 1;
							return summary;
						}, { high: 0, medium: 0, low: 0 });

						var assertionResult = lastAnalysis.issues.length === 0;
						if (failOnHighRuleIssues) {
							assertionResult = issueSummary.high === 0;
						} else if (failOnAnyRuleIssues === false || failOnHighRuleIssues === false) {
							assertionResult = true;
						}

						if (fnShouldSkipRulesIssues()) {
							assertionResult = true;
						}

						ruleDeferred.resolve({
							result: assertionResult,
							message: "Support Assistant issues found: [High: " + issueSummary.high +
									 ", Medium: " + issueSummary.medium	+
									 ", Low: " + issueSummary.low +
									 "]",
							expected: "0 high 0 medium 0 low",
							actual: issueSummary.high + " high " + issueSummary.medium + " medium " + issueSummary.low + " low"
						});
					});

					return ruleDeferred.promise();
				},
				/**
				 * If there are issues found the assertion result will be false and a report with all the issues will be generated
				 * in the message of the test. If no issues were found the assertion result will be true and no report will
				 * be generated.
				 *
				 * If "sap-skip-rules-issues=true" is set as an URI parameter, assertion result will be always positive.
				 */
				getFinalReport: function () {
					var ruleDeferred = jQuery.Deferred(),
						history = jQuery.sap.support.getFormattedAnalysisHistory(),
						analysisHistory = jQuery.sap.support.getAnalysisHistory(),
						totalIssues = analysisHistory.reduce(function (total, analysis) {
							return total + analysis.issues.length;
						}, 0),
						result = totalIssues === 0,
						message = "Support Assistant Analysis History",
						actual = message;

					if (result) {
						message += " - no issues found";
					} else  if (fnShouldSkipRulesIssues()) {
						result = true;
						message += ' - issues are found. To see them remove the "sap-skip-rules-issues=true" URI parameter';
					}

					ruleDeferred.resolve({
						result: result,
						message: message,
						actual: actual,
						expected: history
					});

					return ruleDeferred.promise();
				}
			};
		}
	});

	return Extension;
});
