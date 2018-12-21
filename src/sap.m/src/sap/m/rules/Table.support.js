/*!
 * ${copyright}
 */
/**
 * Defines support rules of the Link control of sap.m Table.
 */
sap.ui.define(["sap/ui/support/library", "sap/m/ListBase", "sap/ui/core/library"],
	function(SupportLib, ListBase, coreLibrary) {
		"use strict";

		// shortcuts
		var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
			Severity = SupportLib.Severity,	// Hint, Warning, Error
			Audiences = SupportLib.Audiences; // Control, Internal, Application
		var MessageType = coreLibrary.MessageType;

		//**********************************************************
		// Rule Definitions
		//**********************************************************

		/**
		 * Checks column widths configuration
		 */
		var oColumnWidthRule = {
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

		/*
		 * Validates whether the highlightText property of the item is correctly set.
		 */
		var oItemHighlightTextRule = {
			id: "accessibleItemHighlight",
			audiences: [Audiences.Application],
			categories: [Categories.Accessibility],
			title: "ListItem: Accessible Highlight",
			description: "Checks whether the item highlights are accessible.",
			resolution: "Use the 'highlightText' property of the item to define the semantics of the 'highlight'.",
			resolutionurls: [{
				text: "API Reference: sap.m.ListItemBase#getHighlight",
				href: "https://sapui5.hana.ondemand.com/#/api/sap.m.ListItemBase/methods/getHighlight"
			}, {
				text: "API Reference: sap.m.ListItemBase#getHighlightText",
				href: "https://sapui5.hana.ondemand.com/#/api/sap.m.ListItemBase/methods/getHighlightText"
			}],
			check: function(oIssueManager, oCoreFacade, oScope) {
				function checkItemHighlight(oListItemBase) {
					var sHighlight = oListItemBase.getHighlight();
					var sHighlightText = oListItemBase.getHighlightText();
					var sItemId = oListItemBase.getId();
					var sListId = oListItemBase.getParent().getId();

					if (!(sHighlight in MessageType) && sHighlightText === "") {
						oIssueManager.addIssue({
							severity: Severity.High,
							details: "Item '" + sItemId + "' does not have a highlight text.",
							context: {
								id: sListId
							}
						});
					}
				}

				oScope.getElementsByClassName(ListBase).forEach(function(oListBase) {
					oListBase.getItems().forEach(checkItemHighlight);
				});
			}
		};

		return [oColumnWidthRule, oItemHighlightTextRule];
	}, true);
