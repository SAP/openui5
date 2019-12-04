/*!
 * ${copyright}
 */
sap.ui.define([
	"./TableHelper.support",
	"sap/ui/support/library"
], function(SupportHelper, SupportLibrary) {
	"use strict";

	var Categories = SupportLibrary.Categories;
	var Severity = SupportLibrary.Severity;

	/*
	 * Checks the number and type of plugins which are applied to the table.
	 */
	var oPlugins = SupportHelper.normalizeRule({
		id: "Plugins",
		minversion: "1.64",
		categories: [Categories.Usage],
		title: "Plugins validation",
		description: "Checks the number and type of plugins which are applied to the table. Only one MultiSelectionPlugin can be applied. "
					 + "No other plugins are allowed.",
		resolution: "Check if multiple MultiSelectionPlugins are applied, or a plugin of another type is applied to the table.",
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");

			for (var i = 0; i < aTables.length; i++) {
				var oTable = aTables[i];
				var aPlugins = oTable.getPlugins();
				if (aPlugins.length > 1) {
					SupportHelper.reportIssue(oIssueManager,
						"Only one plugin can be applied to the table",
						Severity.High, oTable.getId());
				} else if (aPlugins.length == 1) {
					var oPlugin = aPlugins[0];
					if (!oPlugin.isA("sap.ui.table.plugins.MultiSelectionPlugin")) {
						SupportHelper.reportIssue(oIssueManager,
							"Only one MultiSelectionPlugin can be applied to the table",
							Severity.High, oTable.getId());
					}
				}
			}
		}
	});

	return [oPlugins];

}, true);