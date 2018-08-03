/*!
 * ${copyright}
 */
/**
 * Defines support rules of the Link control of sap.m Table.
 */
sap.ui.define(["sap/ui/support/library"],
	function(SupportLib) {
		"use strict";

		// shortcuts
		var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
			Severity = SupportLib.Severity,	// Hint, Warning, Error
			Audiences = SupportLib.Audiences; // Control, Internal, Application

		//**********************************************************
		// Rule Definitions
		//**********************************************************

		/**
		 *Checks, if a link with attached press handler has no href property set
		 */
		var oTableRule = {
			id: "definingColumnWidths",
			audiences: [Audiences.Control],
			categories: [Categories.Usability],
			enabled: true,
			minversion: "1.28",
			title: "Table: Defining column widths",
			description: "Defining column widths",
			resolution: "Configure at least 1 column with width=auto or do not configure the width at all",
			resolutionurls: [{
				text: "Documentation: Defining Column Widths",
				href: "https://sapui5.hana.ondemand.com/#/topic/6f778a805bc3453dbb66e246d8271839"
			}],
			check: function (oIssueManager, oCoreFacade, oScope) {
				var count = 0;
				oScope.getElementsByClassName("sap.m.Table").forEach(function (oTable) {
					var aColumn = oTable.getColumns();
					aColumn.forEach(function (oColumn) {
						var sWidth = oColumn.getWidth();
						if (sWidth !== "auto" || sWidth !== "") {
							count++;
						}
					});
					if (count === aColumn.length) {
						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "All the columns are configured with a width. This should be avoided.",
							context: {
								id: oTable.getId()
							}
						});
					}
				});
			}
		};

		return [oTableRule];
	}, true);
