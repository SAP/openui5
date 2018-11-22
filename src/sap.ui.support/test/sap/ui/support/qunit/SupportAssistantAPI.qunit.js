/*global QUnit*/

sap.ui.define([
	"sap/ui/support/Bootstrap",
	"sap/ui/support/RuleAnalyzer",
	"sap/m/Panel",
	"sap/m/Button",
	"sap/m/Link",
	"sap/m/Text",
	"sap/m/Input"
], function (bootstrap,
			 RuleAnalyzer,
			 Panel,
			 Button,
			 Link,
			 Text,
			 Input) {
		"use strict";

	QUnit.module("sap.ui.support.Analyzer", {
		beforeEach: function () {

			this.scope = {
				type: "subtree",
				parentId: "rootPanel"
			};

			this.panel = new Panel({
				id: "rootPanel",
				content: [
					new Panel({
						id: "innerPanel1",
						content: [
							new Button({
								id: "innerButton",
								icon: "sap-icon://task"
							}),
							new Text({
								id: "innerText"
							}),
							new Link({
								href: 'www.google.com',
								press: function () {

								}
							})
						]
					}),
					new Panel({
						id: "innerPanel2",
						content: [
							new Button({
								id: "innerButton2",
								icon: "sap-icon://task"
							}),
							new Input()
						]
					})
				]
			});
		},
		afterEach: function () {
			this.panel.destroy();
			delete this.scope;
		}
	});

	QUnit.test("analyze method filtered by custom preset", function (assert) {

		var done = assert.async();

		bootstrap.initSupportRules(["true", "silent"], {
			onReady: function () {

				var customPreset = {
					id: "CustomPreset",
					title: "Custom",
					description: "Custom rules",
					selections: [
						{ruleId: "inputNeedsLabel", libName: "sap.m"}
					]
				};

				RuleAnalyzer.analyze(this.scope, customPreset).then(function () {
					var history = RuleAnalyzer.getLastAnalysisHistory();
					assert.strictEqual(history.issues.length, 1, "Custom issues are correct");
					done();
				});
			}
		});
	});

	QUnit.test("analyze method using list of rules", function (assert) {

		var done = assert.async();

		bootstrap.initSupportRules(["true", "silent"], {
			onReady: function () {

				var rules = [
					{ruleId: "inputNeedsLabel", libName: "sap.m"}
				];

				RuleAnalyzer.analyze(this.scope, rules).then(function () {
					var history = RuleAnalyzer.getLastAnalysisHistory();
					assert.strictEqual(history.issues.length, 1, "List of rules issues are correct");
					done();
				});
			}
		});
	});

	QUnit.test("Temporary rule execution", function (assert) {

		var done = assert.async();

		bootstrap.initSupportRules(["true", "silent"], {
			onReady: function () {

				var tempRule = {
					id: "TEMP RULE ID",
					title: "TEMP RULE TITLE",
					audiences: ["Internal"],
					categories: ["Functionality"],
					check : function (oIssueManager, oCoreFacade, oScope, fnResolve) {
							oIssueManager.addIssue({
								severity: sap.ui.support.Severity.High,
								details: "Medium test issue details",
								context: {
									id: "Fake element id"
								}
							});
						},
					description: "Checks the EventBus publications for missing listeners",
					minversion: "1",
					resolution: "Calls to EventBus#publish should be removed or adapted such that associated listeners are found",
					resolutionurls: []
				};

				var rules = [
					{ruleId: "TEMP RULE ID", libName: "temporary"}
				];

				var sResult = RuleAnalyzer.addRule(tempRule);

				assert.strictEqual(sResult, "success", "Rule successfully added");

				RuleAnalyzer.analyze(this.scope, rules).then(function () {
					var history = RuleAnalyzer.getLastAnalysisHistory();
					assert.strictEqual(history.issues.length, 1, "List of temporary rules issues is correct");
					done();
				});
			}
		});
	});

	QUnit.test("Pass metadata from analyze to reports", function (assert) {
		var done = assert.async(),
			oMetadata = {
				"scenarioCode": "<any-code>",
				"scenarioName": "<any-name>",
				"scenarioDescription": "<any-desc>"
			};

		bootstrap.initSupportRules(["true", "silent"], {
			onReady: function () {
				RuleAnalyzer.analyze(this.scope, null, oMetadata).then(function () {
					var history = RuleAnalyzer.getLastAnalysisHistory();
					assert.deepEqual(history.analysisMetadata, oMetadata, "Metadata is correctly (unchanged) passed from analyze to reports.");
					done();
				});
			}
		});
	});

});