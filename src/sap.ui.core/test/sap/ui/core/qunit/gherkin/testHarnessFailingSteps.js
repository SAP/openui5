/*!
 * ${copyright}
 */

/* eslint-disable quotes */
/* global QUnit,sinon */

sap.ui.define([
  "jquery.sap.global",
  "sap/ui/test/gherkin/StepDefinitions",
  "sap/ui/test/gherkin/dataTableUtils"
], function($, StepDefinitions, dataTableUtils) {
  "use strict";

  return StepDefinitions.extend("test.Steps", {
    init: function() {

      this.register(/^I should be served a coffee$/i, function() {
        // no verifications -- this should cause the test to fail
      });

      this.register(/^I should not fail even with no assertions$/i, function() {
        // no verifications -- this should cause the test to fail unless it's @wip
      });

      this.register(/^It's too late to drink coffee$/i, function() {
        assert.expect(0);
      });

      this.register(/^coffee is best served espresso style$/i, function() {
        assert.expect(1);
        assert.ok(true);
      });

      this.register(/^an @wip feature grows no moss$/i, function() {
        // no verifications -- this should cause the test to fail unless it's @wip
      });

      this.register(/^this test step will get skipped$/i, function() {
        // we expect this test to never run because the step before it is not found
        assert.ok(true);
      });
    }
  });

});