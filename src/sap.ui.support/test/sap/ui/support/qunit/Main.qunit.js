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
	"sap/base/Log",
	"sap/base/util/deepExtend",
	"sap/base/util/ObjectPath"
	],
	function (Bootstrap,
			  Main,
			  CommunicationBus,
			  channelNames,
			  RuleSet,
			  RuleSetLoader,
			  Icon,
			  Panel,
			  Button,
			  Text,
			  Log,
			  deepExtend,
			  ObjectPath) {
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

		/**
		 * @deprecated As of version 1.120
		 */
		function createValidRules(sRuleId, iNumberOfRules) {
			var aRules = [];

			for (var i = 1; i <= iNumberOfRules; i++) {
				aRules.push(createValidRule(sRuleId + i));
			}

			return aRules;
		}

		/**
		 * @deprecated As of version 1.120
		 */
		function createRuleSet(sLibName, sRuleId, iNumberOfRules) {
			var oLib = {
				name: sLibName,
				niceName: "sap library"
			};

			var oRuleSet = new RuleSet(oLib);

			var aRules = createValidRules(sRuleId, iNumberOfRules);
			aRules.forEach(function (oRule) {
				oRuleSet.addRule(oRule, {});
			});

			return {
				lib: oLib,
				ruleset: oRuleSet
			};
		}

		/**
		 * @deprecated As of version 1.120
		 */
		function createRuleLibAsObject(sLibName, sRuleId, iNumberOfRules) {
			return {
				name: sLibName,
				niceName: "sap library",
				ruleset: createValidRules(sRuleId, iNumberOfRules)
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

		/**
		 * @deprecated As of version 1.120
		 */
		QUnit.test("_fetchRuleLib with ruleset of type RuleSet and library not present", function (assert) {
			// Arrange
			sinon.stub(ObjectPath, "get", function (sLibName) {
				return {
					library: {
						support: createRuleSet("sap.uxap", "validRule", 1)
					}
				};
			});

			// Act
			RuleSetLoader._fetchRuleLib("sap.uxap");

			//Assert
			assert.ok(RuleSetLoader._mRuleLibs["sap.uxap"].ruleset instanceof RuleSet, "Should be an instance of RuleSet");
			assert.equal(Object.keys(RuleSetLoader._mRuleLibs["sap.uxap"].ruleset._mRules).length, 1, "Should have one fetched rule");

			ObjectPath.get.restore();
		});

		/**
		 * @deprecated As of version 1.120
		 */
		QUnit.test("_fetchRuleLib with ruleset of type RuleSet and library present in the available rulesets", function (assert) {
			// Arrange
			sinon.stub(ObjectPath, "get", function (sLibName) {
				return {
					library: {
						support: createRuleSet("sap.uxap", "anotherValidRule", 2)
					}
				};
			});

			// Setup initial RuleSet
			RuleSetLoader._mRuleLibs["sap.uxap"] = createRuleSet("sap.uxap", "initialValidRule", 2);

			// Act
			RuleSetLoader._fetchRuleLib("sap.uxap");

			//Assert
			assert.ok(RuleSetLoader._mRuleLibs["sap.uxap"].ruleset instanceof RuleSet, "Should be an instance of RuleSet");
			assert.equal(Object.keys(RuleSetLoader._mRuleLibs["sap.uxap"].ruleset._mRules).length, 4, "Should have four fetched rules");

			ObjectPath.get.restore();
		});

		/**
		 * @deprecated As of version 1.120
		 */
		QUnit.test("_fetchRuleLib with ruleset of type Object and library not present in the available rulesets", function (assert) {
			// Arrange
			sinon.stub(ObjectPath, "get", function (sLibName) {
				return {
					library: {
						support: createRuleLibAsObject("sap.uxap", "validRule", 3)
					}
				};
			});

			// Act
			RuleSetLoader._fetchRuleLib("sap.uxap");

			//Assert
			assert.ok(RuleSetLoader._mRuleLibs["sap.uxap"].ruleset instanceof RuleSet, "Should be an instance of RuleSet");
			assert.equal(Object.keys(RuleSetLoader._mRuleLibs["sap.uxap"].ruleset._mRules).length, 3, "Should have three fetched rules");

			ObjectPath.get.restore();
		});

		/**
		 * @deprecated As of version 1.120
		 */
		QUnit.test("_fetchRuleLib join two types of rulesets", function (assert) {
			// Arrange
			sinon.stub(ObjectPath, "get", function (sLibName) {
				var oRuleSet = createRuleLibAsObject("sap.uxap", "validRule", 2);

				// Test if a ruleset with nested arrays of rules joins them correctly
				// ruleset: [
				// 	rule1,
				// 	rule2,
				// 	[
				// 		rule3,
				// 		rule4
				// 	],
				// 	rule5,
				// 	rule6
				// ]
				oRuleSet.ruleset.push(createValidRules("additionalRule", 2));
				oRuleSet.ruleset.push(createValidRule("additionalRule_5"));
				oRuleSet.ruleset.push(createValidRule("additionalRule_6"));

				return {
					library: {
						support: oRuleSet
					}
				};
			});

			// Setup initial RuleSet
			RuleSetLoader._mRuleLibs["sap.uxap"] = createRuleSet("sap.uxap", "initialValidRule", 2);

			// Act
			RuleSetLoader._fetchRuleLib("sap.uxap");

			//Assert
			assert.ok(RuleSetLoader._mRuleLibs["sap.uxap"].ruleset instanceof RuleSet, "Should be an instance of RuleSet");
			assert.equal(Object.keys(RuleSetLoader._mRuleLibs["sap.uxap"].ruleset._mRules).length, 8, "Should have eight fetched rules");

			ObjectPath.get.restore();
		});

		/**
		 * @deprecated As of version 1.120
		 */
		QUnit.test("_fetchRuleLib with unknown library", function (assert) {
			// Arrange
			sinon.stub(ObjectPath, "get", function (sLibName) {
				return;
			});
			sinon.spy(Log, "error");

			// Act
			RuleSetLoader._fetchRuleLib("sap.test");

			//Assert
			assert.notOk(RuleSetLoader._mRuleLibs["sap.test"], "Should be undefined");
			assert.equal(Log.error.callCount, 1, "should have logged an error");

			ObjectPath.get.restore();
			Log.error.restore();
		});
	});