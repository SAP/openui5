/*!
 * ${copyright}
 */
/**
 * Defines support rules of the Link control of sap.m Table.
 */
sap.ui.define(["sap/ui/support/library", "sap/m/ListBase", "sap/ui/core/message/MessageType"], function(SupportLib, ListBase, MessageType) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity,	// Hint, Warning, Error
		Audiences = SupportLib.Audiences; // Control, Internal, Application

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
		resolution: "Configure at least 1 column with width=auto or use fixedLayout=Strict",
		resolutionurls: [{
			text: "Documentation: Defining Column Widths",
			href: "https://sdk.openui5.org/topic/6f778a805bc3453dbb66e246d8271839"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.Table").filter(function(oTable) {
				return oTable.getFixedLayout() == true;
			}).forEach(function (oTable) {
				var aColumn = oTable.getColumns(),
					bSomeColumnNoWidth;
				if (!aColumn.length) {
					return;
				}
				bSomeColumnNoWidth = aColumn.some(function (oColumn) {
					var sWidth = oColumn.getWidth();
					return sWidth === "" || "auto";
				});
				if (!bSomeColumnNoWidth) {
					oIssueManager.addIssue({
						severity: Severity.Medium,
						details: "All the columns are configured with a width. Either set at least for one column width=auto, or fixedLayout=Strict for the table",
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
		enabled: true,
		minversion: "1.62",
		title: "ListItem: Accessible Highlight",
		description: "Checks whether the item highlights are accessible.",
		resolution: "Use the 'highlightText' property of the item to define the semantics of the 'highlight'.",
		resolutionurls: [{
			text: "API Reference: sap.m.ListItemBase#getHighlight",
			href: "https://sdk.openui5.org/api/sap.m.ListItemBase/methods/getHighlight"
		}, {
			text: "API Reference: sap.m.ListItemBase#getHighlightText",
			href: "https://sdk.openui5.org/api/sap.m.ListItemBase/methods/getHighlightText"
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
});
