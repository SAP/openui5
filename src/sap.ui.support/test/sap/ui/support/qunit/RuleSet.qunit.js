/*global QUnit,sinon*/

(function () {
	"use strict";

	jQuery.sap.require("sap/ui/support/supportRules/RuleSet");
	jQuery.sap.require("sap/ui/support/supportRules/Storage");
	jQuery.sap.require("sap/ui/thirdparty/sinon");
	jQuery.sap.require("sap/ui/thirdparty/sinon-qunit");

	var createValidRule = function (id) {
		return {
			id: id,
			check: function () { },
			title: "title",
			description: "desc",
			resolution: "res",
			audiences: ["Control"],
			categories: ["Performance"],
			selected:true
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
		var ruleSet = new sap.ui.support.supportRules.RuleSet();
		assert.strictEqual(ruleSet._oSettings.name, undefined, "There is no set name in the RuleSet !");
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

	QUnit.test("Adding a rule with wrong category", function (assert) {
		var settingsObj = createValidRule("id1");
		settingsObj.categories.push("Non existing category");
		this.ruleSet.addRule(settingsObj);
		assert.equal(jQuery.sap.log.error.calledOnce, true, "should throw an error");
	});

	QUnit.module("RuleSet static functions test", {
		setup: function () {
			this.ruleSet = new sap.ui.support.supportRules.RuleSet({
				name: "sap.ui.testName"
			});
			this.libraries = [
				{title: "test", type: "library", rules: [createValidRule("id1"), createValidRule("id2")]},
				{title: "tested", type: "library", rules: [createValidRule("id3"), createValidRule("id4")]}
			];
		},
		teardown: function () {
			// Restores original function
			sap.ui.support.supportRules.RuleSet.clearAllRuleSets();
			this.libraries = null;
		}
	});

	QUnit.test("Extract rules settings to object", function (assert) {
		var rulesSettings = sap.ui.support.supportRules.RuleSet._extractRulesSettingsToSave(this.libraries);

		assert.strictEqual(typeof rulesSettings, 'object', "should return object");
		assert.equal(Object.keys(rulesSettings).length, 2, "should contain 2 objects");
		assert.ok(rulesSettings.hasOwnProperty("test"), "should have the library name");
		assert.equal(Object.keys(rulesSettings["test"]).length, 2, "first library should contain 2 rules");
		assert.ok(rulesSettings["test"].hasOwnProperty("id1") && typeof rulesSettings["test"]["id1"] === 'object', "should contain first rule as object");
		assert.ok(rulesSettings["test"].hasOwnProperty("id2") && typeof rulesSettings["test"]["id2"] === 'object', "should contain second rule as object");
		assert.ok(rulesSettings.hasOwnProperty("tested"), "should have the library name");
		assert.equal(Object.keys(rulesSettings["tested"]).length, 2, "second library should contain 2 rules");
		assert.ok(rulesSettings["tested"].hasOwnProperty("id3") && typeof rulesSettings["tested"]["id3"] === 'object', "should contain first rule as object");
		assert.ok(rulesSettings["tested"].hasOwnProperty("id4") && typeof rulesSettings["tested"]["id4"] === 'object', "should contain second rule as object");
	});

	QUnit.test("Load and update rules settings from local stored rule sets", function (assert) {
		this.libraries[0].rules[0].selected = false;
		this.libraries[1].rules[1].selected = false;

		// Mock storage function
		sinon.stub(sap.ui.support.supportRules.Storage, "getSelectedRules", function () {
			return JSON.parse('{"test":{"id1":{"id":"id1","selected":true},"id2":{"id":"id2","selected":true}},' +
				'"tested":{"id3":{"id":"id3","selected":true},"id4":{"id":"id4","selected":true}}}');
		});

		sap.ui.support.supportRules.RuleSet.loadSelectionOfRules(this.libraries);
		this.libraries.forEach(function (lib) {
			assert.ok(lib.rules[0].selected === true, "first rule should be selected");
			assert.ok(lib.rules[1].selected === true, "second rule should be selected");
		});
		sap.ui.support.supportRules.Storage.getSelectedRules.restore();
	});

	QUnit.test("Should not update libraries if storage is empty", function (assert) {
		var originalLibrary = this.libraries.slice();
		// Mock storage function
		sinon.stub(sap.ui.support.supportRules.Storage, "getSelectedRules", function () {
			return null;
		});
		sap.ui.support.supportRules.RuleSet.loadSelectionOfRules(this.libraries);

		assert.ok(JSON.stringify(originalLibrary) === JSON.stringify(this.libraries), "library should not be changed");
		sap.ui.support.supportRules.Storage.getSelectedRules.restore();
	});

}());
