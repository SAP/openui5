sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/AggregationFilled"
], function (Opa5, AggregationFilled) {
	"use strict";

	Opa5.createPageObjects({
		onTheRulesPage: {

			assertions: {

				iShouldSeeRulesTreeTable: function () {
					return this.waitFor({
						id: "ruleList",
						matchers: new AggregationFilled({ name: "rows" }),
						viewName: "Analysis",
						viewNamespace: "sap.ui.support.supportRules.ui.views.",
						success: function () {
							Opa5.assert.ok(true, "TreeTable should have rules");
						},
						errorMessage: "No rules in the TreeTable"
					});
				}

			}

		}

	});

});