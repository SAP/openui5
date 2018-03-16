/*!
 * ${copyright}
 */

/* eslint-disable quotes */
/* global QUnit */

sap.ui.define([
  "jquery.sap.global",
  "sap/ui/test/gherkin/StepDefinitions"
], function($, StepDefinitions) {
  "use strict";

  return StepDefinitions.extend("test.Steps", {
    init: function() {

      // This step definition matches the test step "I should be served a coffee"
      this.register(/^I should be served a coffee$/i, function() {
        this.assert.ok(true);
      });

      // this step definition ALSO matches the test step "I should be served a coffee"!
      this.register(/^I should be served a .*$/i, function() {
        this.assert.ok(true);
      });
    }
  });

});