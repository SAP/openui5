/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.sjax"], function(jQuery) {
  "use strict";

  /**
   * Parses Gherkin files to enable automated integration testing. This is a simple parser only meant to parse
   * correctly formed Gherkin.
   *
   * @author Rodrigo Jordao
   * @author Jonathan Benn
   * @alias sap.ui.test.gherkin.simpleGherkinParser
   * @namespace
   * @static
   * @since 1.40
   * @private
   */
  var simpleGherkinParser = {

    /**
     * Parses correctly formed Gherkin. The parsed return object (a Gherkin feature!) looks like this:
     *
     * <pre>
     * {
     *   tags : ["@wip", "@integration"],
     *   name : "Serve coffee",
     *   background : {
     *     name : "<background>",
     *     steps : [
     *       { text : "there are 1 coffees left in the machine", keyword : "Given" }
     *     ]
     *   },
     *   scenarios : [
     *     {
     *       tags : ["@wip", "@integration", "@happy"],
     *       name : "Buy last coffee",
     *       steps : [
     *         { text : "I have deposited 1$", keyword : "When" },
     *         { text : "I press the coffee button", keyword : "And" },
     *         { text : "I should be served a coffee", keyword : "Then" }
     *       ],
     *       examples : [
     *         {
     *           tags : ["@wip", "@integration", "@happy"],
     *           name : "Coffee Types",
     *           data : ["Java", "Capuccino"]
     *         }
     *       ]
     *     }
     *   ]
     * }
     * </pre>
     *
     * @param {string} sText - Gherkin text to parse
     * @returns {object} parsed representation of the Gherkin feature
     * @public
     * @function
     * @static
     */
    parse: function(sText) {

      if (typeof sText !== "string" && !(sText instanceof String)) {
        throw new Error("simpleGherkinParser.parse: parameter 'sText' must be a valid string");
      }

      var aLines =
          sText.split("\n"). // get lines
          map(function(s){return s.replace(/^\s*#.*/,"").trim();}); // remove comment lines and trim every line

      var oFeature = null, oScenario = null, oStep = null, aTags = [], aFeatureTags = [], aScenarioTags = [];
      for (var i = 0; i < aLines.length; ++i) {
        var sLine = aLines[i];

        var bTagsMatch = !!sLine.match(/^(?:@[^ @]+)(?:\s+@[^ @]+)*$/);
        if (bTagsMatch) {
          aTags = sLine.split(/\s+/);
          continue;
        }

        var aFeatureMatch = sLine.match(/^Feature:(.+)$/);
        if (aFeatureMatch) {
          aFeatureTags = aTags;
          oFeature = {tags: aFeatureTags, name: aFeatureMatch[1].trim(), scenarios: []};
          aTags = [];
          continue;
        }

        var bBackgroundMatch = !!sLine.match(/^Background:/);
        if (bBackgroundMatch) {
          oScenario = oFeature.background = {name: "<background>", steps: []};
          continue;
        }

        var aScenarioOutlineMatch = sLine.match(/^Scenario Outline:(.+)/);
        var aScenarioMatch = sLine.match(/^Scenario:(.+)/) || aScenarioOutlineMatch;
        if (aScenarioMatch) {
          aScenarioTags = aFeatureTags.concat(aTags);
          oScenario = {tags: aScenarioTags, name: aScenarioMatch[1].trim(), steps: []};
          if (aScenarioOutlineMatch) {
            oScenario.examples = [];
          }
          oFeature.scenarios.push(oScenario);
          aTags = [];
          continue;
        }

        var aStepMatch = sLine.match(/^(Given|When|Then|And|But|\*)\s+(.+)$/);
        if (aStepMatch) {
          oStep = {text: aStepMatch[2].trim(), keyword: aStepMatch[1].trim()};
          oScenario.steps.push(oStep);
          continue;
        }

        var aExamplesMatch = sLine.match(/^Examples:(.+)?/);
        if (aExamplesMatch) {
          oScenario.examples.push({
            tags: aScenarioTags.concat(aTags),
            name: (aExamplesMatch[1]) ? aExamplesMatch[1].trim() : "",
            data: []
          });
          aTags = [];
          continue;
        }

        // Parse a data table
        var aRowMatch = sLine.match(/^\|(.*)\|$/);
        if (aRowMatch) {
          var vData = aRowMatch[1].split("|").map(function(s){return s.trim();});

          // if there is only one column in the row
          if (vData.length === 1) {
            // then don't create a matrix for nothing
            vData = vData[0];
          }

          if (oScenario.examples) {
            oScenario.examples[oScenario.examples.length - 1].data.push(vData);
            continue;
          }
          oStep.data = oStep.data || [];
          oStep.data.push(vData);
        }

      }

      // Convert any one-row tables into 1D arrays
      oFeature.scenarios.forEach(function(oScenario) {
        oScenario.steps.forEach(function(oStep) {
          // if the data table has only one row
          if (Array.isArray(oStep.data) && (oStep.data.length === 1) && Array.isArray(oStep.data[0])) {
            // then convert into a 1D array
            oStep.data = oStep.data[0];
          }
        });
      });

      return oFeature;
    },

    /**
     * Convenience function that loads the feature file at the given path and executes {@link #parse} on it, returning
     * the result.
     *
     * @param {string} sPath - the path to the feature file to load, as an SAPUI5 module path. The ".feature" extension is
     *                         assumed and should not be included.
     * @returns {object} the parsed Gherkin feature object
     * @see {@link #parse}
     * @see {@link jQuery.sap.registerModulePath}
     * @public
     * @function
     * @static
     */
    parseFile: function(sPath) {

      if (typeof sPath !== "string" && !(sPath instanceof String)) {
        throw new Error("simpleGherkinParser.parseFile: parameter 'sPath' must be a valid string");
      }

      // Interpret the path as a standard SAPUI5 module path
      sPath = sap.ui.require.toUrl((sPath).replace(/\./g, "/")) + ".feature";

      var oResult = jQuery.sap.sjax({
        url: sPath,
        dataType: "text"
      });

      if (!oResult.success) {
        throw new Error("simpleGherkinParser.parseFile: error loading URL: " + sPath);
      }

      return this.parse(oResult.data);
    }
  };

  return simpleGherkinParser;
}, /* bExport= */ true);
