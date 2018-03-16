/*!
 * ${copyright}
 */

/* global QUnit */
/* eslint-disable no-eval */

// Load synchronously to avoid QUnit issue where tests run before QUnit is loaded
// Only load QUnit if it has not been loaded via script tag
if (!window.QUnit) {
  jQuery.sap.require("sap.ui.thirdparty.qunit");
}

// put qunit-coverage last so library files don't get measured
sap.ui.define([
  "jquery.sap.global", "sap/ui/test/opaQunit", "sap/ui/test/Opa5",
  "sap/ui/test/gherkin/GherkinTestGenerator", "sap/ui/test/gherkin/dataTableUtils", "sap/ui/test/gherkin/StepDefinitions",
  "sap/ui/test/launchers/componentLauncher", "sap/ui/test/launchers/iFrameLauncher", "sap/ui/qunit/qunit-css",
  "sap/ui/qunit/qunit-junit", "sap/ui/qunit/qunit-coverage"
], function($, opaTest, Opa5, GherkinTestGenerator, dataTableUtils, StepDefinitions, componentLauncher,
  iFrameLauncher) {
  "use strict";

  /**
   * Dynamically generates and executes Opa5 tests based on a Gherkin feature file and step definitions.
   *
   * Logs activity to Opa5, and some debug information to the console with the prefix "[GHERKIN]"
   *
   * @author Jonathan Benn
   * @alias sap.ui.test.gherkin.opa5TestHarness
   * @namespace
   * @static
   * @since 1.40
   * @public
   */
  var opa5TestHarness = {

    // for testability these need to be accessible outside of public 'test' function's scope
    _oOpa5: new Opa5(),
    _opaTest: opaTest,
    _fnAlternateTestStepGenerator: function(oStep) {
      // Automatically generates test steps from Opa Page Objects, only used when args.generateMissingSteps is true

      var sToEval = oStep.keyword + ".";
      var sFinalFunction = oStep.text;
      var aMatch = oStep.text.match(/(.*?)\s*:\s*(.*)/);
      if (aMatch) {
        sToEval += dataTableUtils.normalization.camelCase(aMatch[1]) + ".";
        sFinalFunction = aMatch[2];
      }
      sToEval += dataTableUtils.normalization.camelCase(sFinalFunction) + "();";

      return {
        isMatch: true,
        text: oStep.text,
        regex: /Generated Step/,
        parameters: [],
        func: function(Given, When, Then) {
          $.sap.log.info("[GHERKIN] Generated Step: " + sToEval);
          eval(sToEval);
        },
        _sToEval: sToEval // exposing this for testability
      };
    },

    /**
     * Dynamically generates Opa5 tests
     *
     * If a test step is missing and args.generateMissingSteps is true then the  Gherkin step will be converted into Opa
     * Page Object code and executed. The text will be converted to camelCase and have any non-alphanumeric character
     * removed. Here are two pertinent examples:
     *
     * (1) The simple step "Given I start my app" will be converted into the call "Given.iStartMyApp();"
     *
     * (2) The step "Then on page 1: I should see the page 1 text" will become the call
     *     "Then.onPage1.iShouldSeeThePage1Text();"
     *
     * Chaining function calls, such as "Then.iStartMyApp().and.iCloseMyApp()" is not possible at this time.
     *
     * @param {object} args - the arguments to the function
     * @param {string} args.featurePath - the path to the Gherkin feature file to parse, as an SAPUI5 module path. The
     *                                    ".feature" extension is assumed and should not be included. See
     *                                    {@link jQuery.sap.registerModulePath}
     * @param {function} [args.steps] - the constructor function of type {@link sap.ui.test.gherkin.StepDefinitions}.
     *                                  If this parameter is ommitted then args.generateMissingSteps must be explicitly
     *                                  set to true.
     * @param {boolean} [args.generateMissingSteps=false] - When true: if a Gherkin step cannot be matched to a step
     *                                                      definition then it will be assumed that the user wants to
     *                                                      convert the step into an Opa Page Object call.
     * @public
     * @throws {Error} if any parameters are invalid
     * @function
     * @static
     */
    test: function(args) {

      if ($.type(args) !== "object") {
        throw new Error("opa5TestHarness.test: input all arguments via a single object");
      }

      if ($.type(args.featurePath) !== "string") {
        throw new Error("opa5TestHarness.test: parameter 'featurePath' must be a valid string");
      }

      if (args.steps && (($.type(args.steps) !== "function") || !((new args.steps())._generateTestStep))) {
        throw new Error("opa5TestHarness.test: if specified, parameter 'steps' must be a valid StepDefinitions constructor");
      }

      if (!args.steps && (args.generateMissingSteps !== true)) {
        throw new Error("opa5TestHarness.test: if parameter 'generateMissingSteps' is not true then parameter 'steps' must be a valid StepDefinitions constructor");
      }

      if (args.generateMissingSteps && ($.type(args.generateMissingSteps) !== "boolean")) {
        throw new Error("opa5TestHarness.test: if specified, parameter 'generateMissingSteps' must be a valid boolean");
      }

      // if the user did not input a StepDefinitions constructor
      if (!args.steps) {
        // then use a default StepDefinitions constructor
        args.steps = StepDefinitions;
      }
      var fnTestStepGenerator = (args.generateMissingSteps) ? this._fnAlternateTestStepGenerator : null;

      var oTestGenerator = new GherkinTestGenerator(args.featurePath, args.steps, fnTestStepGenerator);
      var oFeatureTest = oTestGenerator.generate();

      QUnit.module(oFeatureTest.name, {
        beforeEach: function() {
          oTestGenerator.setUp();
        },
        afterEach: function() {
          if (this._oOpa5.hasAppStarted()) {
            this._oOpa5.iTeardownMyApp();
          }

          // Add a link to the page to allow the user to close the frame
          if ($("#frame-close-link").length === 0) {
            $("#qunit-header").append('<input id="frame-close-link" type="button"' +
                'onclick="sap.ui.test.Opa5.emptyQueue(); $(\'#frame-close-link\').remove();" style="float: right; ' +
                'margin-right: 0.5em; margin-top: -0.4em;" value="Close &#13;&#10;Frame"></input>');
          }
          oTestGenerator.tearDown();
        }.bind(this)
      });

      $.sap.log.info("[GHERKIN] Running feature: '" + oFeatureTest.name + "'");
      oFeatureTest.testScenarios.forEach(function(oTestScenario) {
        var fnTestFunction = (!oFeatureTest.skip && !oTestScenario.skip) ? this._opaTest : QUnit.skip;
        fnTestFunction(oTestScenario.name, function(Given, When, Then) {
          $.sap.log.info("[GHERKIN] Running scenario: '" + oTestScenario.name + "'");
          oTestScenario.testSteps.forEach(function(oTestStep) {
            // Put test execution inside a waitFor so that they are executed in order, even if the user fails to put
            // a waitFor statement in one of the test steps
            this._oOpa5.waitFor({
              viewName: "",
              success: function() {
                $.sap.log.info("[GHERKIN] Running step: text='" + oTestStep.text + "' regex='" + oTestStep.regex + "'");
                Opa5.assert.ok(oTestStep.isMatch, oTestStep.text);
                if (oTestStep.isMatch) {
                  QUnit.config.current.assertions.pop(); // don't break QUnit expect() behaviour
                }
                oTestStep.parameters = (oTestStep.parameters || []).concat([Given, When, Then]);
                oTestGenerator.execute(oTestStep, Opa5.assert);
              }
            });
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  };

  return opa5TestHarness;
}, /* bExport= */ true);
