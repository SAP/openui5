/*!
 * ${copyright}
 */

/* eslint-disable quotes */
/* global QUnit */

sap.ui.require([
  "sap/ui/test/gherkin/SimpleGherkinParser",
  "sap/ui/test/gherkin/StepDefinitions",
  "sap/ui/test/gherkin/GherkinTestGenerator"
], function(SimpleGherkinParser, StepDefinitions, GherkinTestGenerator) {
  'use strict';

  QUnit.module("Gherkin Test Generator Tests", {
    setup : function() {
      this.parser = SimpleGherkinParser;

      this.assertAllTestsAreMatchedAndSkipped = function(testScenario) {
        for (var i=0; i<testScenario.testSteps.length; ++i) {
          var testStep = testScenario.testSteps[i];
          ok(!!testStep.text.match(/^\(SKIPPED\)/), 'text: ' + testScenario.name + ' -- ' + testStep.text);
          ok(testStep.isMatch, 'isMatch: ' + testScenario.name + ' -- ' + testStep.text);
          ok(testStep.skip, 'skip: ' + testScenario.name + ' -- ' + testStep.text);
        }
      };
    },
    teardown: function() {}
  });


  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Smoke test 'generate' method", function() {

    var text = [
      'Feature: Serve coffee',
      '  Scenario: Buy last coffee',
      '    Then I should be served a coffee'
    ].join('\n');
    var feature = this.parser.parse(text);

    var stepRegex = /^I should be served a coffee$/i;
    var stepFunction = function() {};
    var steps = StepDefinitions.extend('sap.ui.test.gherkin.StepDefinitionsTest', {
      init: function() {
        this.register(stepRegex, stepFunction);
      }
    });

    var testGenerator = new GherkinTestGenerator(feature, steps);
    var actualFeatureTest = testGenerator.generate();
    var expectedFeatureTest = {
      name: 'Feature: Serve coffee',
      skip: false,
      wip: false,
      testScenarios: [{
        name: 'Scenario: Buy last coffee',
        wip: false,
        testSteps: [{
          isMatch: true,
          skip: false,
          text: 'I should be served a coffee',
          regex: stepRegex,
          parameters: [],
          func: stepFunction
        }]
      }]
    };

    deepEqual(actualFeatureTest, expectedFeatureTest, "Smoke test 'generate' method");
  });


  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Scenario Outline should generate the scenario with concrete values", function() {
    var text = [
      'Feature: Give cups of coffee to users',
      '',
      '  Scenario Outline: Coffee changes peoples moods',
      '    Given the user "<<user>>" has been given <(?:number)?> cups of coffee',
      '    Then he should be "<(mood)>"',
      '',
      '  Examples:',
      '    | <user>  | (?:number)? | (mood)      |',
      '    | Michael | 1           | happy       |',
      '    | Elvis   | 4           | electrified |',
      '    | John    | 2           | sad         |',
      ''
    ].join('\n');

    var feature = this.parser.parse(text);

    var regex1 = /^the user "(.*?)" has been given (.*?) cups of coffee$/i;
    var function1 = function(user, number) {};
    var regex2 = /^he should be "(.*?)"$/i;
    var function2 = function(mood) {};
    var steps = StepDefinitions.extend('sap.ui.test.gherkin.StepDefinitionsTest', {
      init: function() {
        this.register(regex1, function1);
        this.register(regex2, function2);
      }
    });

    var testGenerator = new GherkinTestGenerator(feature, steps);
    var actualFeatureTest = testGenerator.generate();
    var expectedFeatureTest = {
      name: 'Feature: Give cups of coffee to users',
      skip: false,
      wip: false,
      testScenarios: [{
        name: 'Scenario Outline: Coffee changes peoples moods',
        wip: false,
        testSteps: [{
          isMatch: true,
          skip: false,
          text: 'the user "Michael" has been given 1 cups of coffee',
          regex: regex1,
          parameters: ['Michael', '1'],
          func: function1
        },{
          isMatch: true,
          skip: false,
          text: 'he should be "happy"',
          regex: regex2,
          parameters: ['happy'],
          func: function2
        },{
          isMatch: true,
          skip: false,
          text: 'the user "Elvis" has been given 4 cups of coffee',
          regex: regex1,
          parameters: ['Elvis', '4'],
          func: function1
        },{
          isMatch: true,
          skip: false,
          text: 'he should be "electrified"',
          regex: regex2,
          parameters: ['electrified'],
          func: function2
        },{
          isMatch: true,
          skip: false,
          text: 'the user "John" has been given 2 cups of coffee',
          regex: regex1,
          parameters: ['John', '2'],
          func: function1
        },{
          isMatch: true,
          skip: false,
          text: 'he should be "sad"',
          regex: regex2,
          parameters: ['sad'],
          func: function2
        }]
      }]
    };

    deepEqual(actualFeatureTest, expectedFeatureTest,
      "Scenario Outline should generate the scenario with concrete values");
  });


  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Background gets run before every scenario in the feature", function() {

    var text = [
      'Feature: Serve expensive coffee',
      '    Coffee is a luxury and as such it should be bloody expensive',
      '',
      '  Background:',
      '    Given coffee costs $18 per cup',
      '',
      '  Scenario: Buy first coffee',
      '    Then I should be served a coffee',
      '',
      '  Scenario: Buy second coffee',
      '    Then I should be served a second coffee'
    ].join('\n');

    var feature = this.parser.parse(text);

    var backgroundRegex = /^coffee costs \$18 per cup$/i;
    var backgroundFunction = function() {};
    var normalRegex1 = /^I should be served a coffee$/i;
    var normalFunction1 = function() {};
    var normalRegex2 = /^I should be served a second coffee$/i;
    var normalFunction2 = function() {};
    var steps = StepDefinitions.extend('sap.ui.test.gherkin.StepDefinitionsTest', {
      init: function() {
        this.register(backgroundRegex, backgroundFunction);
        this.register(normalRegex1, normalFunction1);
        this.register(normalRegex2, normalFunction2);
      }
    });

    var testGenerator = new GherkinTestGenerator(feature, steps);
    var actualFeatureTest = testGenerator.generate();
    var expectedFeatureTest = {
      name: 'Feature: Serve expensive coffee',
      skip: false,
      wip: false,
      testScenarios: [{
        name: 'Scenario: Buy first coffee',
        wip: false,
        testSteps: [{
          isMatch: true,
          skip: false,
          text: 'coffee costs $18 per cup',
          regex: backgroundRegex,
          parameters: [],
          func: backgroundFunction
        },{
          isMatch: true,
          skip: false,
          text: 'I should be served a coffee',
          regex: normalRegex1,
          parameters: [],
          func: normalFunction1
      }]},{
        name: 'Scenario: Buy second coffee',
        wip: false,
        testSteps: [{
          isMatch: true,
          skip: false,
          text: 'coffee costs $18 per cup',
          regex: backgroundRegex,
          parameters: [],
          func: backgroundFunction
        },{
          isMatch: true,
          skip: false,
          text: 'I should be served a second coffee',
          regex: normalRegex2,
          parameters: [],
          func: normalFunction2
      }]}]
    };

    deepEqual(actualFeatureTest, expectedFeatureTest, "Background gets run before every scenario in the feature");
  });


  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("@wip tag on feature prevents whole feature from being run", function() {

    var text = [
      '@wip',
      'Feature: Serve quantum coffee',
      '    Coffee is a luxury and as such it should be bloody expensive',
      '',
      '  Scenario Outline: Coffee changes peoples moods if you are ready',
      '    Given the user "<user>" has been given <number> cups of coffee',
      '    Then he should be "<mood>"',
      '',
      '  Examples:',
      '    | user    | number | mood  |',
      '    | Michael | 1      | happy |',
      '',
      '  Background:',
      '    Given coffee costs $18 per cup',
      '',
      '  Scenario: Buy expensive coffee once barista is ready',
      '    Then I should be served a coffee'
    ].join('\n');

    var feature = this.parser.parse(text);

    var steps = StepDefinitions.extend('sap.ui.test.gherkin.StepDefinitionsTest', {
      init: function() {
        this.register(/^coffee costs \$18 per cup$/i, function() {});
        this.register(/^I should be served a coffee$/i, function() {});
        this.register(/^the user "(.*?)" has been given (.*?) cups of coffee$/i, function() {});
        this.register(/^he should be "(.*?)"$/i, function() {});
      }
    });

    var testGenerator = new GherkinTestGenerator(feature, steps);
    var featureTest = testGenerator.generate();

    strictEqual(featureTest.name, '(WIP) Feature: Serve quantum coffee', "@wip tag on feature 01");
    strictEqual(featureTest.skip, true, "@wip tag on feature 02");
    strictEqual(featureTest.wip, true, "@wip tag on feature 03");
    strictEqual(featureTest.testScenarios.length, 2, "@wip tag on feature 04");

    strictEqual(featureTest.testScenarios[0].name,
      "(WIP) Scenario Outline: Coffee changes peoples moods if you are ready", "@wip tag on feature 05");
    strictEqual(featureTest.testScenarios[0].wip, true, "@wip tag on feature 06");
    strictEqual(featureTest.testScenarios[0].testSteps.length, 3, "@wip tag on feature 07");
    this.assertAllTestsAreMatchedAndSkipped(featureTest.testScenarios[0]);

    strictEqual(featureTest.testScenarios[1].name, "(WIP) Scenario: Buy expensive coffee once barista is ready",
      "@wip tag on feature 08");
    strictEqual(featureTest.testScenarios[1].wip, true, "@wip tag on feature 09");
    strictEqual(featureTest.testScenarios[1].testSteps.length, 2, "@wip tag on feature 10");
    this.assertAllTestsAreMatchedAndSkipped(featureTest.testScenarios[1]);
  });


  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("@wip tag on scenario prevents only that scenario from running", function() {

    var text = [
      "Feature: Schrödinger's coffee",
      '    Leave a barista in a box for a while with a nuclear isotope,',
      '    open the box later and what do you see when the wave',
      '    function collapses?',
      '',
      '  Background:',
      '    Given that quantum phenomena exist at the macroscopic level',
      '',
      '  Scenario: Buy expensive coffee when the barista is alive',
      '    Then I should expect a live barista',
      '',
      '  @wip',
      '  Scenario: Buy expensive coffee when the barista is dead',
      '    Then I should expect a dead barista'
    ].join('\n');

    var feature = this.parser.parse(text);

    var steps = StepDefinitions.extend('sap.ui.test.gherkin.StepDefinitionsTest', {
      init: function() {
        this.register(/^that quantum phenomena exist at the macroscopic level$/i, function() {});
        this.register(/^I should expect a live barista$/i, function() {});
        this.register(/^I should expect a dead barista$/i, function() {});
      }
    });

    var testGenerator = new GherkinTestGenerator(feature, steps);
    var featureTest = testGenerator.generate();

    strictEqual(featureTest.skip, false, "@wip tag on scenario 01");
    strictEqual(featureTest.wip, false, "@wip tag on scenario 02");
    strictEqual(featureTest.testScenarios.length, 2, "@wip tag on scenario 03");

    strictEqual(featureTest.testScenarios[0].name, "Scenario: Buy expensive coffee when the barista is alive",
      "@wip tag on scenario 04");
    strictEqual(featureTest.testScenarios[0].wip, false, "@wip tag on scenario 05");
    strictEqual(featureTest.testScenarios[0].testSteps.length, 2, "@wip tag on scenario 06");
    strictEqual(featureTest.testScenarios[0].testSteps[0].text, 'that quantum phenomena exist at the macroscopic level',
      "@wip tag on scenario 07");
    strictEqual(featureTest.testScenarios[0].testSteps[0].isMatch, true, 'alive background isMatch');
    strictEqual(featureTest.testScenarios[0].testSteps[0].skip, false, 'alive background skip');
    strictEqual(featureTest.testScenarios[0].testSteps[1].text, 'I should expect a live barista');
    strictEqual(featureTest.testScenarios[0].testSteps[1].isMatch, true, 'alive isMatch');
    strictEqual(featureTest.testScenarios[0].testSteps[1].skip, false, 'alive skip');

    strictEqual(featureTest.testScenarios[1].name, "(WIP) Scenario: Buy expensive coffee when the barista is dead",
      "@wip tag on scenario 08");
    strictEqual(featureTest.testScenarios[1].wip, true, "@wip tag on scenario 09");
    strictEqual(featureTest.testScenarios[1].testSteps.length, 2, "@wip tag on scenario 10");
    this.assertAllTestsAreMatchedAndSkipped(featureTest.testScenarios[1]);
  });


  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Parameters and tables are parsed and passed to steps in test suite", function() {

    var text = [
      'Feature: Give coffee to users',
      '',
      '  Scenario: Coffee makes people happy',
      '    Given these awesome Users:',
      '      | Name            | Date of Birth   |',
      '      | Michael Jackson | August 29, 1958 |',
      '      | Elvis           | January 8, 1935 |',
      '      | John Lennon     | October 9, 1940 |',
      '    And when I give them the coffee price list:',
      '      | Coffee Blend   | Price |',
      '      | Dark           | $18   |',
      '      | Moka           | $23   |',
      '      | Columbian      | $1400 |',
      '    Then they should be happy'
    ].join('\n');

    var feature = this.parser.parse(text);

    var steps = StepDefinitions.extend('sap.ui.test.gherkin.StepDefinitionsTest', {
      init: function() {
        this.register(/^these (.*?) users:?$/i, function() {});
        this.register(/^when I give them the coffee price list:?$/i, function() {});
        this.register(/^(.*?) should be (.*?)$/i, function() {});
      }
    });

    var testGenerator = new GherkinTestGenerator(feature, steps);
    var featureTest = testGenerator.generate();

    strictEqual(featureTest.testScenarios.length, 1, "Parameters and tables are parsed and passed 01");
    strictEqual(featureTest.testScenarios[0].testSteps.length, 3, "Parameters and tables are parsed and passed 02");

    strictEqual(featureTest.testScenarios[0].testSteps[0].text, 'these awesome Users:',
      "Parameters and tables are parsed and passed 03");
    strictEqual(featureTest.testScenarios[0].testSteps[0].parameters.length, 2,
      "Parameters and tables are parsed and passed 04");
    strictEqual(featureTest.testScenarios[0].testSteps[0].parameters[0], 'awesome',
      "Parameters and tables are parsed and passed 05");
    deepEqual(featureTest.testScenarios[0].testSteps[0].parameters[1], [
      ['Name', 'Date of Birth'],
      ['Michael Jackson','August 29, 1958'],
      ['Elvis', 'January 8, 1935'],
      ['John Lennon', 'October 9, 1940']
    ], 'date of birth table is correct');

    strictEqual(featureTest.testScenarios[0].testSteps[1].text, 'when I give them the coffee price list:',
      "Parameters and tables are parsed and passed 06");
    strictEqual(featureTest.testScenarios[0].testSteps[1].parameters.length, 1,
      "Parameters and tables are parsed and passed 07");
    deepEqual(featureTest.testScenarios[0].testSteps[1].parameters[0], [
      ['Coffee Blend', 'Price'],
      ['Dark', '$18'],
      ['Moka', '$23'],
      ['Columbian', '$1400']
    ], 'coffee blend table is correct');

    strictEqual(featureTest.testScenarios[0].testSteps[2].text, 'they should be happy',
      "Parameters and tables are parsed and passed 08");
    strictEqual(featureTest.testScenarios[0].testSteps[2].parameters.length, 2,
      "Parameters and tables are parsed and passed 09");
    strictEqual(featureTest.testScenarios[0].testSteps[2].parameters[0], 'they', 'correct person');
    strictEqual(featureTest.testScenarios[0].testSteps[2].parameters[1], 'happy', 'correct emotion');
  });


  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Given missing step definition then that step and all remaining steps are skipped", function() {

    var text = [
      'Feature: Serve humanity',
      '',
      '  Background:',
      '    Given kindness to strangers is a virtue',
      '',
      '  Scenario: Wash their feet',
      '    Given I am a very good person',
      '    And I encounter a person whose feet are very dirty',
      '    And they are classified as a "Category 3 Unwashed Mass"',
      '    Then I should wash their feet'
    ].join('\n');

    var feature = this.parser.parse(text);

    var steps = StepDefinitions.extend('sap.ui.test.gherkin.StepDefinitionsTest', {
      init: function() {
        this.register(/^kindness to strangers is a virtue$/i, function() {});
        this.register(/^I am a very good person$/i, function() {});
        this.register(/^they are classified as a "(.*?)"$/i, function() {});
        this.register(/^I should wash their feet$/i, function() {});
      }
    });

    var testGenerator = new GherkinTestGenerator(feature, steps);
    var featureTest = testGenerator.generate();

    strictEqual(featureTest.testScenarios.length, 1, 'Test 001');
    strictEqual(featureTest.testScenarios[0].testSteps.length, 5, 'Test 002');

    strictEqual(featureTest.testScenarios[0].testSteps[0].text, 'kindness to strangers is a virtue', 'Test 003');
    strictEqual(featureTest.testScenarios[0].testSteps[0].isMatch, true, 'Test 004');
    strictEqual(featureTest.testScenarios[0].testSteps[0].skip, false, 'Test 005');

    strictEqual(featureTest.testScenarios[0].testSteps[1].text, 'I am a very good person', 'Test 006');
    strictEqual(featureTest.testScenarios[0].testSteps[1].isMatch, true, 'Test 007');
    strictEqual(featureTest.testScenarios[0].testSteps[1].skip, false, 'Test 008');

    strictEqual(featureTest.testScenarios[0].testSteps[2].text,
      "(NOT FOUND) I encounter a person whose feet are very dirty", 'Test 009');
    strictEqual(featureTest.testScenarios[0].testSteps[2].isMatch, false, 'Test 010');
    strictEqual(featureTest.testScenarios[0].testSteps[2].skip, true, 'Test 011');

    strictEqual(featureTest.testScenarios[0].testSteps[3].text,
      '(SKIPPED) they are classified as a "Category 3 Unwashed Mass"', 'Test 012');
    strictEqual(featureTest.testScenarios[0].testSteps[3].isMatch, true, 'Test 013');
    strictEqual(featureTest.testScenarios[0].testSteps[3].skip, true, 'skip unwashed mass');

    strictEqual(featureTest.testScenarios[0].testSteps[4].text, '(SKIPPED) I should wash their feet', 'Test 014');
    strictEqual(featureTest.testScenarios[0].testSteps[4].isMatch, true, 'Test 015');
    strictEqual(featureTest.testScenarios[0].testSteps[4].skip, true, 'skipped feet');
  });


  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Given missing background definition then all steps are skipped", function() {

    var text = [
      'Feature: Serve humanity',
      '',
      '  Background:',
      '    Given meanness to strangers is ok',
      '',
      '  Scenario: Wash their feet',
      '    Given I should wash their feet',
      "    But I don't feel like it"
    ].join('\n');

    var feature = this.parser.parse(text);

    var steps = StepDefinitions.extend('sap.ui.test.gherkin.StepDefinitionsTest', {
      init: function() {
        this.register(/^I should wash their feet$/i, function() {});
      }
    });

    var testGenerator = new GherkinTestGenerator(feature, steps);
    var featureTest = testGenerator.generate();

    strictEqual(featureTest.testScenarios.length, 1, 'Test 016');
    strictEqual(featureTest.testScenarios[0].wip, false, 'Test 017');
    strictEqual(featureTest.testScenarios[0].testSteps.length, 3, 'Test 018');

    strictEqual(featureTest.testScenarios[0].testSteps[0].text, '(NOT FOUND) meanness to strangers is ok', 'Test 019');
    strictEqual(featureTest.testScenarios[0].testSteps[0].isMatch, false, 'Test 020');
    strictEqual(featureTest.testScenarios[0].testSteps[0].skip, true, 'Test 021');

    strictEqual(featureTest.testScenarios[0].testSteps[1].text, '(SKIPPED) I should wash their feet', 'Test 022');
    strictEqual(featureTest.testScenarios[0].testSteps[1].isMatch, true, 'Test 023');
    strictEqual(featureTest.testScenarios[0].testSteps[1].skip, true, 'Test 024');

    // test that further unfound testSteps still say "(NOT FOUND)" instead of "(SKIPPED)"
    strictEqual(featureTest.testScenarios[0].testSteps[2].text, "(NOT FOUND) I don't feel like it", 'Test 025');
    strictEqual(featureTest.testScenarios[0].testSteps[2].isMatch, false, 'Test 026');
    strictEqual(featureTest.testScenarios[0].testSteps[2].skip, true, 'Test 027');
  });


  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Given a non-WIP feature, calling 'tearDown' MUST execute 'closeApplication'", function() {

    expect(2);

    var text = [
      'Feature: Serve humanity',
      '  Scenario: Do something already',
      '    Then I do something (finally)'
    ].join('\n');

    var feature = this.parser.parse(text);

    var steps = StepDefinitions.extend('sap.ui.test.gherkin.StepDefinitionsTest', {
      init: function() {
        this.register(/^I do something \(finally\)$/i, function() {});
      },
      closeApplication: function() {
        ok(true, "Given a non-WIP feature, calling 'tearDown' MUST execute 'closeApplication'");
      }
    });

    var testGenerator = new GherkinTestGenerator(feature, steps);
    var featureTest = testGenerator.generate();
    strictEqual(featureTest.name, 'Feature: Serve humanity', 'Test 028');
    testGenerator.setUp();
    testGenerator.execute(featureTest.testScenarios[0].testSteps[0]);
    testGenerator.tearDown();
  });

  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Given feature with all @wip scenarios, calling 'tearDown' must NOT execute 'closeApplication'", function() {

    expect(2);

    var text = [
      'Feature: Serve humanity',
      '  @wip',
      '  Scenario: Do something already',
      '    Then I do something (finally)',
      '  @wip',
      '  Scenario: Do something else if you dare',
      '    Then I do something (finally)'
    ].join('\n');

    var feature = this.parser.parse(text);

    var steps = StepDefinitions.extend('sap.ui.test.gherkin.StepDefinitionsTest', {
      init: function() {
        this.register(/^I do something \(finally\)$/i, function() {});
      },
      closeApplication: function() {
        ok(false, "Given feature with all @wip scenarios, calling 'tearDown' must NOT execute 'closeApplication'");
      }
    });

    var testGenerator = new GherkinTestGenerator(feature, steps);
    var featureTest = testGenerator.generate();
    strictEqual(featureTest.name, 'Feature: Serve humanity', 'Test 029');
    strictEqual(featureTest.testScenarios.length, 2, 'Test 030');
    for (var i=0; i<featureTest.testScenarios.length; ++i) {
      testGenerator.setUp();
      testGenerator.execute(featureTest.testScenarios[i].testSteps[0]);
      testGenerator.tearDown();
    }
  });



  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Given feature with some skipped scenarios, calling 'tearDown' must execute 'closeApplication' only for " +
       "non-skipped scenarios", function() {

    expect(4);

    var expectCloseApplication = false;

    var text = [
      'Feature: Serve humanity',
      '  Scenario: Do something',
      '    Then I do something (finally)',
      '  @wip',
      '  Scenario: Do something else if you dare',
      '    Then I do something (finally)',
      '  Scenario: Do something already',
      '    Then I do something (finally)'
    ].join('\n');

    var feature = this.parser.parse(text);

    var steps = StepDefinitions.extend('sap.ui.test.gherkin.StepDefinitionsTest', {
      init: function() {
        this.register(/^I do something \(finally\)$/i, function() {});
      },
      closeApplication: function() {
        ok(expectCloseApplication, "calling 'tearDown' must execute 'closeApplication' only for non-skipped scenarios");
      }
    });

    var testGenerator = new GherkinTestGenerator(feature, steps);
    var featureTest = testGenerator.generate();
    strictEqual(featureTest.name, 'Feature: Serve humanity', 'Test 031');
    strictEqual(featureTest.testScenarios.length, 3, 'Test 032');
    for (var i=0; i<featureTest.testScenarios.length; ++i) {
      testGenerator.setUp();
      expectCloseApplication = testGenerator.execute(featureTest.testScenarios[i].testSteps[0]);
      testGenerator.tearDown();
    }
  });



  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Given @wip feature, calling 'tearDown' must NOT execute 'closeApplication'", function() {

    expect(1);

    var text = [
      '@wip',
      'Feature: Serve humanity',
      '  Scenario: Do something already',
      '    Then I do something (finally)'
    ].join('\n');

    var feature = this.parser.parse(text);

    var steps = StepDefinitions.extend('sap.ui.test.gherkin.StepDefinitionsTest', {
      init: function() {
        this.register(/^I do something \(finally\)$/i, function() {});
      },
      closeApplication: function() {
        ok(false, "Given @wip feature, calling 'tearDown' must NOT execute 'closeApplication'");
      }
    });

    var testGenerator = new GherkinTestGenerator(feature, steps);
    var featureTest = testGenerator.generate();
    strictEqual(featureTest.name, '(WIP) Feature: Serve humanity', 'Test 033');
    testGenerator.setUp();
    testGenerator.execute(featureTest.testScenarios[0].testSteps[0]);
    testGenerator.tearDown();
  });



  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Given feature with no scenarios, calling 'tearDown' must NOT execute 'closeApplication'", function() {

    expect(1);

    var text = [
      'Feature: Serve humanity'
    ].join('\n');

    var feature = this.parser.parse(text);

    var steps = StepDefinitions.extend('sap.ui.test.gherkin.StepDefinitionsTest', {
      closeApplication: function() {
        ok(false, "Given feature with no scenarios, calling 'tearDown' must NOT execute 'closeApplication'");
      }
    });

    var testGenerator = new GherkinTestGenerator(feature, steps);
    var featureTest = testGenerator.generate();
    strictEqual(featureTest.name, 'Feature: Serve humanity', 'Test 034');
    testGenerator.setUp();
    testGenerator.tearDown();
  });


  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Test steps share a context only within a single scenario", function() {

    expect(4);

    var text = [
      "Feature: Schrödinger's coffee",
      '    Leave a barista in a box for a while with a nuclear isotope,',
      '    open the box later and what do you see when the wave',
      '    function collapses?',
      '',
      '  Scenario: Buy expensive coffee when the barista is dead',
      '    Given the isotope emitted an alpha particle',
      '    And the poison was released',
      '    Then I should expect a dead barista',
      '',
      '  Scenario: Buy expensive coffee when the barista is alive',
      '    Given the isotope did not emit an alpha particle',
      '    Then I should expect a live barista'
    ].join('\n');

    var feature = this.parser.parse(text);

    var steps = StepDefinitions.extend('sap.ui.test.gherkin.StepDefinitionsTest', {
      init: function() {
        this.register(/^the isotope (emitted|did not emit) an alpha particle$/i, function(emitted) {
          this.emitted = (emitted === 'emitted');
        });
        this.register(/^the poison was released$/i, function() {
          this.poisonReleased = true;
        });
        this.register(/^I should expect a (live|dead) barista$/i, function(shouldBeDead) {
          shouldBeDead = (shouldBeDead === 'dead');
          ok(shouldBeDead === !!this.poisonReleased, 'test that context was cleared between scenarios');
          ok(shouldBeDead === this.emitted, 'test that context was retained while inside one scenario');
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
  QUnit.test("Test exceptions", function() {

    var text = [
      'Feature: Serve expensive coffee',
      '',
      '  Scenario: Buy first coffee',
      '    Then I should be served a coffee'
    ].join('\n');

    var feature = this.parser.parse(text);

    var steps = StepDefinitions.extend('sap.ui.test.gherkin.StepDefinitionsTest', {
      init: function() {
        this.register(/^I should be served a coffee$/i, function() {});
      }
    });

    var testGenerator = new GherkinTestGenerator(feature, steps);

    throws( function(){
      testGenerator.execute();
    }, function(error) {
      return error.message === "Run 'generate' before calling 'execute'";
    },
      "call 'execute' too early"
    );

    var featureTest = testGenerator.generate();

    throws( function(){
      testGenerator.execute();
    }, function(error) {
      return error.message === "Input parameter 'oTestStep' is not a valid TestStep object.";
    },
      "call 'execute' with undefined test step"
    );

    throws( function(){
      testGenerator.execute(100);
    }, function(error) {
      return error.message === "Input parameter 'oTestStep' is not a valid TestStep object.";
    },
      "call 'execute' with test step that's not an object"
    );

    throws( function(){
      testGenerator.execute({});
    }, function(error) {
      return error.message === "Input parameter 'oTestStep' is not a valid TestStep object.";
    },
      "call 'execute' with with an object, but it's not a TestStep"
    );

    ok(testGenerator.execute({skip: false, func: function(){}, parameters: []}), 'test exceptions');
  });



  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Test alternate test step generator", function() {

    var text = [
      'Feature: Serve expensive coffee',
      '',
      '  Scenario: Buy first coffee',
      '    Then I should be served a coffee',
      '    And this step does not exist in the steps file',
      '    And the generator will not match this one',
      '    And I should be served a coffee',
    ].join('\n');

    var feature = this.parser.parse(text);

    var normalStepFunction = function() {};
    var steps = StepDefinitions.extend('sap.ui.test.gherkin.StepDefinitionsTest', {
      init: function() {
        this.register(/^I should be served a coffee$/i, normalStepFunction);
      }
    });

    var alternateStepFunction = function() {};
    var testStepGenerator = function(oStep) {
      var isMatch = (oStep.text !== 'the generator will not match this one');
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
    strictEqual(featureTest.testScenarios[0].testSteps[0].text, 'I should be served a coffee', 'Test 035');
    strictEqual(featureTest.testScenarios[0].testSteps[0].func, normalStepFunction, 'Test 036');
    strictEqual(featureTest.testScenarios[0].testSteps[0].skip, false, 'Test 037');

    // If we fail to match, then we expect to use a generated step
    strictEqual(featureTest.testScenarios[0].testSteps[1].text, 'this step does not exist in the steps file', 'Test 038');
    strictEqual(featureTest.testScenarios[0].testSteps[1].func, alternateStepFunction, 'Test 039');
    strictEqual(featureTest.testScenarios[0].testSteps[1].skip, false, 'Test 040');

    // If we fail to match and the generated step says it's not a match, then it should be skipped!
    strictEqual(featureTest.testScenarios[0].testSteps[2].text, '(NOT FOUND) the generator will not match this one',
      'Test 041');
    strictEqual(featureTest.testScenarios[0].testSteps[2].func, alternateStepFunction, 'Test 042');
    strictEqual(featureTest.testScenarios[0].testSteps[2].skip, true, 'Test 043');

    // Since the third step was not found, this one should be skipped
    strictEqual(featureTest.testScenarios[0].testSteps[3].text, '(SKIPPED) I should be served a coffee', 'Test 044');
    strictEqual(featureTest.testScenarios[0].testSteps[3].func, normalStepFunction, 'Test 045');
    strictEqual(featureTest.testScenarios[0].testSteps[3].skip, true, 'Test 046');
  });



  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Test invalid input to constructor", function() {

    var badFeatureError = "GherkinTestGenerator constructor: parameter 'vFeature' must be a valid String or a valid Feature object";
    var badStepDefsError = "GherkinTestGenerator constructor: parameter 'fnStepDefsConstructor' must be a valid StepDefinitions constructor";
    var badAltGeneratorError = "GherkinTestGenerator constructor: if specified, parameter 'fnAlternateTestStepGenerator' must be a valid Function";


    throws( function(){
      new GherkinTestGenerator();
    }, function(error) {
      return error.message === badFeatureError;
    },
      "first parameter is not specified"
    );

    throws( function(){
      new GherkinTestGenerator(1000);
    }, function(error) {
      return error.message === badFeatureError;
    },
      "first parameter is not a String or Object"
    );

    throws( function(){
      new GherkinTestGenerator({});
    }, function(error) {
      return error.message === badFeatureError;
    },
      "first parameter is an object, but not a Feature object"
    );

    throws( function(){
      new GherkinTestGenerator(this.parser.parse('Feature: Serve coffee'));
    }, function(error) {
      return error.message === badStepDefsError;
    },
      "second parameter is not specified"
    );

    throws( function(){
      new GherkinTestGenerator(this.parser.parse('Feature: Serve coffee'), 'not a function');
    }, function(error) {
      return error.message === badStepDefsError;
    },
      "second parameter is not a function"
    );

    throws( function(){
      new GherkinTestGenerator(this.parser.parse('Feature: Serve coffee'), function(){});
    }, function(error) {
      return error.message === badStepDefsError;
    },
      "second parameter is a function, but not a StepDefs constructor"
    );

    throws( function(){
      new GherkinTestGenerator(this.parser.parse('Feature: Serve coffee'),
        StepDefinitions, 'not a function');
    }, function(error) {
      return error.message === badAltGeneratorError;
    },
      "third parameter is not a function"
    );

  });
  
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Scenario Outline should generate the scenario with single-column concrete values", function() {
    var text = [
      'Feature: Give cups of coffee to users',
      '',
      '  Scenario Outline: Coffee changes peoples moods',
      '    Then he should be "<MOOD>"',
      '',
      '  Examples:',
      '    | MOOD        |',
      '    | happy       |',
      '    | electrified |',
      '    | sad         |',
      ''
    ].join('\n');

    var feature = this.parser.parse(text);

    var regex2 = /^he should be "(.*?)"$/i;
    var function2 = function(mood) {};
    var steps = StepDefinitions.extend('sap.ui.test.gherkin.StepDefinitionsTest', {
      init: function() {
        this.register(regex2, function2);
      }
    });

    var testGenerator = new GherkinTestGenerator(feature, steps);
    var actualFeatureTest = testGenerator.generate();
    var expectedFeatureTest = {
      name: 'Feature: Give cups of coffee to users',
      skip: false,
      wip: false,
      testScenarios: [{
        name: 'Scenario Outline: Coffee changes peoples moods',
        wip: false,
        testSteps: [{
          isMatch: true,
          skip: false,
          text: 'he should be "happy"',
          regex: regex2,
          parameters: ['happy'],
          func: function2
        },{
          isMatch: true,
          skip: false,
          text: 'he should be "electrified"',
          regex: regex2,
          parameters: ['electrified'],
          func: function2
        },{
          isMatch: true,
          skip: false,
          text: 'he should be "sad"',
          regex: regex2,
          parameters: ['sad'],
          func: function2
        }]
      }]
    };

    deepEqual(actualFeatureTest, expectedFeatureTest,
      "Scenario Outline should generate the scenario with single-column concrete values");
  });

});
