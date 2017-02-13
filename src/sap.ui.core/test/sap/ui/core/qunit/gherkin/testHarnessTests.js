/*!
 * ${copyright}
 *
 * This object runs all common tests for qUnitTestHarness and opa5TestHarness
 */

/* eslint-disable quotes */
/* global QUnit,sinon */

sap.ui.define([
  "jquery.sap.global",
  "sap/ui/test/gherkin/qUnitTestHarness",
  "sap/ui/test/gherkin/opa5TestHarness",
  "sap/ui/test/gherkin/simpleGherkinParser",
  "sap/ui/test/gherkin/StepDefinitions",
  "sap/ui/test/opaQunit",
  "sap/ui/test/Opa5",
  "sap/m/Label"
], function($, qUnitTestHarness, opa5TestHarness, simpleGherkinParser, StepDefinitions, opaTest, Opa5, Label) {
  'use strict';

  var oOpa5 = opa5TestHarness._oOpa5;

  var testHarnessTests = {

    setup: function(fMockSetup, fMockTeardown, oTestHarness) {

      // mocks the test harness's QUnit/Opa5 executions (use this carefully, only for a very limited scope)
      this.fMockSetup = fMockSetup;
      this.fMockTeardown = fMockTeardown;

      // Either qUnitTestHarness or opa5TestHarness
      this.oTestHarness = oTestHarness;
      this.sTestHarness = (oTestHarness === qUnitTestHarness) ? "qUnitTestHarness" : "opa5TestHarness";

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
    },

    teardown: function() {
      $.sap.log.removeLogListener(this.oLogListener);
      this.oParseFileStub.restore();
    },

    runTests: function() {

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

        this.fMockSetup();
        this.oTestHarness.test({
          featurePath: sText,
          steps: fSteps
        });
        this.fMockTeardown();

        assert.deepEqual(this.aLogs, [
          "[GHERKIN] Running feature: 'Feature: The meaning of life is hard to figure out, is it really 42?'",
          "[GHERKIN] Running scenario: 'Scenario: Determine the meaning of life'",
          "[GHERKIN] Running step: text='the pursuit of happiness is a good thing' regex='/^the pursuit of happiness is a good thing$/i'",
          "[GHERKIN] Running step: text='I should at least try to be happy' regex='/^I should at least try to be happy$/i'"
        ], "Logs are correct");

      }.bind(this));

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

        this.fMockSetup();
        this.oTestHarness.test({
          featurePath: sText,
          steps: fSteps
        });
        this.fMockTeardown();

        assert.ok(fSpy1.calledOnce, "First test step was executed normally");
        assert.notOk(fSpy2.called, "Second test step was skipped because it was @wip");
        assert.notOk(fSpy3.called, "Third test step was skipped because it was @wip");
      }.bind(this));



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

        this.fMockSetup();
        this.oTestHarness.test({
          featurePath: sText,
          steps: fSteps
        });
        this.fMockTeardown();

        assert.ok(fSpy1.calledOnce, "First test step was executed normally");
        assert.ok(fSpy2.calledOnce, "Second test step was executed normally");
        assert.notOk(fSpy4.called, "Fourth test step was skipped because previous step was not found");
      }.bind(this));


      // //////////////////////////////////////////////////////////////////////////////////////////////////////
      // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
      // //////////////////////////////////////////////////////////////////////////////////////////////////////
      opaTest("Deep testing of duplicate step definition behaviour", function() {

        // Unfortunately, the duplicate error bubbles up out of the frame, so we must ask QUnit to ignore it.
        // Fortunately, setting ignoreGlobalErrors only affects the current test so no cleanup is required.
        QUnit.config.current.ignoreGlobalErrors = true;

        oOpa5.iStartMyAppInAFrame("testHarnessDuplicate.html?harness=" + this.sTestHarness);

        oOpa5.waitFor({
          id: "testing-done",
          success: function() {

            var oFrame$ = sap.ui.test.Opa5.getWindow().$;

            var sTestResult = oFrame$("#qunit-testresult").text();
            var rRegex = /\d+ assertions of (\d+) passed, (\d+) failed\./i;
            var sResults = rRegex.exec(sTestResult);
            var iFailedTests = parseInt(sResults[2], 10);
            var iTotalTests = parseInt(sResults[1], 10);
            Opa5.assert.strictEqual(iFailedTests, 1, "Verified failed tests");
            Opa5.assert.strictEqual(iTotalTests, 1, "Verified total tests");

            var oDupe = oFrame$('.test-message')
              .filter(':contains("StepDefinitions.register: Duplicate step definition \'/^duplicate regex$/i\'")');
            Opa5.assert.strictEqual(oDupe.length, 1, 'Verified found text "Duplicate step definition"');

            oOpa5.iTeardownMyApp();
          }
        });
      }.bind(this));



      // //////////////////////////////////////////////////////////////////////////////////////////////////////
      // TEST /////////////////////////////////////////////////////////////////////////////////////////////////
      // //////////////////////////////////////////////////////////////////////////////////////////////////////
      opaTest("Deep testing of test harness behaviour", function() {

        oOpa5.iStartMyAppInAFrame("testHarnessFailing.html?harness=" + this.sTestHarness);

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

            oOpa5.iTeardownMyApp();
          }
        });
      }.bind(this));

    }

  };

  return testHarnessTests;

}, /* bExport= */ true);
