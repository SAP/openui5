sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/AggregationFilled"
], function (Opa5, AggregationFilled) {
	"use strict";

	var sIssuesTableId = "issuesList",
		sViewName = "Issues",
		sViewNameSpace = "sap.ui.support.supportRules.ui.views.";

	Opa5.createPageObjects({
		onTheIssuesPage: {

			assertions: {
				iShouldSeeHighIssueInTemporaryLib: function () {
					return this.waitFor({
						id: sIssuesTableId,
						matchers: new AggregationFilled({name: "rows"}),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function (oTable) {
							var oFirstRow = oTable.getRows()[0],
								sText = oFirstRow.getCells()[0].getHtmlText(),
								bHasHighIssue = sText.indexOf("0 High") === -1;

							if (sText === "null") {
								bHasHighIssue = false;
							}

							Opa5.assert.ok(bHasHighIssue, "High issue was found");
						},
						errorMessage: "Could not find 'Issues' table"
					});
				}
			}
		}
	});

});