/*global QUnit,sinon*/

sap.ui.require([
	"jquery.sap.global",
	"sap/ui/support/supportRules/Main",
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/WCBChannels"],
	function (jQuery, Main, CommunicationBus, channelNames) {
		"use strict";

		/*eslint-disable no-unused-vars*/
		var core;
		/*eslint-enable no-unused-vars*/

		var spyChannel = function (channelName) {
			sinon.spy(CommunicationBus, "publish");

			return {
				assertCalled: function (assert) {
					assert.ok(CommunicationBus.publish.calledWith(channelName), "channel name: " + channelName + " should be called");
					CommunicationBus.publish.restore();
				}
			};
		};

		Main.startPlugin();

		sap.ui.getCore().registerPlugin({
			startPlugin: function (oCore) {
				core = oCore;
			}
		});

		QUnit.module("Main.js test", {
			setup: function () {
				this.clock = sinon.useFakeTimers();
			},
			teardown: function () {
				this.clock.restore();
			}
		});

		/*
		TODO: Fix the issue with race condition
		Temporary commenting the test to avoid build problems.
		*/
		// QUnit.test("When a library is loaded", function () {
		// 	sinon.spy(Main, "_fetchSupportRuleSets");

		// 	core.fireLibraryChanged({
		// 		stereotype: "library"
		// 	});

		// 	assert.ok(Main._fetchSupportRuleSets.calledOnce, " the support rules should be updated");

		// 	Main._fetchSupportRuleSets.restore();
		// });

		QUnit.test("When a new control is created", function (assert) {
			var spyCoreStateChanged = spyChannel(channelNames.ON_CORE_STATE_CHANGE);

			var icon = new sap.ui.core.Icon();
			this.clock.tick(600);

			spyCoreStateChanged.assertCalled(assert);
			icon.destroy();
		});

		QUnit.test("When a control is deleted", function (assert) {
			var icon = new sap.ui.core.Icon();
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

			var oPanel = new sap.m.Panel({
				id: "rootPanel",
				content: [
					new sap.m.Panel({
						id: "innerPanel1",
						content: [
							new sap.m.Button({
								id: "innerButton"
							}),
							new sap.m.Text({
								id: "innerText"
							})
						]
					}),
					new sap.m.Panel({
						id: "innerPanel2",
						content: [
							new sap.m.Button({
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
			assertIsDirectChild("innerButton2", "innerPanel2",et);

			oPanel.destroy();
		});

		QUnit.module("Main.js methods", {
			setup: function () {
				// Store _mRuleSets
				this._mRuleSets = jQuery.extend(true, {}, Main._mRuleSets);

				Main._mRuleSets = {
					"temporary": {
					   "lib": {
						  "name": "temporary"
					   },
					   "ruleset": {
						  "_oSettings": {
							 "name": "temporary"
						  },
						  "_mRules": {
							"tmpRule": {
								"id": "tmpRule",
								"libName": "temporary"
							}
						  },
						  "getRules": function () {
							return this._mRules;
						  }
					   }
					},
					"sap.ui.core": {
					   "lib": {
						  "name": "sap.ui.core",
						  "niceName": "UI5 Core Library"
					   },
					   "ruleset": {
						  "_oSettings": {
							 "name": "sap.ui.core",
							 "niceName": "UI5 Core Library"
						  },
						  "_mRules": {
							"preloadAsyncCheck": {
								"id": "preloadAsyncCheck",
								"libName": "sap.ui.core"
							},
							 "cacheBusterToken": {
								"id": "cacheBusterToken",
								"libName": "sap.ui.core"
							 },
							 "unresolvedPropertyBindings": {
								"id": "unresolvedPropertyBindings",
								"libName": "sap.ui.core"
							 },
							 "bindingPathSyntaxValidation": {
								"id": "bindingPathSyntaxValidation",
								"libName": "sap.ui.core"
							 },
							 "XMLViewWrongNamespace": {
								"id": "XMLViewWrongNamespace",
								"libName": "sap.ui.core"
							 },
							 "XMLViewDefaultNamespace": {
								"id": "XMLViewDefaultNamespace",
								"libName": "sap.ui.core"
							 }
						  },
						  "getRules": function () {
							return this._mRules;
						  }
					   }
					},
					"sap.m": {
					   "lib": {
						  "name": "sap.m",
						  "niceName": "UI5 Main Library"
					   },
					   "ruleset": {
						  "_oSettings": {
							 "name": "sap.m",
							 "niceName": "UI5 Main Library"
						  },
						  "_mRules":{
							 "onlyIconButtonNeedsTooltip": {
								"id": "onlyIconButtonNeedsTooltip",
								"libName": "sap.m"
							 },
							 "dialogarialabelledby": {
								"id": "dialogarialabelledby",
								"libName": "sap.m"
							 },
							 "inputNeedsLabel": {
								"id": "inputNeedsLabel",
								"libName": "sap.m"
							 }
						  },
						  "getRules": function () {
							return this._mRules;
						  }
					   }
					}
				 };
			},
			teardown: function () {
				// Restore _mRuleSets
				Main._mRuleSets = jQuery.extend(true, {}, this._mRuleSets);
				this._mRuleSets = null;
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

		QUnit.test("_setSelectedRules with no ruleDescriptors", function (assert) {
			// Arrange
			var iTotalRules = 0;
			Object.keys(Main._mRuleSets).map(function (sLibName) {
				var oRulesetRules = Main._mRuleSets[sLibName].ruleset.getRules();
				iTotalRules += Object.keys(oRulesetRules).length;
			});

			// Act
			Main._setSelectedRules();

			// Assert
			assert.equal(Main._aSelectedRules.length, iTotalRules, "Should have all rules as selected in _aSelectedRules");
			assert.equal(Object.keys(Main._oSelectedRulesIds).length, iTotalRules, "Should have all rules as selected in _oSelectedRulesIds");
		});
});