/*!
 * ${copyright}
 */
sap.ui.define([
	"./TableHelper.support",
	"sap/ui/support/library",
	"sap/ui/core/message/MessageType"
], function(SupportHelper, SupportLibrary, MessageType) {
	"use strict";

	const Categories = SupportLibrary.Categories;
	const Severity = SupportLibrary.Severity;

	/*
	 * Validates whether aria-labelledby is correctly set
	 */
	const oAccessibleLabel = SupportHelper.normalizeRule({
		id: "AccessibleLabel",
		minversion: "1.38",
		categories: [Categories.Accessibility],
		title: "Accessible Label",
		description: "Checks whether 'sap.ui.table.Table' controls have an accessible label.",
		resolution: "Use the 'ariaLabelledBy' association of the 'sap.ui.table.Table' control "
					+ "to define a proper accessible labeling.",
		check: function(oIssueManager, oCoreFacade, oScope) {
			const aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");
			for (let i = 0; i < aTables.length; i++) {
				if (!aTables[i].getTitle() && aTables[i].getAriaLabelledBy().length === 0) {
					SupportHelper.reportIssue(oIssueManager, "The table does not have an accessible label.",
						Severity.High, aTables[i].getId());
				}
			}
		}
	});

	/*
	 * Validates sap.ui.core.Icon column templates.
	 */
	const oAccessibleRowHighlight = SupportHelper.normalizeRule({
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
			const aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");

			function checkRowHighlight(oRow) {
				const oRowSettings = oRow.getAggregation("_settings");
				const sHighlight = oRowSettings ? oRowSettings.getHighlight() : null;
				const sHighlightText = oRowSettings ? oRowSettings.getHighlightText() : null;
				const sRowId = oRow.getId();

				if (oRowSettings && !(sHighlight in MessageType) && sHighlightText === "") {
					SupportHelper.reportIssue(oIssueManager,
						"The row of table '" + oRow.getParent().getId() + "' does not have a highlight text.", Severity.High, sRowId);
				}
			}

			for (let i = 0; i < aTables.length; i++) {
				aTables[i].getRows().forEach(checkRowHighlight);
			}
		}
	});

	return [oAccessibleLabel, oAccessibleRowHighlight];

});