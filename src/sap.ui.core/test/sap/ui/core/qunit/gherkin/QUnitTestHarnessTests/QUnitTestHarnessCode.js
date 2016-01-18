/*!
 * ${copyright}
 */

/* eslint-disable quotes */
/* global sap.ui.test.gherkin */
(function($) {
'use strict';

$.sap.declare("sap.ui.test.gherkin.test.QUnitTestHarnessCode");

sap.ui.test.gherkin.test.QUnitTestHarnessCode = {
  isAlive: function(flaskBroken) {
    return !flaskBroken;
  },
  addToRunningTotal: function(coffeeType) {
    this.runningTotal = this.runningTotal || 0;
    this.runningTotal += this.getCoffeePriceList()[coffeeType];
  },
  getRunningTotal: function() {
    return this.runningTotal;
  },
  getCoffeePriceList: function() {
    return {
      "Moca Frappachino": 8.34,
      "Milky Coffeeola": 17.00,
      "Espresso-max": 6.00,
      "Sweet Dark Mixola": 12.00,
      "Demonic Jolt": 6.66,
      "Heavenly Blend": 333.77
    }
  }
}


}(jQuery));