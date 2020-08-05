/*global QUnit,sinon*/

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/support/Bootstrap",
	"sap/ui/support/supportRules/RuleSet",
	"sap/ui/support/supportRules/RuleSetLoader",
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/WCBChannels"
], function (jQuery,
			 Bootstrap,
			 RuleSet,
			 RuleSetLoader,
			 CommunicationBus,
			 channelNames) {
	"use strict";

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

	QUnit.module("RuleSetLoader.js methods", {
		beforeEach: function (assert) {
			var done = assert.async();
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
						"_mRules": {
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

			this.oLoadedLibraries = {
				"testLib1": {
					"extensions": {
						"sap.ui.support": {
							"internalRules": true
						}
					}
				},
				"testLib2": {
					"extensions": {
						"sap.ui.support": {
							"internalRules": true,
							"publicRules": true
						}
					}
				},
				"testLib3": {
					"name": "Test"
				}
			};

			Bootstrap.initSupportRules(["true", "silent"], {
				onReady: function () {
					done();
				}
			});
		},
		afterEach: function () {
			// Restore _mRuleSets
			RuleSetLoader._mRuleSets = jQuery.extend(true, {}, this._mRuleSets);
			this._mRuleSets = null;
			this.oLoadedLibraries = null;
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

	QUnit.test("_fetchRuleSet with library and no library.support", function (assert) {
		// Arrange
		sinon.stub(jQuery.sap, "getObject", function (sLibName) {
			return {
				library: {
					support: undefined
				}
			};
		});
		sinon.spy(jQuery.sap.log, "error");

		// Act
		RuleSetLoader._fetchRuleSet("sap.test");

		//Assert
		assert.notOk(RuleSetLoader._mRuleSets["sap.test"], "Should be undefined");
		assert.equal(jQuery.sap.log.error.callCount, 1, "Should have logged an error");

		jQuery.sap.getObject.restore();
		jQuery.sap.log.error.restore();
	});

	QUnit.test("fetchNonLoadedRuleSets", function (assert) {

		// Arrange
		this.clock = sinon.useFakeTimers();
		var done = assert.async();
		var that = this;

		// Mocks the libraries which are currently loaded by the application.
		var aLoadedLibraries = [
			"sap.ui.core",
			"sap.uxap",
			"sap.m"
		];

		// Returns all libraries available in the application (including non-loaded ones).
		sinon.stub(sap.ui, "getVersionInfo", function () {
			return {
				libraries: [
					{name: "sap.ui.core"},
					{name: "sap.m"},
					{name: "sap.uxap"},
					{name: "sap.ui.table"},
					{name: "sap.ui.fl"},
					{name: "sap.ui.documentation"},
					{name: "sap.ui.unknown"}
				]
			};
		});

		// Returns all libraries for which there are rulesets found.
		sinon.stub(RuleSetLoader, "_fetchLibraryNamesWithSupportRules", function () {
			return new Promise(function (resolve) {
				resolve({
					allRules: [
						"sap.ui.core",
						"sap.m",
						"sap.uxap",
						"sap.ui.table",
						"sap.ui.fl"
					]
				});
			});
		});

		sinon.stub(CommunicationBus.prototype, "publish", function (sChannel, oLibraries) {

			if (sChannel !== channelNames.POST_AVAILABLE_LIBRARIES) {
				return;
			}

			//Assert
			assert.ok(oLibraries.libNames.length === 2, "Should have 2 libraries which are not loaded and have rules.");
			assert.ok(oLibraries.libNames.indexOf("sap.ui.fl") > -1, "Should have sap.ui.fl as non-loaded library.");
			assert.ok(oLibraries.libNames.indexOf("sap.ui.table") > -1, "Should have sap.ui.table as non-loaded library.");

			sap.ui.getVersionInfo.restore();
			RuleSetLoader._fetchLibraryNamesWithSupportRules.restore();
			CommunicationBus.prototype.publish.restore();
			that.clock.tick(500);
			that.clock.restore();

			done();
		});

		// Act
		RuleSetLoader.fetchNonLoadedRuleSets(aLoadedLibraries);

	});

	QUnit.test("getAllRules", function (assert) {
		var mRules = RuleSetLoader.getAllRules();

		assert.notOk(mRules instanceof Array, "Should not be an array");
		assert.equal(Object.keys(mRules).length, 9, "Should have 9 rules");
	});

	QUnit.test("getAllRuleDescriptors", function (assert) {
		var aRuleDescriptors = RuleSetLoader.getAllRuleDescriptors();

		assert.ok(aRuleDescriptors instanceof Array, "Should be an array");
		assert.equal(aRuleDescriptors.length, 9, "Should have 9 rules");
		assert.ok(aRuleDescriptors[0].hasOwnProperty("libName"), "Rule descriptors should have libName property set");
		assert.ok(aRuleDescriptors[0].hasOwnProperty("ruleId"), "Rule descriptors should have ruleId property set");
	});

});