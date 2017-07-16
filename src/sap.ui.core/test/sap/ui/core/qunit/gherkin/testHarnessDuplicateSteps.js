/*!
 * ${copyright}
 */

/* eslint-disable quotes */
/* global QUnit,sinon */

sap.ui.define([
  "jquery.sap.global",
  "sap/ui/test/gherkin/StepDefinitions"
], function($, StepDefinitions) {
  "use strict";

  return StepDefinitions.extend("test.Steps", {
    init: function() {

      this.register(/^duplicate regex$/i, function() {
        assert.ok(true);
      });

      // this second call will fail!
      this.register(/^duplicate regex$/i, function() {
        assert.ok(true);
      });
    }
  });

});