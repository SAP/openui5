/*!
 * ${copyright}
 */
sap.ui.define([
	"./TableHelper.support",
	"sap/ui/support/library",
	"sap/m/plugins/PluginBase"
], function(SupportHelper, SupportLibrary, PluginBase) {
	"use strict";

	const Categories = SupportLibrary.Categories;
	const Severity = SupportLibrary.Severity;

	/**
	 * Checks the number and type of plugins which are applied to the table.
	 */
	const oSelectionPlugins = SupportHelper.normalizeRule({
		id: "Plugins",
		minversion: "1.64",
		categories: [Categories.Usage],
		title: "Single selection plugin",
		description: "Only one selection plugin should be applied to avoid potential conflicts.",
		resolution: "Only apply a single selection plugin.",
		check: function(oIssueManager, oCoreFacade, oScope) {
			const aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");

			for (let i = 0; i < aTables.length; i++) {
				const oTable = aTables[i];
				const aSelectionPlugins = oTable.getDependents().filter((oPlugin) => oPlugin.isA("sap.ui.table.plugins.SelectionPlugin"));

				if (aSelectionPlugins.length > 1) {
					SupportHelper.reportIssue(
						oIssueManager,
						"Only one selection plugin should be applied to the table",
						Severity.High,
						oTable.getId()
					);
				}
			}
		}
	});

	return [oSelectionPlugins];

});