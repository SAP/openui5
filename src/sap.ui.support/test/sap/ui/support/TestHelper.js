/*global QUnit*/
/* exported testRule */


sap.ui.define([
	"sap/ui/support/RuleAnalyzer",
	"sap/ui/thirdparty/sinon"
], function (RuleAnalyzer, sinon) {
	"use strict";


	/**
	 * Helper test function for rules.
	 * @param {object} oSettings - the settings to run the analysis and test the result.
	 * @param {string} oSettings.executionScopeType - the type of the execution scope. Possible values 'global', 'subtree' or 'components'.
	 * @param {string|string[]} oSettings.executionScopeSelectors - The ids of the components or the subtree.
	 * @param {string} oSettings.libName - the name of the library.
	 * @param {string} oSettings.ruleId - the id of the rule to check.
	 * @param {number|function} oSettings.expectedNumberOfIssues - the expected number of issues from the specified rule. E.g. 4 or function(){return 4;}
	 */
	return function(oSettings) {

		QUnit.test(oSettings.ruleId, function(assert) {
			this.clock = sinon.useFakeTimers();

			var done = assert.async();


			RuleAnalyzer.analyze({
					type: oSettings.executionScopeType,
					selectors: oSettings.executionScopeSelectors
				},
				[{
					libName: oSettings.libName,
					ruleId: oSettings.ruleId
				}]
			).then(function() {
				var oHistory = RuleAnalyzer.getLastAnalysisHistory();

				var iExpectedNumberOfIssues = typeof oSettings.expectedNumberOfIssues === "function" ? oSettings.expectedNumberOfIssues() : oSettings.expectedNumberOfIssues;
				assert.equal(oHistory.issues.length, iExpectedNumberOfIssues, " there should be " + iExpectedNumberOfIssues + " issues");

				// If there are issues found check the rule id
				if (oHistory.issues.length) {
					assert.equal(oHistory.issues[0].rule.id, oSettings.ruleId, " should be an issue from rule " + oSettings.ruleId);
				}

				done();
			});

			this.clock.tick(500);
			this.clock.restore();

		});
	};
});

