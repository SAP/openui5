/*!
 * ${copyright}
 */

/* eslint-disable quotes */
/* global QUnit,sinon */

sap.ui.require([
  "jquery.sap.global",
  "sap/ui/test/gherkin/qUnitTestHarness",
  "sap/ui/test/gherkin/simpleGherkinParser",
  "sap/ui/test/gherkin/StepDefinitions",
  "sap/ui/test/opaQunit",
  "sap/ui/test/Opa5",
  "sap/m/Label"
], function($, qUnitTestHarness, simpleGherkinParser, StepDefinitions, opaTest, Opa5, Label) {
  'use strict';

  var oOpa5 = new Opa5();

  QUnit.module("QUnit Test Harness Tests", {

    setup : function() {

			// capture logs in a local variable
      this.aLogs = [];
      this.oLogListener = {
        onLogEntry: function(oLog) {
          this.aLogs.push(oLog.message);
        }.bind(this)
      };
      $.sap.log.addLogListener(this.oLogListener);

      // mocks simpleGherkinParser to allow us to directly pass Gherkin text instead of needing a separate file
      this.oParseFileStub = sinon.stub(simpleGherkinParser, 'parseFile', function(sPath) {
        return simpleGherkinParser.parse(sPath);
      });

      // mocks the test harness's QUnit executions (use this carefully, only for a very limited scope)
      this.mockQUnitSetup = function() {
        this.oQUnitTestStub = sinon.stub(QUnit, 'test', function(scenarioName, callback) {
          callback();
        });
        this.oQUnitSkipStub = sinon.stub(QUnit, 'skip', function(scenarioName, callback) {
          callback();
        });
        this.oQUnitOkStub = sinon.stub(assert, 'ok');
      };

      // restores QUnit to normal
      this.mockQUnitTeardown = function() {
        this.oQUnitTestStub.restore();
        this.oQUnitSkipStub.restore();
        this.oQUnitOkStub.restore();
      };
    },

    teardown: function() {
      $.sap.log.removeLogListener(this.oLogListener);
      this.oParseFileStub.restore();
    }

  });



  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Given invalid parameters, when I call 'test', then I get an error", function() {

    var sObjectError = "qUnitTestHarness.test: input all arguments via a single object";
    var sFeaturePathError = "qUnitTestHarness.test: parameter 'featurePath' must be a valid string";
    var sStepsError = "qUnitTestHarness.test: parameter 'steps' must be a valid StepDefinitions constructor";

    assert.throws( function() {
      qUnitTestHarness.test();
    }, function(oError) {
      return oError.message === sObjectError;
    },
      "call 'test' with no parameters at all"
    );

    assert.throws( function() {
      qUnitTestHarness.test(42);
    }, function(oError) {
      return oError.message === sObjectError;
    },
      "call 'test' with a non-object parameter"
    );

    assert.throws( function( ) {
      qUnitTestHarness.test({steps: new function(){}});
    }, function(oError) {
      return oError.message === sFeaturePathError;
    },
      "'featurePath' parameter is omitted"
    );

    assert.throws( function() {
      qUnitTestHarness.test({featurePath: 12, steps: function(){}});
    }, function(oError) {
      return oError.message === sFeaturePathError;
    },
      "'featurePath' parameter is not a string"
    );

    assert.throws( function() {
      qUnitTestHarness.test({featurePath: 'hello world'});
    }, function(oError) {
      return oError.message === sStepsError;
    },
      "'steps' parameter is omitted"
    );

    assert.throws( function() {
      qUnitTestHarness.test({featurePath: 'hello world', steps: 12});
    }, function(oError) {
      return oError.message === sStepsError;
    },
      "'steps' parameter is not a function"
    );

    assert.throws( function() {
      qUnitTestHarness.test({featurePath: 'goodbye cruel world!', steps: Error});
    }, function(oError) {
      return oError.message === sStepsError;
    },
      "'steps' parameter is not a StepDefinitions constructor (also not a SAPUI5 object)"
    );

    assert.throws( function() {
      qUnitTestHarness.test({featurePath: 'goodbye cruel world!', steps: Label});
    }, function(oError) {
      return oError.message === sStepsError;
    },
      "'steps' parameter is not a StepDefinitions constructor (but is a SAPUI5 object)"
    );

    // Make sure it does not throw an exception to pass in the parent StepDefinitions class rather than the expected child
    qUnitTestHarness.test({featurePath: 'Feature: success', steps: StepDefinitions});
    assert.ok(true, "'steps' parameter can be a direct StepDefinitions constructor");
  });

  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Smoke test for regular logging", function() {

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
        this.register(/^I should at least try to be happy$/i, function() {});
      }
    });

    this.mockQUnitSetup();
    qUnitTestHarness.test({
      featurePath: sText,
      steps: fSteps
    });
    this.mockQUnitTeardown();

    assert.deepEqual(this.aLogs, [
      "[GHERKIN] Running feature: 'Feature: The meaning of life is hard to figure out, is it really 42?'",
      "[GHERKIN] Running scenario: 'Scenario: Determine the meaning of life'",
      "[GHERKIN] Running step: text='the pursuit of happiness is a good thing' regex='/^the pursuit of happiness is a good thing$/i'",
      "[GHERKIN] Running step: text='I should at least try to be happy' regex='/^I should at least try to be happy$/i'"
    ], "Logs are correct");

  });



  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Given an @wip scenario, then its test steps should not execute", function() {

    var sText = [
      "Feature: The meaning of life is hard to figure out",
      "",
      "  Scenario: Determine the value of 3 times 3",
      "    Given 3 times 3 equals 9",
      "",
      " @wip",
      "  Scenario: Determine the true meaning of life",
      "    Given the meaning of life is 42",
      "    Then what is the ultimate question?",
    ].join("\n");

    var fSpy1 = sinon.spy();
    var fSpy2 = sinon.spy();
    var fSpy3 = sinon.spy();

    var fSteps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
      init: function() {
        this.register(/^3 times 3 equals 9$/i, fSpy1);
        this.register(/^the meaning of life is 42$/i, fSpy2);
        this.register(/^what is the ultimate question\?$/i, fSpy3);
      }
    });

    this.mockQUnitSetup();
    qUnitTestHarness.test({
      featurePath: sText,
      steps: fSteps
    });
    this.mockQUnitTeardown();

    assert.ok(fSpy1.calledOnce, "First test step was executed normally");
    assert.notOk(fSpy2.called, "Second test step was skipped because it was @wip");
    assert.notOk(fSpy3.called, "Third test step was skipped because it was @wip");
  });



  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  QUnit.test("Given a not found test step, then skipped tests don't execute", function() {

    var sText = [
      "Feature: The meaning of life is hard to figure out",
      "",
      "  Scenario: Determine the value of 3 times 3",
      "    Given 3 times 3 equals 9",
      "",
      "  Scenario: Determine the true meaning of life",
      "    Given the meaning of life is 42",
      "    When I create a planet-sized calculator",
      "    Then I discover the ultimate question",
    ].join("\n");

    var fSpy1 = sinon.spy();
    var fSpy2 = sinon.spy();
    var fSpy4 = sinon.spy();

    var fSteps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
      init: function() {
        this.register(/^3 times 3 equals 9$/i, fSpy1);
        this.register(/^the meaning of life is 42$/i, fSpy2);
        // specifically, we have not registered "I create a planet-sized calculator"
        this.register(/^I discover the ultimate question$/i, fSpy4);
      }
    });

    this.mockQUnitSetup();
    qUnitTestHarness.test({
      featurePath: sText,
      steps: fSteps
    });
    this.mockQUnitTeardown();

    assert.ok(fSpy1.calledOnce, "First test step was executed normally");
    assert.ok(fSpy2.calledOnce, "Second test step was executed normally");
    assert.notOk(fSpy4.called, "Fourth test step was skipped because previous step was not found");
  });



  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////////////////////////////////////////
  opaTest("Deep testing of qUnitTestHarness behaviour", function() {

    oOpa5.iStartMyAppInAFrame("qUnitTestHarnessFailing.html");

    oOpa5.waitFor({
      id: "testing-done",
      success: function() {

        var oFrame$ = sap.ui.test.Opa5.getWindow().$;

        var sTestResult = oFrame$("#qunit-testresult").text();
        var rRegex = /\d+ assertions of (\d+) passed, (\d+) failed\./i;
        var sResults = rRegex.exec(sTestResult);
        var iFailedTests = parseInt(sResults[2], 10);
        var iTotalTests = parseInt(sResults[1], 10);
        Opa5.assert.strictEqual(iFailedTests, 2, "Verified failed tests");
        Opa5.assert.strictEqual(iTotalTests, 3, "Verified total tests");

        var oCoffee = oFrame$('.test-message').filter(':contains("I should be served a coffee")');
        Opa5.assert.strictEqual(oCoffee.length, 1, 'Verified found text "I should be served a coffee"');

        var oWip = oFrame$('.test-name')
          .filter(':contains("(WIP) Scenario: Don\'t fail a test with no assertions, if it\'s @wip")');
        Opa5.assert.strictEqual(oWip.length, 1, 'Verified that @wip stops a test with no assertions from failing');

        var oActualError = oCoffee.parent().parent().find('.test-message').last();
        Opa5.assert.strictEqual(
          oActualError.text(),
          'Expected at least one assertion, but none were run - call expect(0) to accept zero assertions.',
          'Verified that scenario with no assertions triggers expect(0) error message'
        );

        var oNoCoffee = oFrame$('.test-message').filter(':contains("It\'s too late to drink coffee")');
        Opa5.assert.strictEqual(oNoCoffee.length, 1, 'Verified that expect(0) stops an assertion-less test from failing');

        var oWipFeature = oFrame$('.module-name')
          .filter(':contains("(WIP) Feature: An @wip feature automatically sets all its scenarios as @wip too")');
        Opa5.assert.strictEqual(oWipFeature.length, 1, 'Verified that @wip feature does not run its scenarios"');

        var sNotFoundText = oFrame$('.test-message').filter(':contains("this test step does not exist and should fail the build")')
          .parent().parent().find('.test-message').last().text();
        Opa5.assert.ok(sNotFoundText.indexOf("expect(0)") === -1,
          'Verified that a (NOT FOUND) test step doesn\'t trigger an expect(0) error"');
      }
    });
  });

});
