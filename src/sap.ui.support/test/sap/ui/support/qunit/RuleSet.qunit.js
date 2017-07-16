/*global QUnit,sinon*/

(function () {
	"use strict";

	jQuery.sap.require("sap/ui/support/supportRules/RuleSet");

	var createValidRule = function (id) {
		return {
			id: id,
			check: function () { },
			title: "title",
			description: "desc",
			resolution: "res",
			audiences: ["Control"],
			categories: ["Performance"]
		};
	};

	window.saptest = {
		createValidRule: createValidRule
	};

	QUnit.module("RuleSet API test", {
		setup: function () {
			sinon.spy(jQuery.sap.log, "error");
			this.ruleSet = new sap.ui.support.supportRules.RuleSet({
				name: "sap.ui.testName"
			});
		},
		teardown: function () {
			sap.ui.support.supportRules.RuleSet.clearAllRuleSets();
			jQuery.sap.log.error.restore();
		}
	});

	QUnit.test("Creating rule set with no name", function (assert) {
		new sap.ui.support.supportRules.RuleSet();
		assert.equal(jQuery.sap.log.error.calledOnce, true, "should throw an error.");
	});

	QUnit.test("Adding a rule", function (assert) {
		this.ruleSet.addRule(createValidRule("id1"));
		assert.equal(jQuery.sap.log.error.callCount, 0, "should not throw an error");
	});

	QUnit.test("Adding a rule withoutId", function (assert) {
		this.ruleSet.addRule({ id: undefined });
		assert.equal(jQuery.sap.log.error.calledOnce, true, "should throw an error");
	});

	QUnit.test("Adding a rule with duplicated ID", function (assert) {
		this.ruleSet.addRule(createValidRule("id1"));
		this.ruleSet.addRule({ id: 'id1' });
		assert.equal(jQuery.sap.log.error.calledOnce, true, "should throw an error");
	});

	QUnit.test("Adding a rule without check function", function (assert) {
		var settingsObj = createValidRule("id1");
		delete settingsObj.check;
		this.ruleSet.addRule(settingsObj);
		assert.equal(jQuery.sap.log.error.calledOnce, true, "should throw an error");
	});

	QUnit.test("Adding a rule without title", function (assert) {
		var settingsObj = createValidRule("id1");
		delete settingsObj.title;
		this.ruleSet.addRule(settingsObj);
		assert.equal(jQuery.sap.log.error.calledOnce, true, "should throw an error");
	});

	QUnit.test("Adding a rule without description", function (assert) {
		var settingsObj = createValidRule("id1");
		delete settingsObj.description;
		this.ruleSet.addRule(settingsObj);
		assert.equal(jQuery.sap.log.error.calledOnce, true, "should throw an error");
	});

	QUnit.test("Adding a rule without resolution", function (assert) {
		var settingsObj = createValidRule("id1");
		delete settingsObj.resolution;
		this.ruleSet.addRule(settingsObj);
		assert.equal(jQuery.sap.log.error.calledOnce, true, "should throw an error");
	});

	QUnit.test("Adding a rule with wrong audience", function (assert) {
		var settingsObj = createValidRule("id1");
		settingsObj.audiences.push("Non existing audience");
		this.ruleSet.addRule(settingsObj);
		assert.equal(jQuery.sap.log.error.calledOnce, true, "should throw an error");
	});

	QUnit.test("Adding a rule with wrong category", function (assert) {
		var settingsObj = createValidRule("id1");
		settingsObj.categories.push("Non existing category");
		this.ruleSet.addRule(settingsObj);
		assert.equal(jQuery.sap.log.error.calledOnce, true, "should throw an error");
	});

	QUnit.test("Rule minversion check", function (assert) {
		sap.ui.support.supportRules.RuleSet.versionInfo = {
			version: '1.44'
		};

		var settingsObj1 = createValidRule("id1");
		var settingsObj2 = createValidRule("id2");

		settingsObj1.minversion = '1.46';
		settingsObj2.minversion = '1.38';

		this.ruleSet.addRule(settingsObj1);

		assert.equal(Object.keys(this.ruleSet.getRules()).length, 0, "Rule with higher than core version (1.46 > 1.44) should not be added");

		this.ruleSet.addRule(settingsObj2);

		assert.equal(Object.keys(this.ruleSet.getRules()).length, 1, "Rule version smaller than core's (1.18 < 1.44), so it should be added");
	});

	QUnit.test("Updating a rule", function (assert) {
		var settingsObj = createValidRule("id1");
		this.ruleSet.addRule(settingsObj);
		var rule = this.ruleSet.getRules().id1;

		settingsObj.title = "updatedTitle";
		settingsObj.description = "newDesc";
		settingsObj.audiences = ["Internal"];
		settingsObj.categories = ["Performance"];
		settingsObj.resolution = "testResolution";

		this.ruleSet.updateRule("id1", settingsObj);

		assert.equal(rule.title, "updatedTitle", "should change title");
		assert.equal(rule.description, "newDesc", "should change description");
		assert.equal(rule.resolution, "testResolution", "should change resolution");
		assert.equal(rule.audiences.length, 1, "should work change audiences");
		assert.equal(rule.audiences[0], "Internal", "should change audiences");
		assert.equal(rule.categories.length, 1, "should work change categories");
		assert.equal(rule.categories[0], "Performance", "should change categories");
	});
}());
