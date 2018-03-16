/*!
 * ${copyright}
 */

/* global jQuery,QUnit */

// Load synchronously to avoid QUnit issue where tests run before QUnit is loaded
// Only load QUnit if it has not been loaded via script tag
if (!window.QUnit) {
  jQuery.sap.require("sap.ui.thirdparty.qunit");
}

// put qunit-coverage last so library files don't get measured  (we load StepDefinitions, even though we don't have to,
// so that it doesn't appear in the code coverage list, knowing that the user will need to load it)
sap.ui.define([
  "jquery.sap.global", "sap/ui/test/gherkin/GherkinTestGenerator",
  "sap/ui/test/gherkin/StepDefinitions", "sap/ui/qunit/qunit-css", "sap/ui/qunit/qunit-junit",
  "sap/ui/qunit/qunit-coverage"
], function($, GherkinTestGenerator) {
  'use strict';

  /**
   * Dynamically generates and executes QUnit tests based on a Gherkin feature file and step definitions
   *
   * Logs activity to QUnit, and some debug information to the console with the prefix "[GHERKIN]"
   *
   * @author Jonathan Benn
   * @alias sap.ui.test.gherkin.qUnitTestHarness
   * @namespace
   * @since 1.40
   * @public
   * @static
   */
  var qUnitTestHarness = {

    /**
     * Dynamically generates and executes QUnit tests
     *
     * @param {object} args - the arguments to the function
     * @param {string} args.featurePath - the path to the Gherkin feature file to parse, as an SAPUI5 module path. The
     *                                    ".feature" extension is assumed and should not be included. See
     *                                    {@link jQuery.sap.registerModulePath}
     * @param {function} args.steps - the constructor function of type {@link sap.ui.test.gherkin.StepDefinitions}
     * @public
     * @throws {Error} if any parameters are invalid
     * @function
     * @static
     */
    test: function(args) {

      if ($.type(args) !== "object") {
        throw new Error("qUnitTestHarness.test: input all arguments via a single object");
      }

      if ($.type(args.featurePath) !== "string") {
        throw new Error("qUnitTestHarness.test: parameter 'featurePath' must be a valid string");
      }

      if (($.type(args.steps) !== "function") || !((new args.steps())._generateTestStep)) {
        throw new Error("qUnitTestHarness.test: parameter 'steps' must be a valid StepDefinitions constructor");
      }

      var oTestGenerator = new GherkinTestGenerator(args.featurePath, args.steps);
      var oFeatureTest = oTestGenerator.generate();

      QUnit.module(oFeatureTest.name, {
        beforeEach: function() {
          oTestGenerator.setUp();
        },
        afterEach: function() {
          oTestGenerator.tearDown();
        }
      });

      $.sap.log.info("[GHERKIN] Running feature: '" + oFeatureTest.name + "'");
      oFeatureTest.testScenarios.forEach(function(oTestScenario) {
        var fnTestFunction = (!oFeatureTest.skip && !oTestScenario.skip) ? QUnit.test : QUnit.skip;
        fnTestFunction(oTestScenario.name, function(assert) {
          $.sap.log.info("[GHERKIN] Running scenario: '" + oTestScenario.name + "'");
          oTestScenario.testSteps.forEach(function(oTestStep) {
            $.sap.log.info("[GHERKIN] Running step: text='" + oTestStep.text + "' regex='" + oTestStep.regex + "'");
            assert.ok(oTestStep.isMatch, oTestStep.text);
            if (oTestStep.isMatch) {
              QUnit.config.current.assertions.pop(); // don't break QUnit expect() behaviour
            }
            oTestGenerator.execute(oTestStep, assert);
          });
        });
      });
    }
  };

  return qUnitTestHarness;
}, /* bExport= */ true);
