/*!
 * ${copyright}
 */
sap.ui.define([
	"./TableHelper.support",
	"sap/ui/support/library"
], function(SupportHelper, SupportLibrary) {
	"use strict";

	const Categories = SupportLibrary.Categories;
	const Severity = SupportLibrary.Severity;

	/**
	 * Loops over all columns of all visible tables and calls the given callback with the following parameters:
	 * table instance, column instance, column template instance.
	 *
	 * If the column does not have a template or a type is given and the template is not of this type the callback is not called.
	 *
	 * @param {function} fnDoCheck Callback
	 * @param {object} oScope The scope as given in the rule check function.
	 * @param {string} [sType] If given an additional type check is performed.
	 */
	function checkColumnTemplate(fnDoCheck, oScope, sType) {
		const aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");
		let aColumns; let oTemplate;

		for (let i = 0; i < aTables.length; i++) {
			aColumns = aTables[i].getColumns();

			for (let k = 0; k < aColumns.length; k++) {
				oTemplate = aColumns[k].getTemplate();

				if (oTemplate && oTemplate.isA(sType)) {
					fnDoCheck(aTables[i], aColumns[k], oTemplate);
				}
			}
		}
	}

	/*
	 * Validates sap.m.Text column templates.
	 */
	const oTextWrapping = SupportHelper.normalizeRule({
		id: "ColumnTemplateTextWrapping",
		minversion: "1.38",
		categories: [Categories.Usage],
		title: "Column template validation - 'sap.m.Text'",
		description: "The 'wrapping' and/or 'renderWhitespace' property of the control 'sap.m.Text' is set to 'true' "
					 + "although the control is used as a column template.",
		resolution: "Set the 'wrapping' and 'renderWhitespace' property of the control 'sap.m.Text' to 'false' if the "
					+ "control is used as a column template.",
		check: function(oIssueManager, oCoreFacade, oScope) {
			checkColumnTemplate(function(oTable, oColumn, oMTextTemplate) {
				const sColumnId = oColumn.getId();

				if (oMTextTemplate.isBound("wrapping") || (!oMTextTemplate.isBound("wrapping") && oMTextTemplate.getWrapping())) {
					SupportHelper.reportIssue(oIssueManager, "Column '" + sColumnId + "' of table '" + oTable.getId() + "' uses an "
															 + "'sap.m.Text' control with wrapping enabled.", Severity.High, sColumnId);
				}
				if (oMTextTemplate.isBound("renderWhitespace") || (!oMTextTemplate.isBound("renderWhitespace")
																   && oMTextTemplate.getRenderWhitespace())) {
					SupportHelper.reportIssue(oIssueManager, "Column '" + sColumnId + "' of table '" + oTable.getId() + "' uses an "
															 + "'sap.m.Text' control with renderWhitespace enabled.", Severity.High, sColumnId);
				}
			}, oScope, "sap.m.Text");
		}
	});

	const oLinkWrapping = SupportHelper.normalizeRule({
		id: "ColumnTemplateLinkWrapping",
		minversion: "1.38",
		categories: [Categories.Usage],
		title: "Column template validation - 'sap.m.Link'",
		description: "The 'wrapping' property of the control 'sap.m.Link' is set to 'true' although the control is used as a column template.",
		resolution: "Set the 'wrapping' property of the control 'sap.m.Link' to 'false' if the control is used as a column template.",
		check: function(oIssueManager, oCoreFacade, oScope) {
			checkColumnTemplate(function(oTable, oColumn, oMLinkTemplate) {
				if (oMLinkTemplate.isBound("wrapping") || (!oMLinkTemplate.isBound("wrapping") && oMLinkTemplate.getWrapping())) {
					const sColumnId = oColumn.getId();
					SupportHelper.reportIssue(oIssueManager, "Column '" + sColumnId + "' of table '" + oTable.getId() + "' uses an "
															 + "'sap.m.Link' control with wrapping enabled.", Severity.High, sColumnId);
				}
			}, oScope, "sap.m.Link");
		}
	});

	return [oTextWrapping, oLinkWrapping];

});