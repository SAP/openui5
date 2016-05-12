/*!
 * ${copyright}
 */

/* eslint-disable quotes */
/* global sap.ui.test.gherkin */
(function($) {
'use strict';

$.sap.require("sap.ui.test.gherkin.StepDefinitions");
$.sap.require("sap.ui.test.gherkin.dataTableUtils");
$.sap.require("sap.ui.test.Opa5");

var opa5 = new sap.ui.test.Opa5();
var DataTableUtils = sap.ui.test.gherkin.dataTableUtils;

function getNumberOfLemmingsSaved(oCore) {
  var label = oCore.byId('num-lemmings-saved');
  return parseInt(label.getText().match(/Number of lemmings saved: (\d+)/)[1]);
}

sap.ui.test.gherkin.StepDefinitions.extend('sap.ui.test.gherkin.test.Opa5TestHarnessSteps', {
  init: function() {

    this.register(/^I have started the app$/i, function() {
      opa5.iStartMyAppInAFrame('Opa5TestHarnessWebsite.html', 5);
    });
    this.register(/^I can see the life saving button$/i, function() {
      opa5.waitFor({
        id: 'life-saving-button',
        success: $.proxy(function(button) {
          strictEqual(button.getText(), 'Save a Lemming');
          this.core = sap.ui.test.Opa5.getWindow().sap.ui.getCore();
        }, this)
      });
    });
    this.register(/^I check how many lemmings have been saved already$/i, function() {
      this.numLemmings = getNumberOfLemmingsSaved(this.core);
    });
    this.register(/^I click on the life saving button\s*(\d*)?(?:\s*times)?$/i, function(sNumTimes) {
      var button = this.core.byId('life-saving-button');
      var iNumTimes = (sNumTimes) ? parseInt(sNumTimes) : 1;
      for (var i=0; i<iNumTimes; ++i) {
        button.firePress();
      }
    });
    this.register(/^I save a lemming's life$/i, function() {
      var expectedSavedLemmings = this.numLemmings + 1;
      strictEqual(getNumberOfLemmingsSaved(this.core), expectedSavedLemmings);
    });
    this.register(/^I can see the following named lemmings:$/i, function(aDataTable) {
      var lemmingId = 1;
      aDataTable.forEach(function(lemmingName) {
        var label = this.core.byId('lemming-name-' + lemmingId++);
        strictEqual(label.getText(), lemmingName, "Found: " + lemmingName);
      }, this);
    });
    this.register(/^I see (\w+) at the end of the list of named lemmings$/i, function(sName) {
      var layout = this.core.byId('layout');
      var content = layout.getContent();
      var lastContentItem = content[content.length - 1];
      strictEqual(lastContentItem.getText(), sName);
    });
  },
  closeApplication: function() {
    $.sap.log.info("[GHERKIN] End of Scenario");
  }
});

}(jQuery));