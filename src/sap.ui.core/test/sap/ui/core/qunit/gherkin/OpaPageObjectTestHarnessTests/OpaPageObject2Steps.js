/*!
 * ${copyright}
 */

/* eslint-disable quotes */
/* global sap.ui.test.gherkin */
(function($) {
'use strict';

$.sap.require("sap.ui.test.gherkin.StepDefinitions");
$.sap.require("sap.ui.test.gherkin.dataTableUtils");
var DataTableUtils = sap.ui.test.gherkin.dataTableUtils;

sap.ui.test.gherkin.StepDefinitions.extend('sap.ui.test.gherkin.test.OpaPageObject2Steps', {

  init: function() {

    this.register(/^on page (\d) I should see the text "(.*?)"$/i, function(sPageNum, sText, Given, When, Then) {
      Then.onPage1.iShouldSeeTheText('text' + sPageNum, sText);
    });

    this.register(/^I should see the following fields:$/i, function(aDataTable, Given, When, Then) {

      var aObjects = DataTableUtils.toTable(aDataTable);

      aObjects.forEach(function(o) {
        Then.onPage1.iShouldSeeTheText(o.Name, o.Value);
      }, this);
    });

  }
});

}(jQuery));