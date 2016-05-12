/*!
 * ${copyright}
 */

/* eslint-disable quotes */
/* global sap.ui.test.gherkin */
(function($) {
'use strict';

$.sap.require("sap.ui.test.gherkin.StepDefinitions");
$.sap.require("sap.ui.test.gherkin.dataTableUtils");
$.sap.require("sap.ui.test.gherkin.test.QUnitTestHarnessCode");

var code = sap.ui.test.gherkin.test.QUnitTestHarnessCode;
var DataTableUtils = sap.ui.test.gherkin.dataTableUtils;

sap.ui.test.gherkin.StepDefinitions.extend('sap.ui.test.gherkin.test.QUnitTestHarnessSteps', {
  init: function() {
    this.register(/^I expect (\d+?) assertions?$/i, function(numAssertions) {
      assert.expect(parseInt(numAssertions));
    });
    this.register(/^that quantum phenomena exist at the macroscopic level$/i, function() {
      this.macroQuanta = true;
    });
    this.register(/^that an alpha particle was( not)? detected$/i, function(detected) {
      this.alphaDetected = (detected !== ' not');
    });
    this.register(/^the flask of poison should be (intact|broken)$/i, function(broken) {
      this.flaskBroken = this.macroQuanta && this.alphaDetected && (broken === 'broken');
    });
    this.register(/^I should expect a (live|dead) barista$/i, function(alive) {
      var expectedToBeAlive = (alive === 'live');
      assert.strictEqual(code.isAlive(this.flaskBroken), expectedToBeAlive, 'Barista is ' + alive);
    });
    this.register(/^coffee is an incredibly expensive luxury$/i, function() {
      this.coffeeIsExpensive = true;
    });
    this.register(/^I buy a (.+?) on (.+?)$/i, function(coffeeType, day) {
      code.addToRunningTotal(coffeeType);
    });
    this.register(/^my running total should be \$([\d\.]+?)$/i, function(runningTotal) {
      assert.strictEqual(code.getRunningTotal(), parseFloat(runningTotal));
    });
    this.register(/^I look at the coffee price list$/i, function() {
      this.coffeePriceList = code.getCoffeePriceList();
    });
    this.register(/^I should see the following prices:?$/i, function(dataTable) {
      dataTable = DataTableUtils.toTable(dataTable, "camelCase");
      dataTable.forEach(function(coffee) {
        var cost = parseFloat(coffee.cost.substring(1));
        assert.strictEqual(this.coffeePriceList[coffee.coffeeType], cost, coffee.coffeeType + " " + cost);
      }, this);
    });
  },
  closeApplication: function() {
    $.sap.log.info("[GHERKIN] End of Scenario");
  }
});

}(jQuery));