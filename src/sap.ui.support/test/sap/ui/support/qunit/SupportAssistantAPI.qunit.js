/*global QUnit*/

sap.ui.define([
	"sap/ui/support/Bootstrap",
	"sap/m/Panel",
	"sap/m/Button",
	"sap/m/Link",
	"sap/m/Text",
	"sap/m/Input"
], function (bootstrap,
			 Panel,
			 Button,
			 Link,
			 Text,
			 Input) {
		"use strict";

	QUnit.module("jQuery.sap.support", {
		beforeEach: function () {

			this.scope = {
				type: "subtree",
				parentId: "rootPanel"
			};

			this.panel = new sap.m.Panel({
				id: "rootPanel",
				content: [
					new sap.m.Panel({
						id: "innerPanel1",
						content: [
							new sap.m.Button({
								id: "innerButton",
								icon: "sap-icon://task"
							}),
							new sap.m.Text({
								id: "innerText"
							}),
							new sap.m.Link({
								href: 'www.google.com',
								press: function () {

								}
							})
						]
					}),
					new sap.m.Panel({
						id: "innerPanel2",
						content: [
							new sap.m.Button({
								id: "innerButton2",
								icon: "sap-icon://task"
							}),
							new sap.m.Input()
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

				jQuery.sap.support.analyze(this.scope, customPreset).then(function () {
					var history = jQuery.sap.support.getLastAnalysisHistory();
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

				jQuery.sap.support.analyze(this.scope, rules).then(function () {
					var history = jQuery.sap.support.getLastAnalysisHistory();
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

				var sResult = jQuery.sap.support.addRule(tempRule);

				assert.strictEqual(sResult, "success", "Rule successfully added");

				jQuery.sap.support.analyze(this.scope, rules).then(function () {
					var history = jQuery.sap.support.getLastAnalysisHistory();
					assert.strictEqual(history.issues.length, 1, "List of temporary rules issues is correct");
					done();
				});
			}
		});
	});

});