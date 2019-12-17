/*!
 * ${copyright}
 */
sap.ui.define([
	"./TableHelper.support",
	"sap/ui/support/library",
	"sap/ui/core/library"
], function(SupportHelper, SupportLibrary, CoreLibrary) {
	"use strict";

	var Categories = SupportLibrary.Categories;
	var Severity = SupportLibrary.Severity;
	var MessageType = CoreLibrary.MessageType;

	/*
	 * Validates whether title or aria-labelledby is correctly set
	 */
	var oAccessibleLabel = SupportHelper.normalizeRule({
		id: "AccessibleLabel",
		minversion: "1.38",
		categories: [Categories.Accessibility],
		title: "Accessible Label",
		description: "Checks whether 'sap.ui.table.Table' controls have an accessible label.",
		resolution: "Use the 'title' aggregation or the 'ariaLabelledBy' association of the 'sap.ui.table.Table' control "
					+ "to define a proper accessible labeling.",
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");
			for (var i = 0; i < aTables.length; i++) {
				if (!aTables[i].getTitle() && aTables[i].getAriaLabelledBy().length == 0) {
					SupportHelper.reportIssue(oIssueManager, "The table does not have an accessible label.",
						Severity.High, aTables[i].getId());
				}
			}
		}
	});

	/*
	 * Validates sap.ui.core.Icon column templates.
	 */
	var oAccessibleRowHighlight = SupportHelper.normalizeRule({
		id: "AccessibleRowHighlight",
		minversion: "1.62",
		categories: [Categories.Accessibility],
		title: "Accessible Row Highlight",
		description: "Checks whether the row highlights of the 'sap.ui.table.Table' controls are accessible.",
		resolution: "Use the 'highlightText' property of the 'sap.ui.table.RowSettings' to define the semantics of the row 'highlight'.",
		resolutionurls: [
			SupportHelper.createDocuRef("API Reference: sap.ui.table.RowSettings#getHighlight",
				"#/api/sap.ui.table.RowSettings/methods/getHighlight"),
			SupportHelper.createDocuRef("API Reference: sap.ui.table.RowSettings#getHighlightText",
				"#/api/sap.ui.table.RowSettings/methods/getHighlightText")
		],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");

			function checkRowHighlight(oRow) {
				var oRowSettings = oRow.getAggregation("_settings");
				var sHighlight = oRowSettings ? oRowSettings.getHighlight() : null;
				var sHighlightText = oRowSettings ? oRowSettings.getHighlightText() : null;
				var sRowId = oRow.getId();

				if (oRowSettings && !(sHighlight in MessageType) && sHighlightText === "") {
					SupportHelper.reportIssue(oIssueManager,
						"The row of table '" + oRow.getParent().getId() + "' does not have a highlight text.", Severity.High, sRowId);
				}
			}

			for (var i = 0; i < aTables.length; i++) {
				aTables[i].getRows().forEach(checkRowHighlight);
			}
		}
	});

	return [oAccessibleLabel, oAccessibleRowHighlight];

}, true);