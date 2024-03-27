sap.ui.define([
	"sap/base/Log",
	"sap/ui/test/gherkin/StepDefinitions",
	"sap/ui/test/gherkin/dataTableUtils",
	"GherkinWithQUnit/codeUnderTest"
], function(Log, StepDefinitions, DataTableUtils, oCodeUnderTest) {
	"use strict";

	var Steps = StepDefinitions.extend("GherkinWithQUnit.Steps", {
		init: function() {
			this.register(/^I expect (\d+?) assertions?$/i, function(sNumAssertions) {
				this.assert.expect(parseInt(sNumAssertions));
			});
			this.register(/^that quantum phenomena exist at the macroscopic level$/i, function() {
				this.bMacroQuanta = true;
			});
			this.register(/^that an alpha particle was( not)? detected$/i, function(sDetected) {
				this.bAlphaDetected = (sDetected !== " not");
			});
			this.register(/^the flask of poison should be (intact|broken)$/i, function(sBroken) {
				this.bFlaskBroken = this.bMacroQuanta && this.bAlphaDetected && (sBroken === "broken");
			});
			this.register(/^I should expect a (live|dead) barista$/i, function(sAlive) {
				var bExpectedToBeAlive = (sAlive === "live");
				this.assert.strictEqual(oCodeUnderTest.isAlive(this.bFlaskBroken), bExpectedToBeAlive,
					"Verified barista is " + sAlive);
			});
			this.register(/^coffee is an incredibly expensive luxury$/i, function() {
				this.bCoffeeIsExpensive = true;
			});
			this.register(/^I buy a (.+?) on (.+?)$/i, function(sCoffeeType, sDay) {
				oCodeUnderTest.addToRunningTotal(sCoffeeType);
			});
			this.register(/^my running total should be \$([\d\.]+?)$/i, function(sRunningTotal) {
				this.assert.strictEqual(oCodeUnderTest.getRunningTotal(), parseFloat(sRunningTotal),
					"Verified running total: $" + sRunningTotal);
			});
			this.register(/^I look at the coffee price list$/i, function() {
				this.oCoffeePriceList = oCodeUnderTest.getCoffeePriceList();
			});
			this.register(/^I should see the following prices:?$/i, function(aDataTable) {
				aDataTable = DataTableUtils.toTable(aDataTable, "camelCase");
				aDataTable.forEach(function(oCoffee) {
					var fCost = parseFloat(oCoffee.cost.substring(1));
					this.assert.strictEqual(this.oCoffeePriceList[oCoffee.coffeeType], fCost,
						"Verified " + oCoffee.coffeeType + " " + fCost);
				}, this);
			});
		},
		closeApplication: function() {
			Log.info("Closing application");
		}
	});

	return Steps;
});