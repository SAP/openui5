/*!
 * ${copyright}
 */

/* eslint-disable quotes */
/* global QUnit */

sap.ui.define([
	"sap/ui/test/gherkin/simpleGherkinParser",
	"sap/ui/test/gherkin/StepDefinitions",
	"sap/ui/test/gherkin/GherkinTestGenerator"
], function(simpleGherkinParser, StepDefinitions, GherkinTestGenerator) {
	"use strict";

	QUnit.module("Gherkin Test Generator Tests", {
		beforeEach : function(assert) {
			QUnit.dump.maxDepth = 15;
			this.parser = simpleGherkinParser;

			this.assertAllTestsAreMatchedAndSkipped = function(testScenario) {
				for (var i = 0; i < testScenario.testSteps.length; ++i) {
					var testStep = testScenario.testSteps[i];
					assert.ok(testStep.text.match(/^\(SKIPPED\)/), "text: " + testScenario.name + " -- " + testStep.text);
					assert.ok(testStep.isMatch, "isMatch: " + testScenario.name + " -- " + testStep.text);
					assert.ok(testStep.skip, "skip: " + testScenario.name + " -- " + testStep.text);
				}
			};
		},
		afterEach: function() {}
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Smoke test 'generate' method", function(assert) {

		var text = [
			"Feature: Serve coffee",
			"  Scenario: Buy last coffee",
			"    Then I should be served a coffee"
		].join("\n");
		var feature = this.parser.parse(text);

		var stepRegex = /^I should be served a coffee$/i;
		var stepFunction = function() {};
		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(stepRegex, stepFunction);
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var actualFeatureTest = testGenerator.generate();
		var expectedFeatureTest = {
			name: "Feature: Serve coffee",
			skip: false,
			wip: false,
			testScenarios: [{
				name: "Scenario: Buy last coffee",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "I should be served a coffee",
					regex: stepRegex,
					parameters: [],
					func: stepFunction
				}]
			}]
		};

		assert.deepEqual(actualFeatureTest, expectedFeatureTest);
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Scenario Outline should generate the scenario with concrete values", function(assert) {
		var text = [
			"Feature: Give cups of coffee to users",
			"",
			"  Scenario Outline: Coffee changes peoples moods",
			"    Given the user '<<user>>' has been given <(?:number)?> cups of coffee",
			"    Then he should be '<(mood)>'",
			"",
			"    Examples:",
			"      | <user>  | (?:number)? | (mood)      |",
			"      | Michael | 1           | happy       |",
			"      | Elvis   | 4           | electrified |",
			"      | John    | 2           | sad         |",
			""
		].join("\n");

		var feature = this.parser.parse(text);

		var regex1 = /^the user '(.*?)' has been given (.*?) cups of coffee$/i;
		var function1 = function(user, number) {};
		var regex2 = /^he should be '(.*?)'$/i;
		var function2 = function(mood) {};
		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(regex1, function1);
				this.register(regex2, function2);
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var actualFeatureTest = testGenerator.generate();
		var expectedFeatureTest = {
			name: "Feature: Give cups of coffee to users",
			skip: false,
			wip: false,
			testScenarios: [{
				name: "Scenario Outline: Coffee changes peoples moods #1",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "the user 'Michael' has been given 1 cups of coffee",
					regex: regex1,
					parameters: ["Michael", "1"],
					func: function1
				},{
					isMatch: true,
					skip: false,
					text: "he should be 'happy'",
					regex: regex2,
					parameters: ["happy"],
					func: function2
				}]
			},{
				name: "Scenario Outline: Coffee changes peoples moods #2",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "the user 'Elvis' has been given 4 cups of coffee",
					regex: regex1,
					parameters: ["Elvis", "4"],
					func: function1
				},{
					isMatch: true,
					skip: false,
					text: "he should be 'electrified'",
					regex: regex2,
					parameters: ["electrified"],
					func: function2
				}]
			},{
				name: "Scenario Outline: Coffee changes peoples moods #3",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "the user 'John' has been given 2 cups of coffee",
					regex: regex1,
					parameters: ["John", "2"],
					func: function1
				},{
					isMatch: true,
					skip: false,
					text: "he should be 'sad'",
					regex: regex2,
					parameters: ["sad"],
					func: function2
				}]
			}]
		};

		assert.deepEqual(actualFeatureTest, expectedFeatureTest);
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Background gets run before every scenario in the feature", function(assert) {

		var text = [
			"Feature: Serve expensive coffee",
			"    Coffee is a luxury and as such it should be bloody expensive",
			"",
			"  Background:",
			"    Given coffee costs $18 per cup",
			"",
			"  Scenario: Buy first coffee",
			"    Then I should be served a coffee",
			"",
			"  Scenario: Buy second coffee",
			"    Then I should be served a second coffee"
		].join("\n");

		var feature = this.parser.parse(text);

		var backgroundRegex = /^coffee costs \$18 per cup$/i;
		var backgroundFunction = function() {};
		var normalRegex1 = /^I should be served a coffee$/i;
		var normalFunction1 = function() {};
		var normalRegex2 = /^I should be served a second coffee$/i;
		var normalFunction2 = function() {};
		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(backgroundRegex, backgroundFunction);
				this.register(normalRegex1, normalFunction1);
				this.register(normalRegex2, normalFunction2);
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var actualFeatureTest = testGenerator.generate();
		var expectedFeatureTest = {
			name: "Feature: Serve expensive coffee",
			skip: false,
			wip: false,
			testScenarios: [{
				name: "Scenario: Buy first coffee",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "coffee costs $18 per cup",
					regex: backgroundRegex,
					parameters: [],
					func: backgroundFunction
				},{
					isMatch: true,
					skip: false,
					text: "I should be served a coffee",
					regex: normalRegex1,
					parameters: [],
					func: normalFunction1
				}]
			},{
				name: "Scenario: Buy second coffee",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "coffee costs $18 per cup",
					regex: backgroundRegex,
					parameters: [],
					func: backgroundFunction
				},{
					isMatch: true,
					skip: false,
					text: "I should be served a second coffee",
					regex: normalRegex2,
					parameters: [],
					func: normalFunction2
				}]
			}]
		};

		assert.deepEqual(actualFeatureTest, expectedFeatureTest);
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("@wip tag on feature prevents whole feature from being run", function(assert) {

		var text = [
			"@wip",
			"Feature: Serve quantum coffee",
			"    Coffee is a luxury and as such it should be bloody expensive",
			"",
			"  Scenario Outline: Coffee changes peoples moods if you are ready",
			"    Given the user '<user>' has been given <number> cups of coffee",
			"    Then he should be '<mood>'",
			"",
			"    Examples:",
			"      | user    | number | mood  |",
			"      | Michael | 1      | happy |",
			"",
			"  Background:",
			"    Given coffee costs $18 per cup",
			"",
			"  Scenario: Buy expensive coffee once barista is ready",
			"    Then I should be served a coffee"
		].join("\n");

		var feature = this.parser.parse(text);

		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(/^coffee costs \$18 per cup$/i, function() {});
				this.register(/^I should be served a coffee$/i, function() {});
				this.register(/^the user '(.*?)' has been given (.*?) cups of coffee$/i, function() {});
				this.register(/^he should be '(.*?)'$/i, function() {});
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var featureTest = testGenerator.generate();

		assert.strictEqual(featureTest.name, "(WIP) Feature: Serve quantum coffee", "@wip tag on feature 01");
		assert.strictEqual(featureTest.skip, true, "@wip tag on feature 02");
		assert.strictEqual(featureTest.wip, true, "@wip tag on feature 03");
		assert.strictEqual(featureTest.testScenarios.length, 2, "@wip tag on feature 04");

		assert.strictEqual(featureTest.testScenarios[0].name,
			"(WIP) Scenario Outline: Coffee changes peoples moods if you are ready", "@wip tag on feature 05");
		assert.strictEqual(featureTest.testScenarios[0].wip, true, "@wip tag on feature 06");
		assert.strictEqual(featureTest.testScenarios[0].testSteps.length, 3, "@wip tag on feature 07");
		this.assertAllTestsAreMatchedAndSkipped(featureTest.testScenarios[0]);

		assert.strictEqual(featureTest.testScenarios[1].name, "(WIP) Scenario: Buy expensive coffee once barista is ready",
			"@wip tag on feature 08");
		assert.strictEqual(featureTest.testScenarios[1].wip, true, "@wip tag on feature 09");
		assert.strictEqual(featureTest.testScenarios[1].testSteps.length, 2, "@wip tag on feature 10");
		this.assertAllTestsAreMatchedAndSkipped(featureTest.testScenarios[1]);
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("@wip tag on scenario prevents only that scenario from running", function(assert) {

		var text = [
			"Feature: Schrödinger's coffee",
			"    Leave a barista in a box for a while with a nuclear isotope,",
			"    open the box later and what do you see when the wave",
			"    function collapses?",
			"",
			"  Background:",
			"    Given that quantum phenomena exist at the macroscopic level",
			"",
			"  Scenario: Buy expensive coffee when the barista is alive",
			"    Then I should expect a live barista",
			"",
			"  @wip",
			"  Scenario: Buy expensive coffee when the barista is dead",
			"    Then I should expect a dead barista"
		].join("\n");

		var feature = this.parser.parse(text);

		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(/^that quantum phenomena exist at the macroscopic level$/i, function() {});
				this.register(/^I should expect a live barista$/i, function() {});
				this.register(/^I should expect a dead barista$/i, function() {});
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var featureTest = testGenerator.generate();

		assert.strictEqual(featureTest.skip, false, "@wip tag on scenario 01");
		assert.strictEqual(featureTest.wip, false, "@wip tag on scenario 02");
		assert.strictEqual(featureTest.testScenarios.length, 2, "@wip tag on scenario 03");

		assert.strictEqual(featureTest.testScenarios[0].name, "Scenario: Buy expensive coffee when the barista is alive",
			"@wip tag on scenario 04");
		assert.strictEqual(featureTest.testScenarios[0].wip, false, "@wip tag on scenario 05");
		assert.strictEqual(featureTest.testScenarios[0].testSteps.length, 2, "@wip tag on scenario 06");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[0].text, "that quantum phenomena exist at the macroscopic level",
			"@wip tag on scenario 07");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[0].isMatch, true, "alive background isMatch");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[0].skip, false, "alive background skip");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[1].text, "I should expect a live barista");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[1].isMatch, true, "alive isMatch");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[1].skip, false, "alive skip");

		assert.strictEqual(featureTest.testScenarios[1].name, "(WIP) Scenario: Buy expensive coffee when the barista is dead",
			"@wip tag on scenario 08");
		assert.strictEqual(featureTest.testScenarios[1].wip, true, "@wip tag on scenario 09");
		assert.strictEqual(featureTest.testScenarios[1].testSteps.length, 2, "@wip tag on scenario 10");
		this.assertAllTestsAreMatchedAndSkipped(featureTest.testScenarios[1]);
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Parameters and tables are parsed and passed to steps in test suite", function(assert) {

		var text = [
			"Feature: Give coffee to users",
			"",
			"  Scenario: Coffee makes people happy",
			"    Given these awesome Users:",
			"      | Name            | Date of Birth   |",
			"      | Michael Jackson | August 29, 1958 |",
			"      | Elvis           | January 8, 1935 |",
			"      | John Lennon     | October 9, 1940 |",
			"    And when I give them the coffee price list:",
			"      | Coffee Blend   | Price |",
			"      | Dark           | $18   |",
			"      | Moka           | $23   |",
			"      | Columbian      | $1400 |",
			"    Then they should be happy"
		].join("\n");

		var feature = this.parser.parse(text);

		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(/^these (.*?) users:?$/i, function() {});
				this.register(/^when I give them the coffee price list:?$/i, function() {});
				this.register(/^(.*?) should be (.*?)$/i, function() {});
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var featureTest = testGenerator.generate();

		assert.strictEqual(featureTest.testScenarios.length, 1, "Parameters and tables are parsed and passed 01");
		assert.strictEqual(featureTest.testScenarios[0].testSteps.length, 3, "Parameters and tables are parsed and passed 02");

		assert.strictEqual(featureTest.testScenarios[0].testSteps[0].text, "these awesome Users:",
			"Parameters and tables are parsed and passed 03");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[0].parameters.length, 2,
			"Parameters and tables are parsed and passed 04");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[0].parameters[0], "awesome",
			"Parameters and tables are parsed and passed 05");
		assert.deepEqual(featureTest.testScenarios[0].testSteps[0].parameters[1], [
			["Name", "Date of Birth"],
			["Michael Jackson","August 29, 1958"],
			["Elvis", "January 8, 1935"],
			["John Lennon", "October 9, 1940"]
		], "date of birth table is correct");

		assert.strictEqual(featureTest.testScenarios[0].testSteps[1].text, "when I give them the coffee price list:",
			"Parameters and tables are parsed and passed 06");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[1].parameters.length, 1,
			"Parameters and tables are parsed and passed 07");
		assert.deepEqual(featureTest.testScenarios[0].testSteps[1].parameters[0], [
			["Coffee Blend", "Price"],
			["Dark", "$18"],
			["Moka", "$23"],
			["Columbian", "$1400"]
		], "coffee blend table is correct");

		assert.strictEqual(featureTest.testScenarios[0].testSteps[2].text, "they should be happy",
			"Parameters and tables are parsed and passed 08");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[2].parameters.length, 2,
			"Parameters and tables are parsed and passed 09");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[2].parameters[0], "they", "correct person");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[2].parameters[1], "happy", "correct emotion");
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given missing step definition then that step and all remaining steps are skipped", function(assert) {

		var text = [
			"Feature: Serve humanity",
			"",
			"  Background:",
			"    Given kindness to strangers is a virtue",
			"",
			"  Scenario: Wash their feet",
			"    Given I am a very good person",
			"    And I encounter a person whose feet are very dirty",
			"    And they are classified as a 'Category 3 Unwashed Mass'",
			"    Then I should wash their feet"
		].join("\n");

		var feature = this.parser.parse(text);

		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(/^kindness to strangers is a virtue$/i, function() {});
				this.register(/^I am a very good person$/i, function() {});
				this.register(/^they are classified as a '(.*?)'$/i, function() {});
				this.register(/^I should wash their feet$/i, function() {});
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var featureTest = testGenerator.generate();

		assert.strictEqual(featureTest.testScenarios.length, 1, "Test 001");
		assert.strictEqual(featureTest.testScenarios[0].testSteps.length, 5, "Test 002");

		assert.strictEqual(featureTest.testScenarios[0].testSteps[0].text, "kindness to strangers is a virtue", "Test 003");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[0].isMatch, true, "Test 004");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[0].skip, false, "Test 005");

		assert.strictEqual(featureTest.testScenarios[0].testSteps[1].text, "I am a very good person", "Test 006");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[1].isMatch, true, "Test 007");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[1].skip, false, "Test 008");

		assert.strictEqual(featureTest.testScenarios[0].testSteps[2].text,
			"(NOT FOUND) I encounter a person whose feet are very dirty", "Test 009");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[2].isMatch, false, "Test 010");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[2].skip, true, "Test 011");

		assert.strictEqual(featureTest.testScenarios[0].testSteps[3].text,
			"(SKIPPED) they are classified as a 'Category 3 Unwashed Mass'", "Test 012");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[3].isMatch, true, "Test 013");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[3].skip, true, "skip unwashed mass");

		assert.strictEqual(featureTest.testScenarios[0].testSteps[4].text, "(SKIPPED) I should wash their feet", "Test 014");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[4].isMatch, true, "Test 015");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[4].skip, true, "skipped feet");
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given missing background definition then all steps are skipped", function(assert) {

		var text = [
			"Feature: Serve humanity",
			"",
			"  Background:",
			"    Given meanness to strangers is ok",
			"",
			"  Scenario: Wash their feet",
			"    Given I should wash their feet",
			"    But I don't feel like it"
		].join("\n");

		var feature = this.parser.parse(text);

		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(/^I should wash their feet$/i, function() {});
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var featureTest = testGenerator.generate();

		assert.strictEqual(featureTest.testScenarios.length, 1, "Test 016");
		assert.strictEqual(featureTest.testScenarios[0].wip, false, "Test 017");
		assert.strictEqual(featureTest.testScenarios[0].testSteps.length, 3, "Test 018");

		assert.strictEqual(featureTest.testScenarios[0].testSteps[0].text, "(NOT FOUND) meanness to strangers is ok", "Test 019");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[0].isMatch, false, "Test 020");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[0].skip, true, "Test 021");

		assert.strictEqual(featureTest.testScenarios[0].testSteps[1].text, "(SKIPPED) I should wash their feet", "Test 022");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[1].isMatch, true, "Test 023");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[1].skip, true, "Test 024");

		// test that further unfound testSteps still say "(NOT FOUND)" instead of "(SKIPPED)"
		assert.strictEqual(featureTest.testScenarios[0].testSteps[2].text, "(NOT FOUND) I don't feel like it", "Test 025");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[2].isMatch, false, "Test 026");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[2].skip, true, "Test 027");
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given a non-WIP feature, calling 'tearDown' MUST execute 'closeApplication'", function(assert) {

		assert.expect(2);

		var text = [
			"Feature: Serve humanity",
			"  Scenario: Do something already",
			"    Then I do something (finally)"
		].join("\n");

		var feature = this.parser.parse(text);

		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(/^I do something \(finally\)$/i, function() {});
			},
			closeApplication: function() {
				assert.ok(true, "Given a non-WIP feature, calling 'tearDown' MUST execute 'closeApplication'");
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var featureTest = testGenerator.generate();
		assert.strictEqual(featureTest.name, "Feature: Serve humanity", "Test 028");
		testGenerator.setUp();
		testGenerator.execute(featureTest.testScenarios[0].testSteps[0]);
		testGenerator.tearDown();
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given feature with all @wip scenarios, calling 'tearDown' must NOT execute 'closeApplication'", function(assert) {

		assert.expect(2);

		var text = [
			"Feature: Serve humanity",
			"  @wip",
			"  Scenario: Do something already",
			"    Then I do something (finally)",
			"  @wip",
			"  Scenario: Do something else if you dare",
			"    Then I do something (finally)"
		].join("\n");

		var feature = this.parser.parse(text);

		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(/^I do something \(finally\)$/i, function() {});
			},
			closeApplication: function() {
				assert.ok(false, "Given feature with all @wip scenarios, calling 'tearDown' must NOT execute 'closeApplication'");
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var featureTest = testGenerator.generate();
		assert.strictEqual(featureTest.name, "Feature: Serve humanity", "Test 029");
		assert.strictEqual(featureTest.testScenarios.length, 2, "Test 030");
		for (var i = 0; i < featureTest.testScenarios.length; ++i) {
			testGenerator.setUp();
			testGenerator.execute(featureTest.testScenarios[i].testSteps[0]);
			testGenerator.tearDown();
		}
	});



	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given feature with some skipped scenarios, calling 'tearDown' must execute 'closeApplication' only for " +
			 "non-skipped scenarios", function(assert) {

		assert.expect(4);

		var expectCloseApplication = false;

		var text = [
			"Feature: Serve humanity",
			"  Scenario: Do something",
			"    Then I do something (finally)",
			"  @wip",
			"  Scenario: Do something else if you dare",
			"    Then I do something (finally)",
			"  Scenario: Do something already",
			"    Then I do something (finally)"
		].join("\n");

		var feature = this.parser.parse(text);

		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(/^I do something \(finally\)$/i, function() {});
			},
			closeApplication: function() {
				assert.ok(expectCloseApplication, "calling 'tearDown' must execute 'closeApplication' only for non-skipped scenarios");
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var featureTest = testGenerator.generate();
		assert.strictEqual(featureTest.name, "Feature: Serve humanity", "Test 031");
		assert.strictEqual(featureTest.testScenarios.length, 3, "Test 032");
		for (var i = 0; i < featureTest.testScenarios.length; ++i) {
			testGenerator.setUp();
			expectCloseApplication = testGenerator.execute(featureTest.testScenarios[i].testSteps[0]);
			testGenerator.tearDown();
		}
	});



	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given @wip feature, calling 'tearDown' must NOT execute 'closeApplication'", function(assert) {

		assert.expect(1);

		var text = [
			"@wip",
			"Feature: Serve humanity",
			"  Scenario: Do something already",
			"    Then I do something (finally)"
		].join("\n");

		var feature = this.parser.parse(text);

		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(/^I do something \(finally\)$/i, function() {});
			},
			closeApplication: function() {
				assert.ok(false, "Given @wip feature, calling 'tearDown' must NOT execute 'closeApplication'");
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var featureTest = testGenerator.generate();
		assert.strictEqual(featureTest.name, "(WIP) Feature: Serve humanity", "Test 033");
		testGenerator.setUp();
		testGenerator.execute(featureTest.testScenarios[0].testSteps[0]);
		testGenerator.tearDown();
	});



	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given feature with no scenarios, calling 'tearDown' must NOT execute 'closeApplication'", function(assert) {

		assert.expect(1);

		var text = [
			"Feature: Serve humanity"
		].join("\n");

		var feature = this.parser.parse(text);

		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			closeApplication: function() {
				assert.ok(false, "Given feature with no scenarios, calling 'tearDown' must NOT execute 'closeApplication'");
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var featureTest = testGenerator.generate();
		assert.strictEqual(featureTest.name, "Feature: Serve humanity", "Test 034");
		testGenerator.setUp();
		testGenerator.tearDown();
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Test steps share a context only within a single scenario", function(assert) {

		assert.expect(4);

		var text = [
			"Feature: Schrödinger's coffee",
			"    Leave a barista in a box for a while with a nuclear isotope,",
			"    open the box later and what do you see when the wave",
			"    function collapses?",
			"",
			"  Scenario: Buy expensive coffee when the barista is dead",
			"    Given the isotope emitted an alpha particle",
			"    And the poison was released",
			"    Then I should expect a dead barista",
			"",
			"  Scenario: Buy expensive coffee when the barista is alive",
			"    Given the isotope did not emit an alpha particle",
			"    Then I should expect a live barista"
		].join("\n");

		var feature = this.parser.parse(text);

		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(/^the isotope (emitted|did not emit) an alpha particle$/i, function(emitted) {
					this.emitted = (emitted === "emitted");
				});
				this.register(/^the poison was released$/i, function() {
					this.poisonReleased = true;
				});
				this.register(/^I should expect a (live|dead) barista$/i, function(shouldBeDead) {
					shouldBeDead = (shouldBeDead === "dead");
					assert.ok(shouldBeDead === !!this.poisonReleased, "test that context was cleared between scenarios");
					assert.ok(shouldBeDead === this.emitted, "test that context was retained while inside one scenario");
				});
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var featureTest = testGenerator.generate();
		featureTest.testScenarios.forEach(function(testScenario) {
			testGenerator.setUp();
			testScenario.testSteps.forEach(function(testStep) {
				testGenerator.execute(testStep);
			});
			testGenerator.tearDown();
		});
	});



	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Test exceptions", function(assert) {

		var text = [
			"Feature: Serve expensive coffee",
			"",
			"  Scenario: Buy first coffee",
			"    Then I should be served a coffee"
		].join("\n");

		var feature = this.parser.parse(text);

		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(/^I should be served a coffee$/i, function() {});
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);

		assert.throws( function(){
			testGenerator.execute();
		}, function(error) {
			return error.message === "Run 'generate' before calling 'execute'";
		},
			"call 'execute' too early"
		);

		/*var featureTest = */testGenerator.generate();

		assert.throws( function(){
			testGenerator.execute();
		}, function(error) {
			return error.message === "Input parameter 'oTestStep' is not a valid TestStep object.";
		},
			"call 'execute' with undefined test step"
		);

		assert.throws( function(){
			testGenerator.execute(100);
		}, function(error) {
			return error.message === "Input parameter 'oTestStep' is not a valid TestStep object.";
		},
			"call \"execute\" with test step that's not an object"
		);

		assert.throws( function(){
			testGenerator.execute({});
		}, function(error) {
			return error.message === "Input parameter 'oTestStep' is not a valid TestStep object.";
		},
			"call \"execute\" with an object, but it's not a TestStep"
		);

		assert.ok(testGenerator.execute({skip: false, func: function(){}, parameters: []}), "test exceptions");
	});



	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Test alternate test step generator", function(assert) {

		var text = [
			"Feature: Serve expensive coffee",
			"",
			"  Scenario: Buy first coffee",
			"    Then I should be served a coffee",
			"    And this step does not exist in the steps file",
			"    And the generator will not match this one",
			"    And I should be served a coffee"
		].join("\n");

		var feature = this.parser.parse(text);

		var normalStepFunction = function() {};
		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(/^I should be served a coffee$/i, normalStepFunction);
			}
		});

		var alternateStepFunction = function() {};
		var testStepGenerator = function(oStep) {
			var isMatch = (oStep.text !== "the generator will not match this one");
			return {
				isMatch: isMatch,
				text: (isMatch) ? oStep.text : "(NOT FOUND) " + oStep.text,
				regex: /generated/,
				parameters: [],
				func: alternateStepFunction
			};
		};

		var testGenerator = new GherkinTestGenerator(feature, steps, testStepGenerator);
		var featureTest = testGenerator.generate();

		// if we match the step with a Step Definition, then we expect that it should be used
		assert.strictEqual(featureTest.testScenarios[0].testSteps[0].text, "I should be served a coffee", "Test 035");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[0].func, normalStepFunction, "Test 036");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[0].skip, false, "Test 037");

		// If we fail to match, then we expect to use a generated step
		assert.strictEqual(featureTest.testScenarios[0].testSteps[1].text, "this step does not exist in the steps file", "Test 038");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[1].func, alternateStepFunction, "Test 039");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[1].skip, false, "Test 040");

		// If we fail to match and the generated step says it"s not a match, then it should be skipped!
		assert.strictEqual(featureTest.testScenarios[0].testSteps[2].text, "(NOT FOUND) the generator will not match this one",
			"Test 041");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[2].func, alternateStepFunction, "Test 042");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[2].skip, true, "Test 043");

		// Since the third step was not found, this one should be skipped
		assert.strictEqual(featureTest.testScenarios[0].testSteps[3].text, "(SKIPPED) I should be served a coffee", "Test 044");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[3].func, normalStepFunction, "Test 045");
		assert.strictEqual(featureTest.testScenarios[0].testSteps[3].skip, true, "Test 046");
	});



	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Test invalid input to constructor", function(assert) {

		var badFeatureError = "GherkinTestGenerator constructor: parameter 'vFeature' must be a valid String or a valid Feature object";
		var badStepDefsError = "GherkinTestGenerator constructor: parameter 'fnStepDefsConstructor' must be a valid StepDefinitions constructor";
		var badAltGeneratorError = "GherkinTestGenerator constructor: if specified, parameter 'fnAlternateTestStepGenerator' must be a valid Function";


		assert.throws( function(){
			return new GherkinTestGenerator();
		}, function(error) {
			return error.message === badFeatureError;
		},
			"first parameter is not specified"
		);

		assert.throws( function(){
			return new GherkinTestGenerator(1000);
		}, function(error) {
			return error.message === badFeatureError;
		},
			"first parameter is not a String or Object"
		);

		assert.throws( function(){
			return new GherkinTestGenerator({});
		}, function(error) {
			return error.message === badFeatureError;
		},
			"first parameter is an object, but not a Feature object"
		);

		assert.throws( function(){
			return new GherkinTestGenerator(this.parser.parse("Feature: Serve coffee"));
		}, function(error) {
			return error.message === badStepDefsError;
		},
			"second parameter is not specified"
		);

		assert.throws( function(){
			return new GherkinTestGenerator(this.parser.parse("Feature: Serve coffee"), "not a function");
		}, function(error) {
			return error.message === badStepDefsError;
		},
			"second parameter is not a function"
		);

		assert.throws( function(){
			return new GherkinTestGenerator(this.parser.parse("Feature: Serve coffee"), function(){});
		}, function(error) {
			return error.message === badStepDefsError;
		},
			"second parameter is a function, but not a StepDefs constructor"
		);

		assert.throws( function(){
			return new GherkinTestGenerator(this.parser.parse("Feature: Serve coffee"),
				StepDefinitions, "not a function");
		}, function(error) {
			return error.message === badAltGeneratorError;
		},
			"third parameter is not a function"
		);

	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Scenario Outline should generate the scenario with single-column concrete values", function(assert) {
		var text = [
			"Feature: Give cups of coffee to users",
			"",
			"  Scenario Outline: Coffee changes peoples moods",
			"    Then he should be '<MOOD>'",
			"",
			"    Examples:",
			"      | MOOD        |",
			"      | happy       |",
			"      | electrified |",
			"      | sad         |",
			""
		].join("\n");

		var feature = this.parser.parse(text);

		var regex2 = /^he should be '(.*?)'$/i;
		var function2 = function(mood) {};
		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(regex2, function2);
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var actualFeatureTest = testGenerator.generate();
		var expectedFeatureTest = {
			name: "Feature: Give cups of coffee to users",
			skip: false,
			wip: false,
			testScenarios: [{
				name: "Scenario Outline: Coffee changes peoples moods #1",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "he should be 'happy'",
					regex: regex2,
					parameters: ["happy"],
					func: function2
				}]
			},{
				name: "Scenario Outline: Coffee changes peoples moods #2",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "he should be 'electrified'",
					regex: regex2,
					parameters: ["electrified"],
					func: function2
				}]
			},{
				name: "Scenario Outline: Coffee changes peoples moods #3",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "he should be 'sad'",
					regex: regex2,
					parameters: ["sad"],
					func: function2
				}]
			}]
		};

		assert.deepEqual(actualFeatureTest, expectedFeatureTest);
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Background should run before each execution of the Scenario Outline", function(assert) {
		var text = [
			"Feature: Coffee improves mood in the background",
			"",
			"  Background:",
			"    Given the user drank coffee",
			"",
			"  Scenario Outline: Coffee changes peoples moods",
			"    * user <USER> should be <MOOD>",
			"",
			"    Examples:",
			"      | USER     | MOOD         |",
			"      |  Michael |  happy       |",
			"      |  Elvis   |  electrified |",
			"      |  John    |  sad         |",
			""
		].join("\n");

		var feature = this.parser.parse(text);

		var regex1 = /^the user drank coffee$/i;
		var function1 = function() {};
		var regex2 = /^user (.*?) should be (.*?)$/i;
		var function2 = function() {};
		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(regex1, function1);
				this.register(regex2, function2);
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var actualFeatureTest = testGenerator.generate();
		var expectedFeatureTest = {
			name: "Feature: Coffee improves mood in the background",
			skip: false,
			wip: false,
			testScenarios: [{
				name: "Scenario Outline: Coffee changes peoples moods #1",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "the user drank coffee",
					regex: regex1,
					parameters: [],
					func: function1
				},{
					isMatch: true,
					skip: false,
					text: "user Michael should be happy",
					regex: regex2,
					parameters: ["Michael", "happy"],
					func: function2
				}]
			},{
				name: "Scenario Outline: Coffee changes peoples moods #2",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "the user drank coffee",
					regex: regex1,
					parameters: [],
					func: function1
				},{
					isMatch: true,
					skip: false,
					text: "user Elvis should be electrified",
					regex: regex2,
					parameters: ["Elvis", "electrified"],
					func: function2
				}]
			},{
				name: "Scenario Outline: Coffee changes peoples moods #3",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "the user drank coffee",
					regex: regex1,
					parameters: [],
					func: function1
				},{
					isMatch: true,
					skip: false,
					text: "user John should be sad",
					regex: regex2,
					parameters: ["John", "sad"],
					func: function2
				}]
			}]
		};

		assert.deepEqual(actualFeatureTest, expectedFeatureTest);
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given missing Background definition + Scenario Outline then all tests skipped", function(assert) {
		var text = [
			"Feature: Coffee improves mood in the background",
			"",
			"  Background:",
			"    Given the user drank coffee",
			"      And the user drank more coffee", // no step definition for this
			"",
			"  Scenario Outline: Coffee changes peoples moods",
			"    * user <USER> should be <MOOD>",
			"",
			"    Examples:",
			"      | USER     | MOOD         |",
			"      |  Michael |  happy       |",
			"      |  Elvis   |  electrified |",
			"      |  John    |  sad         |",
			""
		].join("\n");

		var feature = this.parser.parse(text);

		var regex1 = /^the user drank coffee$/i;
		var function1 = function() {};
		var regex2 = /^user (.*?) should be (.*?)$/i;
		var function2 = function() {};
		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(regex1, function1);
				this.register(regex2, function2);
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var actualFeatureTest = testGenerator.generate();
		var expectedFeatureTest = {
			name: "Feature: Coffee improves mood in the background",
			skip: false,
			wip: false,
			testScenarios: [{
				name: "Scenario Outline: Coffee changes peoples moods #1",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "the user drank coffee",
					regex: regex1,
					parameters: [],
					func: function1
				},{
					isMatch: false,
					skip: true,
					text: "(NOT FOUND) the user drank more coffee"
				},{
					isMatch: true,
					skip: true,
					text: "(SKIPPED) user Michael should be happy",
					regex: regex2,
					parameters: ["Michael", "happy"],
					func: function2
				}]
			},{
				name: "Scenario Outline: Coffee changes peoples moods #2",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "the user drank coffee",
					regex: regex1,
					parameters: [],
					func: function1
				},{
					isMatch: false,
					skip: true,
					text: "(NOT FOUND) the user drank more coffee"
				},{
					isMatch: true,
					skip: true,
					text: "(SKIPPED) user Elvis should be electrified",
					regex: regex2,
					parameters: ["Elvis", "electrified"],
					func: function2
				}]
			},{
				name: "Scenario Outline: Coffee changes peoples moods #3",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "the user drank coffee",
					regex: regex1,
					parameters: [],
					func: function1
				},{
					isMatch: false,
					skip: true,
					text: "(NOT FOUND) the user drank more coffee"
				},{
					isMatch: true,
					skip: true,
					text: "(SKIPPED) user John should be sad",
					regex: regex2,
					parameters: ["John", "sad"],
					func: function2
				}]
			}]
		};

		assert.deepEqual(actualFeatureTest, expectedFeatureTest);
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given nested variables, Scenario Outline should re-write multiple times", function(assert) {
		// Believe it or not, the Cucumber Java reference implementation does this

		var text = [
			"Feature: Give cups of coffee to users",
			"",
			"  Scenario Outline: Coffee changes peoples moods",
			"    Given user '<USER>' given <NUMBER> cups of coffee is '<MOOD>'",
			"",
			"    Examples:",
			"      | USER      | NUMBER  | MOOD       |",
			"      |  <NUMBER> |  <MOOD> |  delighted |",
			""
		].join("\n");

		var feature = this.parser.parse(text);

		var regex1 = /^user '(.*?)' given (.*?) cups of coffee is '(.*?)'$/i;
		var function1 = function(user, number, mood) {};
		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(regex1, function1);
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var actualFeatureTest = testGenerator.generate();
		var expectedFeatureTest = {
			name: "Feature: Give cups of coffee to users",
			skip: false,
			wip: false,
			testScenarios: [{
				name: "Scenario Outline: Coffee changes peoples moods #1",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "user 'delighted' given delighted cups of coffee is 'delighted'",
					regex: regex1,
					parameters: ["delighted", "delighted", "delighted"],
					func: function1
				}]
			}]
		};

		assert.deepEqual(actualFeatureTest, expectedFeatureTest);
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Ambiguous Step Definitions Error", function(assert) {

		var text = [
			"Feature: Serve expensive coffee",
			"",
			"  Scenario: Buy first coffee",
			"    Then I should be served a coffee"
		].join("\n");

		var feature = this.parser.parse(text);

		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				// The .feature file text "I should be served a coffee" is matched by ALL THREE regular expressions!
				this.register(/^I should be served a coffee$/i, function() {});
				this.register(/^I should.*/i, function() {});
				this.register(/^.*/i, function() {});
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);

		assert.throws( function(){
			testGenerator.generate();
		}, function(error) {
			return error.message === "Ambiguous step definition error: 3 step definitions '/^I should be served a coffee$/i', '/^I should.*/i' and '/^.*/i' match the feature file step 'I should be served a coffee'";
		});

	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Scenario Outline with background and no Examples will be skipped", function(assert) {
		var text = [
			"Feature: Give cups of coffee to users",
			"",
			"  Background:",
			"    Given the user 'Jonathan' has been given 0 cups of coffee",
			"",
			"  Scenario Outline: Coffee changes peoples moods",
			"    Given the user '<USER>' has been given <NUMBER> cups of coffee",
			""
		].join("\n");

		var feature = this.parser.parse(text);

		var regex1 = /^the user '(.*?)' has been given (.*?) cups of coffee$/i;
		var function1 = function(user, number) {};
		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(regex1, function1);
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var actualFeatureTest = testGenerator.generate();
		var expectedFeatureTest = {
			name: "Feature: Give cups of coffee to users",
			skip: true,
			wip: false,
			testScenarios: [{
				name: "Scenario Outline: Coffee changes peoples moods",
				skip: true,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "the user 'Jonathan' has been given 0 cups of coffee",
					regex: regex1,
					parameters: ["Jonathan", "0"],
					func: function1
				},{
					isMatch: true,
					skip: true,
					text: "(SKIPPED) the user '<USER>' has been given <NUMBER> cups of coffee",
					regex: regex1,
					parameters: ["<USER>", "<NUMBER>"],
					func: function1
				}]
			}]
		};

		assert.deepEqual(actualFeatureTest, expectedFeatureTest);
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Scenario Outline with no Examples will be skipped (regardless of if step definitions are found)", function(assert) {
		var text = [
			"Feature: Give cups of coffee to users",
			"",
			"  Scenario Outline: Coffee changes peoples moods",
			"    Given the user '<USER>' has been given <NUMBER> cups of coffee", // step definition exists
			"",
			"  Scenario Outline: Coffee's mysterious origins",
			"    Given coffee originated in <ORIGIN>, but was first brewed in <FIRST BREWED>", // no step definition
			""
		].join("\n");

		var feature = this.parser.parse(text);

		var regex1 = /^the user '(.*?)' has been given (.*?) cups of coffee$/i;
		var function1 = function(user, number) {};
		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(regex1, function1);
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var actualFeatureTest = testGenerator.generate();
		var expectedFeatureTest = {
			name: "Feature: Give cups of coffee to users",
			skip: true,
			wip: false,
			testScenarios: [{
				name: "Scenario Outline: Coffee changes peoples moods",
				skip: true,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: true,
					text: "(SKIPPED) the user '<USER>' has been given <NUMBER> cups of coffee",
					regex: regex1,
					parameters: ["<USER>", "<NUMBER>"],
					func: function1
				}]
			},{
				name: "Scenario Outline: Coffee's mysterious origins",
				skip: true,
				wip: false,
				testSteps: [{
					isMatch: false,
					skip: true,
					text: "(NOT FOUND) coffee originated in <ORIGIN>, but was first brewed in <FIRST BREWED>"
				}]
			}]
		};

		assert.deepEqual(actualFeatureTest, expectedFeatureTest);
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Scenario Outline with one @wip Example will be skipped", function(assert) {
		var text = [
			"Feature: Coffee History Lesson",
			"",
			"  Scenario Outline: Coffee's mysterious origins",
			"    Given coffee originated in <ORIGIN>, but was first brewed in <FIRST BREWED>",
			"",
			"    @wip",
			"    Examples: A",
			"      | ORIGIN    | FIRST BREWED |",
			"      |  Ethiopia |  Yemen       |",
			"",
			"  Scenario: the mysterious nature of coffee",
			"   Given coffee 'beans' are actually seeds extracted from dried berries!",
			""
		].join("\n");

		var feature = this.parser.parse(text);

		var regex1 = /^coffee originated in (.*?), but was first brewed in (.*?)$/i;
		var function1 = function(origin, firstBrewed) {};
		var regex2 = /^coffee 'beans' are actually seeds extracted from dried berries!$/i;
		var function2 = function() {};
		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(regex1, function1);
				this.register(regex2, function2);
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var actualFeatureTest = testGenerator.generate();
		var expectedFeatureTest = {
			name: "Feature: Coffee History Lesson",
			skip: false,
			wip: false,
			testScenarios: [{
				name: "Scenario Outline: Coffee's mysterious origins",
				skip: true,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: true,
					text: "(SKIPPED) coffee originated in <ORIGIN>, but was first brewed in <FIRST BREWED>",
					regex: regex1,
					parameters: ["<ORIGIN>", "<FIRST BREWED>"],
					func: function1
				}]
			},{
				name: "Scenario: the mysterious nature of coffee",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "coffee 'beans' are actually seeds extracted from dried berries!",
					regex: regex2,
					parameters: [],
					func: function2
				}]
			}]
		};

		assert.deepEqual(actualFeatureTest, expectedFeatureTest);
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Feature whose steps are all not found will not be skipped", function(assert) {

		var text = [
			"Feature: Coffee History Lesson",
			"",
			"  Scenario: the mysterious nature of coffee",
			"   Given coffee 'beans' are actually seeds extracted from dried berries!",
			""
		].join("\n");

		var feature = this.parser.parse(text);

		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				// no step definitions being registered
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var actualFeatureTest = testGenerator.generate();
		var expectedFeatureTest = {
			name: "Feature: Coffee History Lesson",
			skip: false,
			wip: false,
			testScenarios: [{
				name: "Scenario: the mysterious nature of coffee",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: false,
					skip: true,
					text: "(NOT FOUND) coffee 'beans' are actually seeds extracted from dried berries!"
				}]
			}]
		};

		assert.deepEqual(actualFeatureTest, expectedFeatureTest);
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Feature whose steps are all @wip will be skipped", function(assert) {

		var text = [
			"Feature: Coffee History Lesson",
			"",
			"  @wip",
			"  Scenario: the mysterious nature of coffee",
			"   Given coffee 'beans' are actually seeds extracted from dried berries!",
			""
		].join("\n");

		var feature = this.parser.parse(text);

		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var actualFeatureTest = testGenerator.generate();
		var expectedFeatureTest = {
			name: "Feature: Coffee History Lesson",
			skip: true,
			wip: false,
			testScenarios: [{
				name: "(WIP) Scenario: the mysterious nature of coffee",
				skip: true,
				wip: true,
				testSteps: [{
					isMatch: false,
					skip: true,
					text: "(NOT FOUND) coffee 'beans' are actually seeds extracted from dried berries!"
				}]
			}]
		};

		assert.deepEqual(actualFeatureTest, expectedFeatureTest);
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Scenario Outline with two Examples, one of which is @wip, will execute only the other one", function(assert) {
		var text = [
			"Feature: Musicians sure write a lot of music",
			"",
			"  Scenario Outline: Musicians and their music",
			"    Given the musician '<MUSICIAN>' recorded approximately <NUMBER> songs",
			"",
			"    @wip",
			"    Examples: Elvis",
			"      | MUSICIAN | NUMBER |",
			"      |  Elvis   |  711   |",
			"",
			"    Examples: Vangelis",
			"      | MUSICIAN  | NUMBER |",
			"      |  Vangelis |  420   |",
			""
		].join("\n");

		var feature = this.parser.parse(text);

		var regex1 = /^the musician '(.*?)' recorded approximately (.*?) songs$/i;
		var function1 = function(musician, number) {};
		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(regex1, function1);
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var actualFeatureTest = testGenerator.generate();
		var expectedFeatureTest = {
			name: "Feature: Musicians sure write a lot of music",
			skip: false,
			wip: false,
			testScenarios: [{
				name: "Scenario Outline: Musicians and their music: Vangelis #1",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "the musician 'Vangelis' recorded approximately 420 songs",
					regex: regex1,
					parameters: ["Vangelis", "420"],
					func: function1
				}]
			}]
		};

		assert.deepEqual(actualFeatureTest, expectedFeatureTest);
	});


	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Scenario Outline with two Examples will execute BOTH of them", function(assert) {
		var text = [
			"Feature: Musicians sure write a lot of music",
			"",
			"  Scenario Outline: Musicians and their music",
			"    Given the musician '<MUSICIAN>' recorded approximately <NUMBER> songs",
			"",
			"    Examples: Elvis",
			"      | MUSICIAN | NUMBER |",
			"      |  Elvis   |  711   |",
			"",
			"    Examples: Vangelis",
			"      | MUSICIAN  | NUMBER |",
			"      |  Vangelis |  420   |",
			""
		].join("\n");

		var feature = this.parser.parse(text);

		var regex1 = /^the musician '(.*?)' recorded approximately (.*?) songs$/i;
		var function1 = function(musician, number) {};
		var steps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
			init: function() {
				this.register(regex1, function1);
			}
		});

		var testGenerator = new GherkinTestGenerator(feature, steps);
		var actualFeatureTest = testGenerator.generate();
		var expectedFeatureTest = {
			name: "Feature: Musicians sure write a lot of music",
			skip: false,
			wip: false,
			testScenarios: [{
				name: "Scenario Outline: Musicians and their music: Elvis #1",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "the musician 'Elvis' recorded approximately 711 songs",
					regex: regex1,
					parameters: ["Elvis", "711"],
					func: function1
				}]
			},{
				name: "Scenario Outline: Musicians and their music: Vangelis #1",
				skip: false,
				wip: false,
				testSteps: [{
					isMatch: true,
					skip: false,
					text: "the musician 'Vangelis' recorded approximately 420 songs",
					regex: regex1,
					parameters: ["Vangelis", "420"],
					func: function1
				}]
			}]
		};

		assert.deepEqual(actualFeatureTest, expectedFeatureTest);
	});

});
