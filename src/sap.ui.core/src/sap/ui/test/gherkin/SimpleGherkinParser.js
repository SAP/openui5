/*!
 * ${copyright}
 */

/* global jQuery */
/* eslint-disable quotes,no-loop-func */

sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object'], function ($, UI5Object) {
  'use strict';

  /**
   * Parses Gherkin files to enable automated integration testing. This is a simple parser only meant to parse
   * correctly formed Gherkin.
   *
   * @author Rodrigo Jordao
   * @author Jonathan Benn
   * @alias sap.ui.test.gherkin.SimpleGherkinParser
   * @extends sap.ui.base.Object
   * @since 1.38
   * @public
   */
  var oClass = UI5Object.extend('sap.ui.test.gherkin.SimpleGherkinParser', {});

  $.extend(sap.ui.test.gherkin.SimpleGherkinParser, /** @lends sap.ui.test.gherkin.SimpleGherkinParser.prototype */ {

    /**
     * Parses correctly formed Gherkin. The parsed return object (a Gherkin feature!) looks like this:
     *
     * <pre>
     * {
     *   tags : ['@wip', '@integration'],
     *   name : 'Serve coffee',
     *   background : {
     *     name : '<background>',
     *     steps : [
     *       { text : 'there are 1 coffees left in the machine', keyword : 'Given' }
     *     ]
     *   },
     *   scenarios : [
     *     {
     *       tags : ['@wip', '@integration', '@happy'],
     *       name : 'Buy last coffee',
     *       steps : [
     *         { text : 'I have deposited 1$', keyword : 'When' },
     *         { text : 'I press the coffee button', keyword : 'And' },
     *         { text : 'I should be served a coffee', keyword : 'Then' }
     *       ]
     *     }
     *   ]
     * }
     * </pre>
     *
     * @param {string} sText - Gherkin text to parse
     * @returns {object} parsed representation of the Gherkin feature
     * @public
     */
    parse: function(sText) {

      if ($.type(sText) !== "string") {
        throw new Error("SimpleGherkinParser.parse: parameter 'sText' must be a valid string");
      }

      var aLines =
          sText.split('\n'). // get lines
          map(function(s){return s.replace(/^\s*#.*/,"").trim();}); // remove comment lines and trim every line

      var oFeature = null, oScenario = null, oStep = null, aTags = [], aFeatureTags = [], aScenarioTags = [];
      for (var i = 0; i < aLines.length; ++i) {
        var sLine = aLines[i];

        var bTagsMatch = !!sLine.match(/^(?:@\w+)(?:\s+@\w+)*$/);
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
          oScenario = oFeature.background = {name: '<background>', steps: []};
          continue;
        }

        var aScenarioMatch = sLine.match(/^Scenario:(.+)/) || sLine.match(/^Scenario Outline:(.+)/);
        if (aScenarioMatch) {
          aScenarioTags = aFeatureTags.concat(aTags);
          oScenario = {tags: aScenarioTags, name: aScenarioMatch[1].trim(), steps: []};
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

        var bExamplesMatch = !!sLine.match(/^Examples:/);
        if (bExamplesMatch) {
          oScenario.examples = [];
          continue;
        }

        // Parse a data table
        var aRowMatch = sLine.match(/^\|(.*)\|$/);
        if (aRowMatch) {
          var vData = aRowMatch[1].split('|').map(function(s){return s.trim();});

          // if there is only one column in the row
          if (vData.length === 1) {
            // then don't create a matrix for nothing
            vData = vData[0];
          }

          if (oScenario.examples) {
            oScenario.examples.push(vData);
            continue;
          }
          oStep.data = oStep.data || [];
          oStep.data.push(vData);
          continue;
        }

      }

      return oFeature;
    },

    /**
     * Convenience function that loads the feature file at the given path and executes {@link #parse} on it, returning
     * the result.
     *
     * @param {string} sPath - the path to the feature file to load, as a SAPUI5 module path. The '.feature' extension is
     *                         assumed and should not be included.
     * @returns {object} the parsed Gherkin feature object
     * @see {@link #parse}
     * @public
     */
    parseFile: function(sPath) {

      if ($.type(sPath) !== "string") {
        throw new Error("SimpleGherkinParser.parseFile: parameter 'sPath' must be a valid string");
      }

      // Interpret the path as a standard SAPUI5 module path
      var sPath = $.sap.getModulePath(sPath, '.feature');

      var oResult = $.sap.sjax({
        url: sPath,
        dataType: "text"
      });

      if (!oResult.success) {
        throw new Error("SimpleGherkinParser.parseFile: error loading URL: " + sPath);
      }

      return this.parse(oResult.data);
    }
  });

  return oClass;
});
