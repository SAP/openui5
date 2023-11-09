/*global QUnit,sinon*/

sap.ui.define([
	"sap/ui/support/Bootstrap",
	"sap/ui/support/supportRules/Main",
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/WCBChannels",
	"sap/ui/support/supportRules/RuleSet",
	"sap/ui/support/supportRules/RuleSetLoader",
	"sap/ui/core/Icon",
	"sap/m/Panel",
	"sap/m/Button",
	"sap/m/Text",
	"sap/base/util/deepExtend"
],
	function(Bootstrap, Main, CommunicationBus, channelNames, RuleSet, RuleSetLoader, Icon, Panel, Button, Text, deepExtend) {
		"use strict";

		var spyChannel = function (channelName) {
			sinon.spy(CommunicationBus.prototype, "publish");

			return {
				assertCalled: function (assert) {
					assert.ok(CommunicationBus.prototype.publish.calledWith(channelName), "channel name: " + channelName + " should be called");
					CommunicationBus.prototype.publish.restore();
				}
			};
		};

		function createValidRule(sRuleId) {
			return {
				id: sRuleId,
				check: function () {
				},
				title: "title",
				description: "desc",
				resolution: "res",
				audiences: ["Control"],
				categories: ["Performance"],
				selected: true
			};
		}

		function createRuleLibWithLib(sLibName, sLibNiceName, aRules) {
			var oLib = {
				name: sLibName,
				niceName: sLibNiceName
			};

			var oRuleSet = new RuleSet(oLib);

			aRules.forEach(function (oRule) {
				oRuleSet.addRule(oRule, {});
			});

			return {
				lib: oLib,
				ruleset: oRuleSet
			};
		}

		QUnit.module("Main.js test", {
			beforeEach: function (assert) {
				var done = assert.async();

				Bootstrap.initSupportRules(["true", "silent"], {
					onReady: function() {
						done();
					}
				});
			}
		});

		QUnit.test("When a new control is created", function (assert) {
			var spyCoreStateChanged = spyChannel(channelNames.ON_CORE_STATE_CHANGE);

			var icon = new Icon();
			this.clock.tick(600);

			spyCoreStateChanged.assertCalled(assert);
			icon.destroy();
		});

		QUnit.test("When a control is deleted", function (assert) {
			var icon = new Icon();
			var spyCoreStateChanged = spyChannel(channelNames.ON_CORE_STATE_CHANGE);

			icon.destroy();
			this.clock.tick(600);

			spyCoreStateChanged.assertCalled(assert);
		});

		QUnit.test("Element tree", function (assert) {
			var assertIsDirectChild = function (id1, id2, et) {
				var root = et.constructor === Array ? et[0] : et;

				if (root.id == id2) {
					var isDirectChild = false;
					root.content.forEach(function (content) {
						if (content.id === id1) {
							isDirectChild = true;
						}
					});

					assert.ok(isDirectChild, id1 + " should be direct child of " + id2);
				} else {
					root.content.forEach(function (content) {
						assertIsDirectChild(id1, id2, content);
					});
				}
			};

			var oPanel = new Panel({
				id: "rootPanel",
				content: [
					new Panel({
						id: "innerPanel1",
						content: [
							new Button({
								id: "innerButton"
							}),
							new Text({
								id: "innerText"
							})
						]
					}),
					new Panel({
						id: "innerPanel2",
						content: [
							new Button({
								id: "innerButton2"
							})
						]
					})

				]
			});

			Main.setExecutionScope({
				type: "subtree",
				parentId: "rootPanel"
			});

			var et = Main._createElementTree();

			assertIsDirectChild("rootPanel", "WEBPAGE", et);
			assertIsDirectChild("innerPanel1", "rootPanel", et);
			assertIsDirectChild("innerPanel2", "rootPanel", et);
			assertIsDirectChild("innerButton", "innerPanel1", et);
			assertIsDirectChild("innerText", "innerPanel1", et);
			assertIsDirectChild("innerButton2", "innerPanel2", et);

			oPanel.destroy();
		});

		QUnit.module("Main.js methods", {
			beforeEach: function () {
				RuleSet.clearAllRuleSets();
				// Store _mRuleLibs
				this._mRuleLibs = deepExtend({}, RuleSetLoader._mRuleLibs);

				RuleSetLoader._mRuleLibs = {
					"temporary": createRuleLibWithLib("temporary", "temporary rules nice name", [
						createValidRule("tmpRule")
					]),
					"sap.ui.core": createRuleLibWithLib("sap.ui.core", "nice name", [
						createValidRule("preloadAsyncCheck"),
						createValidRule("cacheBusterToken"),
						createValidRule("bindingPathSyntaxValidation"),
						createValidRule("XMLViewWrongNamespace"),
						createValidRule("XMLViewDefaultNamespace")
					]),
					"sap.m": createRuleLibWithLib("sap.m", "nice name", [
						createValidRule("onlyIconButtonNeedsTooltip"),
						createValidRule("dialogarialabelledby"),
						createValidRule("inputNeedsLabel")
					])
				};
			},
			afterEach: function () {
				// Restore _mRuleLibs
				RuleSetLoader._mRuleLibs = deepExtend({}, this._mRuleLibs);
				RuleSet.clearAllRuleSets();
				Main._aSelectedRules = [];
				Main._oSelectedRulesIds = {};
			}
		});

		QUnit.test("_setSelectedRules with a single ruleDescriptor object", function (assert) {
			// Arrange
			var oRuleDescriptor = {
				"libName": "sap.m",
				"ruleId": "onlyIconButtonNeedsTooltip"
			};

			// Act
			Main._setSelectedRules(oRuleDescriptor);

			// Assert
			assert.equal(Main._aSelectedRules.length, 1, "Should have only one selected rule in _aSelectedRules");
			assert.equal(Object.keys(Main._oSelectedRulesIds).length, 1, "Should have only one selected rule in _oSelectedRulesIds");
			assert.equal(Main._oSelectedRulesIds[oRuleDescriptor.ruleId], true, "Should have the id of the selected rule");
		});

		QUnit.test("_setSelectedRules with multiple ruleDescriptors", function (assert) {
			// Arrange
			var aRuleDescriptors = [
				{
					"ruleId": "tmpRule",
					"libName": "temporary"
				},
				{
					"ruleId": "preloadAsyncCheck",
					"libName": "sap.ui.core"
				},
				{
					"ruleId": "XMLViewWrongNamespace",
					"libName": "sap.ui.core"
				},
				{
					"ruleId": "inputNeedsLabel",
					"libName": "sap.m"
				}
			];

			// Act
			Main._setSelectedRules(aRuleDescriptors);

			// Assert
			assert.equal(Main._aSelectedRules.length, 4, "Should have 4 selected rules in _aSelectedRules");
			assert.equal(Object.keys(Main._oSelectedRulesIds).length, 4, "Should have 4 selected rules in _oSelectedRulesIds");
		});

		QUnit.test("_setSelectedRules with invalid ruleDescriptors", function (assert) {
			// Arrange
			var aRuleDescriptors = [
				// Valid rule descriptors (the library and the rule exist)
				{
					"ruleId": "tmpRule",
					"libName": "temporary"
				},
				{
					"ruleId": "preloadAsyncCheck",
					"libName": "sap.ui.core"
				},
				{
					"ruleId": "XMLViewWrongNamespace",
					"libName": "sap.ui.core"
				},
				{
					"ruleId": "inputNeedsLabel",
					"libName": "sap.m"
				},
				// Invalid library
				{
					"ruleId": "someRule",
					"libName": "sap.unknown"
				},
				// Invalid rule
				{
					"ruleId": "someRule2",
					"libName": "sap.ui.core"
				},
				// Invalid rule descriptors
				{
					"test": "invalidRule",
					"libName": "sap.ui.core"
				},
				{
					"ruleId": "invalidRule",
					"libbbbbbbName": "sap.ui.core"
				},
				"string rule descriptor"
			];

			// Act
			Main._setSelectedRules(aRuleDescriptors);

			// Assert
			assert.equal(Main._aSelectedRules.length, 4, "Should select only the valid rules in _aSelectedRules");
			assert.equal(Object.keys(Main._oSelectedRulesIds).length, 4, "Should select only the valid rules in _oSelectedRulesIds");
		});

		QUnit.test("_setSelectedRules with no ruleDescriptors", function (assert) {
			// Act
			Main._setSelectedRules();

			// Assert
			assert.equal(Main._aSelectedRules.length, 0, "Should reset all selected rules in _aSelectedRules");
			assert.equal(Object.keys(Main._oSelectedRulesIds).length, 0, "Should reset all selected rules in _oSelectedRulesIds");
		});
	});