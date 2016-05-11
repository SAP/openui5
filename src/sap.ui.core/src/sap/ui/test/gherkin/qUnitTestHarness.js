/*!
 * ${copyright}
 */

/* global jQuery,QUnit,assert */
/* eslint-disable quotes,consistent-this */

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");

// put qunit-coverage last so library files don't get measured (we load StepDefinitions first so it doesn't appear in
// the code coverage list)
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', "sap/ui/test/gherkin/GherkinTestGenerator",
  "sap/ui/test/gherkin/StepDefinitions", "sap/ui/qunit/qunit-coverage"], function($, UI5Object, GherkinTestGenerator) {
  'use strict';

  /**
   * Dynamically generates and executes QUnit tests based on a Gherkin feature file and step definitions
   *
   * Logs activity to QUnit, and some debug information to the console with the prefix "[GHERKIN]"
   *
   * @author Jonathan Benn
   * @alias sap.ui.test.gherkin.qUnitTestHarness
   * @extends sap.ui.base.Object
   * @since 1.38
   * @public
   */
  var oClass = UI5Object.extend('sap.ui.test.gherkin.qUnitTestHarness', {});

  $.extend(sap.ui.test.gherkin.qUnitTestHarness, /** @lends sap.ui.test.gherkin.qUnitTestHarness */ {

    /**
     * Dynamically generates and executes QUnit tests
     *
     * @param {object} args - the arguments to the function
     * @param {string} args.featurePath - the path to the Gherkin feature file to parse
     * @param {function} args.steps - the constructor function of type sap.ui.test.gherkin.StepDefinitions
     * @public
     */
    test: function(args) {

      if ($.type(args) !== "object") {
        throw new Error("qUnitTestHarness.test: input all arguments via a single object");
      }

      if ($.type(args.featurePath) !== "string") {
        throw new Error("qUnitTestHarness.test: parameter 'featurePath' must be a valid string");
      }

      if ($.type(args.steps) !== "function") {
        throw new Error("qUnitTestHarness.test: parameter 'steps' must be a valid StepDefinitions constructor");
      }

      var oTestGenerator = new GherkinTestGenerator(args.featurePath, args.steps);
      var oFeatureTest = oTestGenerator.generate();

      QUnit.module(oFeatureTest.name, {
        setup: function() {
          oTestGenerator.setUp();
        },
        teardown: function() {
          oTestGenerator.tearDown();
        }
      });

      $.sap.log.info("[GHERKIN] Running feature: '" + oFeatureTest.name + "'");
      oFeatureTest.testScenarios.forEach(function(oTestScenario) {
        var fnTestFunction = (!oTestScenario.wip) ? QUnit.test : QUnit.skip;
        fnTestFunction(oTestScenario.name, function() {
          $.sap.log.info("[GHERKIN] Running scenario: '" + oTestScenario.name + "'");
          oTestScenario.testSteps.forEach(function(oTestStep) {
            $.sap.log.info("[GHERKIN] Running step: text='" + oTestStep.text + "' regex='" + oTestStep.regex + "'");
            assert.ok(oTestStep.isMatch, oTestStep.text);
            if (oTestStep.isMatch) {
              QUnit.config.current.assertions.pop(); // don't break QUnit expect() behaviour
            }
            oTestGenerator.execute(oTestStep);
          });
        });
      });
    }

  });

  return oClass;
});
