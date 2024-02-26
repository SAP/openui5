/*!
 * ${copyright}
 */

/* eslint-disable quotes */
/* global QUnit,sinon */

sap.ui.require([
	"sap/ui/test/gherkin/opa5TestHarness",
	"sap/ui/test/gherkin/StepDefinitions",
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"sap/m/Label",
	"gherkin/testHarnessTests"
], function(opa5TestHarness, StepDefinitions, opaTest, Opa5, Label, testHarnessTests) {
	'use strict';

	var oOpa5 = opa5TestHarness._oOpa5;

	QUnit.module("Opa5 Test Harness Tests", {

		beforeEach : function() {

			var Given = this.Given = {};
			var When = this.When = {};
			var Then = this.Then = {};

			// mocks the test harness's QUnit/Opa5 executions (use this carefully, only for a very limited scope)
			this.fnMockOpa5Setup = function() {
				this.oOpa5TestStub = sinon.stub(opa5TestHarness, '_opaTest', function(scenarioName, callback) {
					callback(Given, When, Then);
				});
				this.oQUnitSkipStub = sinon.stub(QUnit, 'skip', function(scenarioName, callback) {
					callback();
				});
				this.oOpa5WaitForStub = sinon.stub(oOpa5, 'waitFor', function(o) {
					o.success();
				});
				// Outside of a test context, Opa5.assert is undefined so we can't use sinon to mock it directly
				Opa5.assert = {
					ok: sinon.stub()
				};
			};

			// restores QUnit/Opa5 to normal
			this.fnMockOpa5Teardown = function() {
				this.oOpa5TestStub.restore();
				this.oQUnitSkipStub.restore();
				this.oOpa5WaitForStub.restore();
				delete Opa5.assert;
			};

			testHarnessTests.beforeEach(this.fnMockOpa5Setup, this.fnMockOpa5Teardown, opa5TestHarness);
		},

		afterEach: function() {
			testHarnessTests.afterEach();
		}

	});



	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given invalid parameters, when I call 'test', then I get an error", function(assert) {

		var sObjectError = "opa5TestHarness.test: input all arguments via a single object";
		var sFeaturePathError = "opa5TestHarness.test: parameter 'featurePath' must be a valid string";
		var sStepsErrorMissing = "opa5TestHarness.test: if parameter 'generateMissingSteps' is not true then parameter 'steps' must be a valid StepDefinitions constructor";
		var sStepsError = "opa5TestHarness.test: if specified, parameter 'steps' must be a valid StepDefinitions constructor";
		var sGenerateMissingStepsError = "opa5TestHarness.test: if specified, parameter 'generateMissingSteps' must be a valid boolean";

		assert.throws( function() {
			opa5TestHarness.test();
		}, function(oError) {
			return oError.message === sObjectError;
		},
			"call 'test' with no parameters at all"
		);

		assert.throws( function() {
			opa5TestHarness.test(42);
		}, function(oError) {
			return oError.message === sObjectError;
		},
			"call 'test' with a non-object parameter"
		);

		assert.throws( function( ) {
			opa5TestHarness.test({steps: new function(){}()});
		}, function(oError) {
			return oError.message === sFeaturePathError;
		},
			"'featurePath' parameter is omitted"
		);

		assert.throws( function() {
			opa5TestHarness.test({featurePath: 12, steps: function(){}});
		}, function(oError) {
			return oError.message === sFeaturePathError;
		},
			"'featurePath' parameter is not a string"
		);

		assert.throws( function() {
			opa5TestHarness.test({featurePath: 'hello world'});
		}, function(oError) {
			return oError.message === sStepsErrorMissing;
		},
			"'steps' parameter is omitted and generateMissingSteps has the default value of false"
		);

		assert.throws( function() {
			opa5TestHarness.test({featurePath: 'hello world', steps: 12});
		}, function(oError) {
			return oError.message === sStepsError;
		},
			"'steps' parameter is not a function"
		);

		assert.throws( function() {
			opa5TestHarness.test({featurePath: 'goodbye cruel world!', steps: Error});
		}, function(oError) {
			return oError.message === sStepsError;
		},
			"'steps' parameter is not a StepDefinitions constructor (also not a SAPUI5 object)"
		);

		assert.throws( function() {
			opa5TestHarness.test({featurePath: 'goodbye cruel world!', steps: Label});
		}, function(oError) {
			return oError.message === sStepsError;
		},
			"'steps' parameter is not a StepDefinitions constructor (but is a SAPUI5 object)"
		);

		// Make sure it does not throw an exception to pass in the parent StepDefinitions class rather than the expected child
		opa5TestHarness.test({featurePath: 'Feature: success', steps: StepDefinitions});
		assert.ok(true, "'steps' parameter can be a direct StepDefinitions constructor");

		assert.throws( function() {
			opa5TestHarness.test({featurePath: 'test feature path', steps: StepDefinitions, generateMissingSteps: 'str'});
		}, function(oError) {
			return oError.message === sGenerateMissingStepsError;
		},
			"'generateMissingSteps' parameter is not a valid boolean"
		);

		assert.throws( function() {
			opa5TestHarness.test({featurePath: 'test feature path', generateMissingSteps: false});
		}, function(oError) {
			return oError.message === sStepsErrorMissing;
		},
			"'generateMissingSteps' parameter is set to false when 'steps' was not assigned"
		);
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("fnAlternateTestStepGenerator: simple function call", function(assert) {

		var oExpectedTestStep = {
			isMatch: true,
			text: "I do a smoke test",
			regex: /Generated Step/,
			parameters: [],
			_sToEval: "Given.iDoASmokeTest();"
		};

		var oActualTestStep = opa5TestHarness._fnAlternateTestStepGenerator({
			keyword: "Given",
			text: "I do a smoke test"
		});

		delete oActualTestStep.func; // too difficult to test the function
		assert.deepEqual(oActualTestStep, oExpectedTestStep);
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("fnAlternateTestStepGenerator: page object", function(assert) {

		var oExpectedTestStep = {
			isMatch: true,
			text: "on page 1: I should see the page 1 text",
			regex: /Generated Step/,
			parameters: [],
			_sToEval: "Then.onPage1.iShouldSeeThePage1Text();"
		};

		var oActualTestStep = opa5TestHarness._fnAlternateTestStepGenerator({
			keyword: "Then",
			text: "on page 1: I should see the page 1 text"
		});

		delete oActualTestStep.func; // too difficult to test the function
		assert.deepEqual(oActualTestStep, oExpectedTestStep);
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Smoke test Page Object logging when some steps are generated + test step generation", function(assert) {
		var sText = [
			"Feature: The meaning of life is hard to figure out, is it really 42?",
			"",
			"  Scenario: Determine the meaning of life",
			"    Given the pursuit of happiness is a good thing",
			"    Then I should at least try to be happy"
		].join("\n");

		var fSteps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(/^the pursuit of happiness is a good thing$/i, function() {});
				// deliberately not registered: "I should at least try to be happy"
			}
		});

		this.Then.iShouldAtLeastTryToBeHappy = sinon.spy();

		this.fnMockOpa5Setup();
		opa5TestHarness.test({
			featurePath: sText,
			steps: fSteps,
			generateMissingSteps: true
		});
		this.fnMockOpa5Teardown();

		assert.deepEqual(testHarnessTests.aLogs, [
			"[GHERKIN] Running feature: 'Feature: The meaning of life is hard to figure out, is it really 42?'",
			"[GHERKIN] Running scenario: 'Scenario: Determine the meaning of life'",
			"[GHERKIN] Running step: text='the pursuit of happiness is a good thing' regex='/^the pursuit of happiness is a good thing$/i'",
			"[GHERKIN] Running step: text='I should at least try to be happy' regex='/Generated Step/'",
			"[GHERKIN] Generated Step: Then.iShouldAtLeastTryToBeHappy();"
		], "Logs are correct");
		assert.ok(this.Then.iShouldAtLeastTryToBeHappy.calledOnce, "Verify generated function was called once");
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given generate missing test steps + steps file, when function DNE build fails immediately", function(assert) {

		assert.expect(5);

		var sText = [
			"Feature: The meaning of life is hard to figure out, is it really 42?",
			"",
			"  Scenario: Determine the meaning of life",
			"    Given the pursuit of happiness is a good thing",
			"    Given happiness is possible",
			"    Then I should at least try to be happy",
			"    But not too happy, or that would be weird",
			"    Then being sad sometimes is ok too"
		].join("\n");

		var fPursuitOfHappiness = sinon.spy();
		var fNotTooHappy = sinon.spy();

		var fSteps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(/^the pursuit of happiness is a good thing$/i, fPursuitOfHappiness);
				// deliberately not registered: "happiness is possible"
				// deliberately not registered: "I should at least try to be happy"
				this.register(/^not too happy, or that would be weird$/i, fNotTooHappy);
				// deliberately not registered: "being sad sometimes is ok too"
			}
		});

		this.Given.happinessIsPossible = sinon.spy();
		// this.Then.iShouldAtLeastTryToBeHappy deliberately does not exist!
		this.Then.beingSadSometimesIsOkToo = sinon.spy();

		this.fnMockOpa5Setup();
		assert.throws( function() {
			opa5TestHarness.test({
				featurePath: sText,
				steps: fSteps,
				generateMissingSteps: true
			});
		}, function(oError) {
			// The error message is browser dependent, but it will always include the function call
			return !!oError.message.match(/.*?iShouldAtLeastTryToBeHappy.*/);
		},
			"Verify that missing Page Object function fails build"
		);
		this.fnMockOpa5Teardown();

		assert.ok(fPursuitOfHappiness.calledOnce, "Verify fPursuitOfHappiness called once before");
		assert.ok(this.Given.happinessIsPossible.calledOnce, "Verify happinessIsPossible called once before");
		assert.notOk(fNotTooHappy.called, "Verify fNotTooHappy not called after");
		assert.notOk(this.Then.beingSadSometimesIsOkToo.called, "Verify beingSadSometimesIsOkToo not called after");
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given generate missing test steps + NO steps file, when function exists build passes", function(assert) {

		var sText = [
			"Feature: HANA is the most powerful database in the UNIVERSE (verse... verse...)",
			"",
			"  Scenario: Show off HANA",
			"    Given an analytics app",
			"    When on the app: you power it with HANA",
			"    Then in the user's opinion: the app executes at ludicrous speed!"
		].join("\n");

		this.Given.anAnalyticsApp = sinon.spy();
		this.When.onTheApp = {youPowerItWithHana: sinon.spy()};
		this.Then.inTheUsersOpinion = {theAppExecutesAtLudicrousSpeed: sinon.spy()};

		this.fnMockOpa5Setup();
		opa5TestHarness.test({
			featurePath: sText,
			generateMissingSteps: true
		});
		this.fnMockOpa5Teardown();

		assert.ok(this.Given.anAnalyticsApp.calledOnce, "Verify anAnalyticsApp called once");
		assert.ok(this.When.onTheApp.youPowerItWithHana.calledOnce, "Verify youPowerItWithHana called once");
		assert.ok(this.Then.inTheUsersOpinion.theAppExecutesAtLudicrousSpeed.calledOnce, "Verify theAppExecutesAtLudicrousSpeed called once");
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given generate missing test steps + NO steps file, when function DNE build fails immediately", function(assert) {

		assert.expect(3);

		var sText = [
			"Feature: HANA is the most powerful database in the UNIVERSE (verse... verse...)",
			"",
			"  Scenario: Show off HANA",
			"    Given an analytics app",
			"    When on the app: you power it with HANA",
			"    Then in the user's opinion: the app executes at ludicrous speed!"
		].join("\n");

		this.Given.anAnalyticsApp = sinon.spy();
		// this.When.onTheApp = {youPowerItWithHana: sinon.spy()}; deliberately does not exist!
		this.Then.inTheUsersOpinion = {theAppExecutesAtLudicrousSpeed: sinon.spy()};

		this.fnMockOpa5Setup();
		assert.throws( function() {
			opa5TestHarness.test({
				featurePath: sText,
				generateMissingSteps: true
			});
		}, function(oError) {
			// The error message is browser dependent, but it will always include the missing object or function
			return !!oError.message.match(/.*?onTheApp.*/) || !!oError.message.match(/.*?youPowerItWithHana.*/);
		},
			"Verify that missing Page Object function fails build"
		);
		this.fnMockOpa5Teardown();

		assert.ok(this.Given.anAnalyticsApp.calledOnce, "Verify anAnalyticsApp called once before");
		assert.notOk(this.Then.inTheUsersOpinion.theAppExecutesAtLudicrousSpeed.called, "Verify theAppExecutesAtLudicrousSpeed not called after");
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	testHarnessTests.runTests();

});
