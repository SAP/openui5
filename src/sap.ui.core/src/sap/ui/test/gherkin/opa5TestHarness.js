/*!
 * ${copyright}
 */

/* global jQuery,QUnit */
/* eslint-disable quotes,consistent-this,no-eval */

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");

// put qunit-coverage last so library files don't get measured
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', "sap/ui/test/opaQunit", "sap/ui/test/Opa5",
  "sap/ui/test/gherkin/GherkinTestGenerator", "sap/ui/test/gherkin/dataTableUtils",
  "sap/ui/test/gherkin/StepDefinitions", "sap/ui/qunit/qunit-coverage"],
  function($, UI5Object, opaTest, Opa5, GherkinTestGenerator, dataTableUtils, StepDefinitions) {
  'use strict';

  /**
   * Dynamically generates Opa5 tests based on a Gherkin feature file and step definitions
   *
   * Logs activity to Opa5, and some debug information to the console with the prefix "[GHERKIN]"
   *
   * @author Jonathan Benn
   * @alias sap.ui.test.gherkin.opa5TestHarness
   * @extends sap.ui.base.Object
   * @since 1.38
   * @public
   */
  var oClass = UI5Object.extend('sap.ui.test.gherkin.opa5TestHarness', {});

  $.extend(sap.ui.test.gherkin.opa5TestHarness, /** @lends sap.ui.test.gherkin.opa5TestHarness */ {

    /**
     * Dynamically generates Opa5 tests
     *
     * For when generateMissingSteps is true the Gherkin step will be converted into Opa Page Object code and
     * executed. The text will be converted to camelCase and have any non-alphanumeric character removed. Here are two
     * pertinent examples:
     *
     * (1) The simple step "Given I start my app" will be converted into the call "Given.iStartMyApp();"
     *
     * (2) The step "Then on page 1: I should see the page 1 text" will become the call
     *     "Then.onPage1.iShouldSeeThePage1Text();"
     *
     * Chaining function calls, such as "Then.iStartMyApp().and.iCloseMyApp()" is not possible at this time.
     *
     * @param {object} args - the arguments to the function
     * @param {string} args.featurePath - the path to the Gherkin feature file to parse
     * @param {function} [args.steps] - the constructor function of type sap.ui.test.gherkin.StepDefinitions.
     * @param {boolean} [args.generateMissingSteps] - defaults to false. When true: if a Gherkin step cannot be matched to a
     *                                                step definition then it will be assumed that the author wants to
     *                                                convert the step into an Opa Page Object call.
     * @public
     */
    test: function(args) {

      if ($.type(args) !== "object") {
        throw new Error("opa5TestHarness.test: input all arguments via a single object");
      }

      if ($.type(args.featurePath) !== "string") {
        throw new Error("opa5TestHarness.test: parameter 'featurePath' must be a valid string");
      }

      if (args.steps && ($.type(args.steps) !== "function")) {
        throw new Error("opa5TestHarness.test: if specified, parameter 'steps' must be a valid StepDefinitions constructor");
      }

      if (!args.steps && (args.generateMissingSteps === false)) {
        throw new Error("opa5TestHarness.test: if parameter 'generateMissingSteps' is false then parameter 'steps' must be a valid StepDefinitions constructor");
      }

      if (args.generateMissingSteps && ($.type(args.generateMissingSteps) !== "boolean")) {
        throw new Error("opa5TestHarness.test: if specified, parameter 'generateMissingSteps' must be a valid boolean");
      }

      // Automatically generates test steps from Opa Page Objects, only used when args.generateMissingSteps is true
      var fnAlternateTestStepGenerator = function(oStep) {

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
          }
        };
      };

      // if the user does not input a Steps Definition
      if (!args.steps) {
        // then we assume that they want to generate test steps from Opa Page Objects
        args.generateMissingSteps = true;
        args.steps = StepDefinitions;
      }
      var fnTestStepGenerator = (args.generateMissingSteps) ? fnAlternateTestStepGenerator : null;

      var oTestGenerator = new GherkinTestGenerator(args.featurePath, args.steps, fnTestStepGenerator);
      var oFeatureTest = oTestGenerator.generate();
      var oOpa5 = new Opa5();

      QUnit.module(oFeatureTest.name, {
        setup: function() {
          oTestGenerator.setUp();
        },
        teardown: function() {
          oOpa5.iTeardownMyApp();
          // Add a link to the page to allow the user to close the frame
          if ($('#frame-close-link').length === 0) {
            $('#qunit-header').append('<input id="frame-close-link" type="button"' +
              'onclick="sap.ui.test.Opa5.emptyQueue(); $(\'#frame-close-link\').remove();" style="float: right; ' +
              'margin-right: 0.5em; margin-top: -0.4em;" value="Close &#13;&#10;Frame"></input>');
          }
          oTestGenerator.tearDown();
        }
      });

      $.sap.log.info("[GHERKIN] Running feature: '" + oFeatureTest.name + "'");
      oFeatureTest.testScenarios.forEach(function(oTestScenario) {
        var fnTestFunction = (!oTestScenario.wip) ? opaTest : QUnit.skip;
        fnTestFunction(oTestScenario.name, function(Given, When, Then) {
          $.sap.log.info("[GHERKIN] Running scenario: '" + oTestScenario.name + "'");
          oTestScenario.testSteps.forEach(function(oTestStep) {
            // Put test execution inside a waitFor so that they are executed in order, even if the user fails to put
            // a waitFor statement in one of the test steps
            oOpa5.waitFor({
              viewName: '',
              success: function() {
                $.sap.log.info("[GHERKIN] Running step: text='" + oTestStep.text + "' regex='" + oTestStep.regex + "'");
                Opa5.assert.ok(oTestStep.isMatch, oTestStep.text);
                if (oTestStep.isMatch) {
                  QUnit.config.current.assertions.pop(); // don't break QUnit expect() behaviour
                }
                oTestStep.parameters = oTestStep.parameters.concat([Given, When, Then]);
                oTestGenerator.execute(oTestStep);
              }
            });
          });
        });
      });
    }
  });

  return oClass;
});
