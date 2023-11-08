/*global QUnit,sinon*/

sap.ui.define([
	"sap/ui/VersionInfo",
	"sap/ui/support/Bootstrap",
	"sap/ui/support/supportRules/RuleSet",
	"sap/ui/support/supportRules/RuleSetLoader",
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/WCBChannels",
	"sap/base/Log",
	"sap/base/util/deepExtend",
	"sap/base/util/ObjectPath"
], function (VersionInfo,
			 Bootstrap,
			 RuleSet,
			 RuleSetLoader,
			 CommunicationBus,
			 channelNames,
			 Log,
			 deepExtend,
			 ObjectPath) {
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

	function createRuleLibWithLibNRules(sLibName, sRuleId, iNumberOfRules) {
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

	function createRuleLibAsObject(sLibName, sRuleId, iNumberOfRules) {
		return {
			name: sLibName,
			niceName: "sap library",
			ruleset: createValidRules(sRuleId, iNumberOfRules)
		};
	}

	QUnit.module("RuleSetLoader.js methods", {
		beforeEach: function (assert) {
			var done = assert.async();

			Bootstrap.initSupportRules(["true", "silent"], {
				onReady: () => {
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

					done();
				}
			});
		},
		afterEach: function () {
			// Restore _mRuleLibs
			RuleSetLoader._mRuleLibs = deepExtend({}, this._mRuleLibs);
			RuleSet.clearAllRuleSets();
		}
	});

	QUnit.test('When the _mRuleLibs is set', function (assert) {
		// arrange
		var testValue = "test";
		RuleSetLoader._mRuleLibs = testValue;

		// act
		var result = RuleSetLoader.getRuleLibs();

		// assert
		assert.strictEqual(result, testValue, "The return result should be the same as the _mRuleLibs variable");
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("_fetchRuleLib with ruleset of type RuleSet and library not present in the available rulesets", function (assert) {
		// Arrange
		sinon.stub(ObjectPath, "get", function (sLibName) {
			return {
				library: {
					support: createRuleLibWithLibNRules("sap.uxap", "validRule", 1)
				}
			};
		});

		// Act
		RuleSetLoader._fetchRuleLib("sap.uxap");

		//Assert
		assert.ok(RuleSetLoader.getRuleLibs()["sap.uxap"].ruleset instanceof RuleSet, "Should be an instance of RuleSet");
		assert.equal(Object.keys(RuleSetLoader.getRuleLibs()["sap.uxap"].ruleset.getRules()).length, 1, "Should have one fetched rule");

		ObjectPath.get.restore();
	});

	QUnit.test("_fetchRuleLib with 'ruleset' of type RuleSet and library not present", function (assert) {
		// Act
		RuleSetLoader._fetchRuleLib("sap.uxap", createRuleLibWithLib("sap.uxap", "nice name", [createValidRule("validRule")]));

		//Assert
		assert.ok(RuleSetLoader.getRuleLibs()["sap.uxap"].ruleset instanceof RuleSet, "Should be an instance of RuleSet");
		assert.equal(Object.keys(RuleSetLoader.getRuleLibs()["sap.uxap"].ruleset.getRules()).length, 1, "Should have one fetched rule");
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("_fetchRuleLib with ruleset of type RuleSet and library present", function (assert) {
		// Arrange
		sinon.stub(ObjectPath, "get", function (sLibName) {
			return {
				library: {
					support: createRuleLibWithLibNRules("sap.uxap", "anotherValidRule", 2)
				}
			};
		});

		// Setup initial RuleSet
		RuleSetLoader.addRuleLib("sap.uxap", createRuleLibWithLibNRules("sap.uxap", "initialValidRule", 2));

		// Act
		RuleSetLoader._fetchRuleLib("sap.uxap");

		//Assert
		assert.ok(RuleSetLoader.getRuleLibs()["sap.uxap"].ruleset instanceof RuleSet, "Should be an instance of RuleSet");
		assert.equal(Object.keys(RuleSetLoader.getRuleLibs()["sap.uxap"].ruleset.getRules()).length, 4, "Should have four fetched rules");

		ObjectPath.get.restore();
	});

	QUnit.test("_fetchRuleLib with ruleset of type RuleSet and library present", function (assert) {
		// Arrange
		RuleSetLoader.addRuleLib("sap.uxap", createRuleLibWithLibNRules("sap.uxap", "initialValidRule", 2));

		// Act
		RuleSetLoader._fetchRuleLib("sap.uxap", createRuleLibWithLibNRules("sap.uxap", "anotherValidRule", 2));

		//Assert
		assert.ok(RuleSetLoader.getRuleLibs()["sap.uxap"].ruleset instanceof RuleSet, "Should be an instance of RuleSet");
		assert.equal(Object.keys(RuleSetLoader.getRuleLibs()["sap.uxap"].ruleset.getRules()).length, 4, "Should have four fetched rules");
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("_fetchRuleLib with ruleset of type Object and library not present", function (assert) {
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
		assert.ok(RuleSetLoader.getRuleLibs()["sap.uxap"].ruleset instanceof RuleSet, "Should be an instance of RuleSet");
		assert.equal(Object.keys(RuleSetLoader.getRuleLibs()["sap.uxap"].ruleset.getRules()).length, 3, "Should have three fetched rules");

		ObjectPath.get.restore();
	});

	QUnit.test("_fetchRuleLib with ruleset of type Object and library not present", function (assert) {
		// Arrange
		RuleSetLoader.addRuleLib(createRuleLibAsObject("sap.uxap", "validRule", 3));

		// Act
		RuleSetLoader._fetchRuleLib("sap.uxap", createRuleLibAsObject("sap.uxap", "validRule", 3));

		//Assert
		assert.ok(RuleSetLoader.getRuleLibs()["sap.uxap"].ruleset instanceof RuleSet, "Should be an instance of RuleSet");
		assert.equal(Object.keys(RuleSetLoader.getRuleLibs()["sap.uxap"].ruleset.getRules()).length, 3, "Should have three fetched rules");
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("_fetchRuleLib join two types of rulesets", function (assert) {
		// Arrange
		sinon.stub(ObjectPath, "get", function (sLibName) {
			var oRuleSet = createRuleLibAsObject("sap.uxap", "validRule", 2);

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
		RuleSetLoader.addRuleLib("sap.uxap", createRuleLibWithLibNRules("sap.uxap", "initialValidRule", 2));

		// Act
		RuleSetLoader._fetchRuleLib("sap.uxap");

		//Assert
		assert.ok(RuleSetLoader.getRuleLibs()["sap.uxap"].ruleset instanceof RuleSet, "Should be an instance of RuleSet");
		assert.equal(Object.keys(RuleSetLoader.getRuleLibs()["sap.uxap"].ruleset.getRules()).length, 8, "Should have eight fetched rules");

		ObjectPath.get.restore();
	});

	QUnit.test("_fetchRuleLib join two types of rulesets", function (assert) {
		// Arrange
		var oRuleSet = createRuleLibAsObject("sap.uxap", "validRule", 2);
		oRuleSet.ruleset.push(createValidRules("additionalRule", 2));
		oRuleSet.ruleset.push(createValidRule("additionalRule_5"));
		oRuleSet.ruleset.push(createValidRule("additionalRule_6"));

		// Setup initial RuleSet
		RuleSetLoader.addRuleLib("sap.uxap", createRuleLibWithLibNRules("sap.uxap", "initialValidRule", 2));

		// Act
		RuleSetLoader._fetchRuleLib("sap.uxap", oRuleSet);

		//Assert
		assert.ok(RuleSetLoader.getRuleLibs()["sap.uxap"].ruleset instanceof RuleSet, "Should be an instance of RuleSet");
		assert.equal(Object.keys(RuleSetLoader.getRuleLibs()["sap.uxap"].ruleset.getRules()).length, 8, "Should have eight fetched rules");
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
		assert.notOk(RuleSetLoader.getRuleLibs()["sap.test"], "Should be undefined");
		assert.equal(Log.error.callCount, 1, "should have logged an error");

		ObjectPath.get.restore();
		Log.error.restore();
	});

	QUnit.test("_fetchRuleLib with unknown library", function (assert) {
		// Arrange
		sinon.spy(Log, "error");

		// Act
		RuleSetLoader._fetchRuleLib("sap.test");

		//Assert
		assert.notOk(RuleSetLoader.getRuleLibs()["sap.test"], "Should be undefined");
		assert.equal(Log.error.callCount, 1, "should have logged an error");

		// Clean up
		Log.error.restore();
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("_fetchRuleLib with library and no library.support", function (assert) {
		// Arrange
		sinon.stub(ObjectPath, "get", function (sLibName) {
			return {
				library: {
					support: undefined
				}
			};
		});
		sinon.spy(Log, "error");

		// Act
		RuleSetLoader._fetchRuleLib("sap.test");

		//Assert
		assert.notOk(RuleSetLoader.getRuleLibs()["sap.test"], "Should be undefined");
		assert.equal(Log.error.callCount, 1, "Should have logged an error");

		ObjectPath.get.restore();
		Log.error.restore();
	});

	QUnit.test("_fetchRuleLib with library and no library.support", function (assert) {
		// Arrange
		sinon.spy(Log, "error");

		// Act
		RuleSetLoader._fetchRuleLib("sap.test", undefined);

		//Assert
		assert.notOk(RuleSetLoader.getRuleLibs()["sap.test"], "Should be undefined");
		assert.equal(Log.error.callCount, 1, "Should have logged an error");

		// Clean up
		Log.error.restore();
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("_fetchRuleLib twice for the same library with rulesets as array", function (assert) {
		// Arrange
		sinon.stub(ObjectPath, "get", function (sLibName) {
			return {
				library: {
					support: createRuleLibAsObject("sap.test", "validRule", 1)
				}
			};
		});
		sinon.spy(RuleSetLoader, "_createRuleLib");

		// Act
		RuleSetLoader._fetchRuleLib("sap.test");
		RuleSetLoader._fetchRuleLib("sap.test");

		//Assert
		assert.strictEqual(RuleSetLoader._createRuleLib.callCount, 1, "Should have created the ruleset only once");

		ObjectPath.get.restore();
		RuleSetLoader._createRuleLib.restore();
	});

	QUnit.test("_fetchRuleLib twice for the same library with rulesets as array", function (assert) {
		// Arrange
		sinon.spy(RuleSetLoader, "_createRuleLib");

		// Act
		RuleSetLoader._fetchRuleLib("sap.test", createRuleLibAsObject("sap.test", "validRule", 1));
		RuleSetLoader._fetchRuleLib("sap.test", createRuleLibAsObject("sap.test", "validRule", 1));

		//Assert
		assert.strictEqual(RuleSetLoader._createRuleLib.callCount, 1, "Should have created the ruleset only once");

		// Clean up
		RuleSetLoader._createRuleLib.restore();
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
		sinon.stub(VersionInfo, "load", function () {
			return Promise.resolve({
				libraries: [
					{name: "sap.ui.core"},
					{name: "sap.m"},
					{name: "sap.uxap"},
					{name: "sap.ui.table"},
					{name: "sap.ui.fl"},
					{name: "sap.ui.documentation"},
					{name: "sap.ui.unknown"}
				]
			});
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

			VersionInfo.load.restore();
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