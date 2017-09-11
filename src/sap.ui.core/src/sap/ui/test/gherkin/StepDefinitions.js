/*!
 * ${copyright}
 */

sap.ui.define([
  "jquery.sap.global",
  "sap/ui/base/Object"
], function ($, UI5Object) {
  "use strict";

  /**
   * A Gherkin feature file is human-readable, and the computer does not know how to execute its steps. This
   * StepDefinitions class provides the interface between human and machine. It defines what each step in the Gherkin
   * feature file will actually do when it is executed.
   *
   * Meant to be implemented/overridden by a child object. Specifically, the functions "init" and "closeApplication"
   * need to be overridden.
   *
   * @abstract
   * @class
   * @author Rodrigo Jordao
   * @author Jonathan Benn
   * @extends sap.ui.base.Object
   * @alias sap.ui.test.gherkin.StepDefinitions
   * @since 1.40
   * @public
   */
	var StepDefinitions = UI5Object.extend("sap.ui.test.gherkin.StepDefinitions",
      /** @lends sap.ui.test.gherkin.StepDefinitions.prototype */ {

        constructor : function() {
          UI5Object.apply(this, arguments);

          /**
           * {StepDefinition[]} An array of StepDefinition objects, one of which is added to the array every time
           * the user calls the "register" method. Each StepDefinition object can generate one TestStep object.
           *
           * @see #register
           * @see #_generateTestStep
           * @private
           */
          this._aDefinitions = [];
          this.init();
        },

        /**
         * Registers the step definitions by calling the method "register".
         *
         * @see #register
         * @abstract
         * @public
         * @function
         * @static
         */
        init : function() {},

        /**
         * Closes the application and cleans up any mess made by the tests. To avoid erroneous exceptions during test
         * execution, make sure that it is safe to run this method even if the application was never started.
         *
         * @abstract
         * @public
         * @function
         * @static
         */
        closeApplication: function() {},

        /**
         * Registers a step definition.
         *
         * @param {RegExp} rRegex - the regular expression that matches the feature file step (with leading "Given", "When",
         *                          "Then", "But" or "*" removed). E.g. if the feature file has the step
         *                          "Then I should be served a coffee" it will be truncated to "I should be served a coffee"
         *                          and tested against "rRegex" to check for a match. The simple regular expression
         *                          /^I should be served a coffee$/i would match this text. The regular
         *                          expression can specify capturing groups, which will be passed as parameters to "fnFunc".
         * @param {function} fnFunc - the function to execute in the event that the regular expression matches. Receives
         *                            regular expression capturing groups as parameters in the same order that they are
         *                            specified in the regular expression. If a data table is specified for the step, it
         *                            will be passed as an additional final parameter. At execution time, all functions
         *                            within a particular scenario will execute within the same "this" context.
         * @throws {Error} if any parameters are invalid, or if method is called twice with the same value for 'rRegex'
         * @public
         * @function
         * @static
         */
        register : function(rRegex, fnFunc) {
          if ($.type(rRegex) !== "regexp") {
            throw new Error("StepDefinitions.register: parameter 'rRegex' must be a valid RegExp object");
          }
          if ($.type(fnFunc) !== "function") {
            throw new Error("StepDefinitions.register: parameter 'fnFunc' must be a valid Function");
          }

          this._aDefinitions.forEach(function(oStepDef) {
            if (oStepDef.rRegex.source === rRegex.source) {
              throw new Error("StepDefinitions.register: Duplicate step definition '" + rRegex + "'");
            }
          });

          this._aDefinitions.push({
            rRegex: rRegex,
            generateTestStep: function(oStep) {
              var aMatch = oStep.text.match(rRegex);
              if (!aMatch) { return {isMatch: false}; }
              var aParams = aMatch.slice(1);
              if (oStep.data) { aParams.push($.extend(true, [], oStep.data)); }
              return {
                isMatch: true,
                text: oStep.text,
                regex: rRegex,
                parameters: aParams,
                func: fnFunc
              };
            }
          });
        },

        /**
         * Searches through the registered step definitions, finds the one that matches the given feature file step and
         * generates a new TestStep object that combines the two.
         *
         * @param {object} oStep - a feature file step, optionally with an associated data table
         * @param {string} oStep.text - the feature file step's human-readable text
         * @returns {TestStep} a TestStep object
         * @see sap.ui.test.gherkin.GherkinTestGenerator
         * @private
         */
        _generateTestStep : function(oStep) {

          var aMatchingTestSteps = [];

          // for each registered step definition
          this._aDefinitions.forEach(function(oDefinition) {
            // check if the inputed Feature file step matches the registered step definition
            var oTestStep = oDefinition.generateTestStep(oStep);
            if (oTestStep.isMatch) {
              aMatchingTestSteps.push(oTestStep);
            }
          });

          // if a unique match was made
          if (aMatchingTestSteps.length === 1) {
            return aMatchingTestSteps[0];

          // if an ambiguous match was made
          } else if (aMatchingTestSteps.length > 1) {

            var sListOfHumanReadableRegexes = aMatchingTestSteps
              .map(function(i){return "'" + i.regex + "'";}) // e.g. ['/regex1/', '/regex2/', '/regex3/']
              .join(', ')                                    // e.g. "'/regex1/', '/regex2/', '/regex3/'"
              .replace(/,([^,]*)$/, ' and$1');               // e.g. "'/regex1/', '/regex2/' and '/regex3/'"

            throw new Error( "Ambiguous step definition error: " + aMatchingTestSteps.length + " step definitions " +
              sListOfHumanReadableRegexes + " match the feature file step '" + oStep.text + "'");
          }
          // else if no matches were made
          return {
            isMatch: false,
            text: "(NOT FOUND) " + oStep.text
          };
        }

      });

  return StepDefinitions;

});
