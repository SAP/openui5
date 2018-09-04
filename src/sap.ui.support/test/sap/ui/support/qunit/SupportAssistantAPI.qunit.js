/*global QUnit*/

sap.ui.require([
	"sap/ui/support/Bootstrap"
], function (bootstrap) {
		"use strict";

	QUnit.module("jQuery.sap.support", {
		setup: function () {

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
		teardown: function () {
			this.panel.destroy();
			delete this.scope;
		}
	});

	QUnit.test("analyze method", function (assert) {

		var done = assert.async();

		bootstrap.initSupportRules(["true", "silent"], {
			onReady: function () {
				jQuery.sap.support.analyze(this.scope).then(function () {
					var history = jQuery.sap.support.getLastAnalysisHistory();
					assert.strictEqual(history.issues.length, 5, "issues are correct");
					done();
				});
			}
		});
	});

	QUnit.test("analyze method filtered by system preset", function (assert) {

		var done = assert.async();

		bootstrap.initSupportRules(["true", "silent"], {
			onReady: function () {
				jQuery.sap.support.analyze(this.scope, "Accessibility").then(function () {
					var history = jQuery.sap.support.getLastAnalysisHistory();
					assert.strictEqual(history.issues.length, 3, "ACC issues are correct");
					done();
				});
			}
		});
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
});