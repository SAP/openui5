sap.ui.define([
	"sap/ui/test/gherkin/StepDefinitions",
	"sap/ui/test/gherkin/dataTableUtils"
], function(StepDefinitions, dataTableUtils) {
	"use strict";

	var Steps = StepDefinitions.extend("GherkinWithPageObjects.Steps", {

		init: function() {

			this.register(/^on page (\d) I should see the text "(.*?)"$/i,
			function(sPageNum, sText, Given, When, Then) {
				Then.onPage1.iShouldSeeTheText("text" + sPageNum, sText);
			});

			this.register(/^I should see the following fields:$/i,
			function(aDataTable, Given, When, Then) {

				var aObjects = dataTableUtils.toTable(aDataTable);

				aObjects.forEach(function(o) {
					Then.onPage1.iShouldSeeTheText(o.Name, o.Value);
				}, this);
			});

		}
	});

	return Steps;

});