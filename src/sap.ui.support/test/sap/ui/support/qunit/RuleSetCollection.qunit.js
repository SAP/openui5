/*global QUnit,sinon*/

sap.ui.require([
		"jquery.sap.global",
		"sap/ui/support/supportRules/Main",
		"sap/ui/support/supportRules/WindowCommunicationBus",
		"sap/ui/support/supportRules/WCBChannels",
		"sap/ui/support/supportRules/RuleSet",
		"sap/ui/support/supportRules/RuleSetLoader"],
	function (jQuery, Main, CommunicationBus, channelNames, RuleSet, RuleSetLoader) {
		"use strict";

		function createValidRule(sRuleId) {
			return {
				id: sRuleId,
				check: function () { },
				title: "title",
				description: "desc",
				resolution: "res",
				audiences: ["Control"],
				categories: ["Performance"],
				selected: true
			};
		}

		function createValidRules(sRuleId, iNumberOfRules) {
			var aRules = [];

			for (var i = 1; i <= iNumberOfRules; i++) {
				aRules.push(createValidRule(sRuleId + i));
			}

			return aRules;
		}

		function createRuleSet(sLibName, sRuleId, iNumberOfRules) {
			var oLib = {
				name: sLibName,
				niceName: "sap library"
			};

			var oRuleSet = new RuleSet(oLib);

			var aRules = createValidRules(sRuleId, iNumberOfRules);
			aRules.forEach(function (oRule) {
				oRuleSet.addRule(oRule);
			});

			return {
				lib: oLib,
				ruleset: oRuleSet
			};
		}

		function createRuleSetObject(sLibName, sRuleId, iNumberOfRules) {
			return {
				name: sLibName,
				niceName: "sap library",
				ruleset: createValidRules(sRuleId, iNumberOfRules)
			};
		}

		/*
		TODO: Fix the issue with race condition
		Temporary commenting the test to avoid build problems.
		*/
		// QUnit.test("When a library is loaded", function () {
		// 	sinon.spy(RuleSetProvider, "_fetchSupportRuleSets");

		// 	core.fireLibraryChanged({
		// 		stereotype: "library"
		// 	});

		// 	assert.ok(RuleSetProvider._fetchSupportRuleSets.calledOnce, " the support rules should be updated");

		// 	RuleSetProvider._fetchSupportRuleSets.restore();
		// });

		QUnit.module("RuleSetLoader.js methods", {
			beforeEach: function () {
				// Store _mRuleSets
				this._mRuleSets = jQuery.extend(true, {}, RuleSetLoader._mRuleSets);

				RuleSetLoader._mRuleSets = {
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
			afterEach: function () {
				// Restore _mRuleSets
				RuleSetLoader._mRuleSets = jQuery.extend(true, {}, this._mRuleSets);
				this._mRuleSets = null;
				RuleSet.clearAllRuleSets();
			}
		});


		QUnit.test('When the _mRuleSets is set', function (assert) {
			// arrange
			var testValue = "test";
			RuleSetLoader._mRuleSets = testValue;

			// act
			var result = RuleSetLoader.getRuleSets();

			// assert
			assert.strictEqual(result, testValue, "The return result should be the same as the _mRuleSets variable");
		});

		QUnit.test("_fetchRuleSet with ruleset of type RuleSet and library not present in the available rulesets", function (assert) {
			// Arrange
			sinon.stub(jQuery.sap, "getObject", function (sLibName) {
				return {
					library: {
						support: createRuleSet("sap.uxap", "validRule", 1)
					}
				};
			});

			// Act
			RuleSetLoader._fetchRuleSet("sap.uxap");

			//Assert
			assert.ok(RuleSetLoader._mRuleSets["sap.uxap"].ruleset instanceof RuleSet, "Should be an instance of RuleSet");
			assert.equal(Object.keys(RuleSetLoader._mRuleSets["sap.uxap"].ruleset._mRules).length, 1, "Should have one fetched rule");

			jQuery.sap.getObject.restore();
		});

		QUnit.test("_fetchRuleSet with ruleset of type RuleSet and library present in the available rulesets", function (assert) {
			// Arrange
			sinon.stub(jQuery.sap, "getObject", function (sLibName) {
				return {
					library: {
						support: createRuleSet("sap.uxap", "anotherValidRule", 2)
					}
				};
			});

			// Setup initial RuleSet
			RuleSetLoader._mRuleSets["sap.uxap"] = createRuleSet("sap.uxap", "initialValidRule", 2);

			// Act
			RuleSetLoader._fetchRuleSet("sap.uxap");

			//Assert
			assert.ok(RuleSetLoader._mRuleSets["sap.uxap"].ruleset instanceof RuleSet, "Should be an instance of RuleSet");
			assert.equal(Object.keys(RuleSetLoader._mRuleSets["sap.uxap"].ruleset._mRules).length, 4, "Should have four fetched rules");

			jQuery.sap.getObject.restore();
		});

		QUnit.test("_fetchRuleSet with ruleset of type Object and library not present in the available rulesets", function (assert) {
			// Arrange
			sinon.stub(jQuery.sap, "getObject", function (sLibName) {
				return {
					library: {
						support: createRuleSetObject("sap.uxap", "validRule", 3)
					}
				};
			});

			// Act
			RuleSetLoader._fetchRuleSet("sap.uxap");

			//Assert
			assert.ok(RuleSetLoader._mRuleSets["sap.uxap"].ruleset instanceof RuleSet, "Should be an instance of RuleSet");
			assert.equal(Object.keys(RuleSetLoader._mRuleSets["sap.uxap"].ruleset._mRules).length, 3, "Should have three fetched rules");

			jQuery.sap.getObject.restore();
		});

		QUnit.test("_fetchRuleSet join two types of rulesets", function (assert) {
			// Arrange
			sinon.stub(jQuery.sap, "getObject", function (sLibName) {
				var oRuleSet = createRuleSetObject("sap.uxap", "validRule", 2);

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
			RuleSetLoader._mRuleSets["sap.uxap"] = createRuleSet("sap.uxap", "initialValidRule", 2);

			// Act
			RuleSetLoader._fetchRuleSet("sap.uxap");

			//Assert
			assert.ok(RuleSetLoader._mRuleSets["sap.uxap"].ruleset instanceof RuleSet, "Should be an instance of RuleSet");
			assert.equal(Object.keys(RuleSetLoader._mRuleSets["sap.uxap"].ruleset._mRules).length, 8, "Should have eight fetched rules");

			jQuery.sap.getObject.restore();
		});

		QUnit.test("_fetchRuleSet with unknown library", function (assert) {
			// Arrange
			sinon.stub(jQuery.sap, "getObject", function (sLibName) {
				return;
			});
			sinon.spy(jQuery.sap.log, "error");

			// Act
			RuleSetLoader._fetchRuleSet("sap.test");

			//Assert
			assert.notOk(RuleSetLoader._mRuleSets["sap.test"], "Should be undefined");
			assert.equal(jQuery.sap.log.error.callCount, 1, "should have logged an error");

			jQuery.sap.getObject.restore();
			jQuery.sap.log.error.restore();
		});
	});