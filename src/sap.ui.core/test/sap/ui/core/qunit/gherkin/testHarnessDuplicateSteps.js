/*!
 * ${copyright}
 */

/* eslint-disable quotes */

sap.ui.define([
  "jquery.sap.global",
  "sap/ui/test/gherkin/StepDefinitions"
], function($, StepDefinitions) {
  "use strict";

  return StepDefinitions.extend("test.Steps", {
    init: function() {

      this.register(/^duplicate regex$/i, function() {
        this.assert.ok(true);
      });

      // this second call will fail!
      this.register(/^duplicate regex$/i, function() {
        this.assert.ok(true);
      });
    }
  });

});