/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/support/library"
], function(SupportLibrary) {
	"use strict";

	const Categories = SupportLibrary.Categories;
	const Severity = SupportLibrary.Severity;
    const Audiences = SupportLibrary.Audiences;

    const oHeaderVisibleFalseAndHiddenToolbar = {
		id : "HeaderVisibleDisabled",
		audiences: [Audiences.Control],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "1.121",
		title: "Header visibility",
		description: "Checks whether 'headerVisible' is set to false when the toolbar is hidden",
		resolution: "Set the header visibility of the table to false using the 'headerVisible' property of the 'sap.ui.mdc.Table'",
		resolutionurls: [],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.mdc.Table")
				.forEach(function(oElement) {
					if (oElement && oElement.getHideToolbar() && oElement.getHeaderVisible()) {
						oIssueManager.addIssue({
							severity: Severity.High,
							details: "HeaderVisible is true but toolbar is hidden. Set headerVisible to false.",
							context: {
								id: oElement.getId()
							}
						});
					}
				});
		}
	};

	const oHeaderSet = {
		id : "HeaderPropertySet",
		audiences: [Audiences.Control],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "1.121",
		title: "Table header value",
		description: "Checks if the table 'header' is set",
		resolution: "Set a table title via the 'header' property of the 'sap.ui.mdc.Table'",
		resolutionurls: [],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.mdc.Table")
				.forEach(function(oElement) {
					if (oElement && !oElement.getHeader()) {
						oIssueManager.addIssue({
							severity: Severity.High,
							details: "Header isn't set. Set a title in the header property.",
							context: {
								id: oElement.getId()
							}
						});
					}
				});
		}
	};

	const oIllustratedMessageForNoData = {
		id : "IllustratedMessageForNoData",
		audiences: [Audiences.Control],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "1.121",
		title: "IllustratedMessage for noData",
		description: "Checks whether 'noData' is an 'IllustratedMessage' when the toolbar is hidden",
		resolution: "Set the 'noData' aggregation of the 'sap.ui.mdc.Table' to an 'sap.m.IllustratedMessage'",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: Illustrated Message",
			href: "https://experience.sap.com/fiori-design-web/illustrated-message/"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.mdc.Table")
				.forEach(function(oElement) {
					if (oElement && oElement.getHideToolbar() && (!oElement.getNoData() || !oElement.getNoData().isA("sap.m.IllustratedMessage"))) {
						oIssueManager.addIssue({
							severity: Severity.High,
							details: "'noData' aggregation is either not set or no 'sap.m.IllustratedMessage' control is used.",
							context: {
								id: oElement.getId()
							}
						});
					}
				});
		}
	};

	const oRowCountDisabled = {
		id : "RowCountDisabled",
		audiences: [Audiences.Control],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "1.121",
		title: "showRowCount disabled",
		description: "Checks whether the 'showRowCount' is disabled when the toolbar is hidden",
		resolution: "Set the 'showRowCount' property of the 'sap.ui.mdc.Table' to false",
		resolutionurls: [],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.mdc.Table")
				.forEach(function(oElement) {
					if (oElement && oElement.getHideToolbar() && oElement.getShowRowCount()) {
						oIssueManager.addIssue({
							severity: Severity.Low,
							details: "'showRowCount' property of table is true but should be false.",
							context: {
								id: oElement.getId()
							}
						});
					}
				});
		}
	};

	const oActionsAndVariantsAndQuickFilterNotUsed = {
		id : "ActionAndVariantsNotUsed",
		audiences: [Audiences.Control],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "1.121",
		title: "Actions, quickFilter, and a table-related VariantManagement not used",
		description: "Checks whether the 'actions', 'quickFilter', and 'variant' aggregations are used when the toolbar is hidden",
		resolution: "Remove 'actions', 'quickFilter', and 'variants' aggregations from your 'sap.ui.mdc.Table'",
		resolutionurls: [],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.mdc.Table")
				.forEach(function(oElement) {

					const bActions = (oElement.getActions() !== undefined && oElement.getActions() !== null && oElement.getActions().length !== 0),
						bVariant = (oElement.getVariant() !== undefined && oElement.getVariant() !== null && oElement.getVariant().length !== 0),
						bQuickFilter = (oElement.getQuickFilter() !== undefined && oElement.getQuickFilter() !== null && oElement.getQuickFilter().length !== 0);

					if (oElement && oElement.getHideToolbar() && (bActions || bVariant || bQuickFilter)) {
						oIssueManager.addIssue({
							severity: Severity.High,
							details: "'actions', 'quickFilter', and 'variant' aggregations are not empty.",
							context: {
								id: oElement.getId()
							}
						});
					}
				});
		}
	};

	const oExportDisabled = {
		id : "ExportDisabled",
		audiences: [Audiences.Control],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "1.121",
		title: "enableExport disabled",
		description: "Checks if 'enableExport' is set to true when the toolbar is hidden",
		resolution: "Set the 'enableExport' property of the 'sap.ui.mdc.Table' to false",
		resolutionurls: [],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.mdc.Table")
				.forEach(function(oElement) {
					if (oElement && oElement.getHideToolbar() && oElement.getEnableExport()) {
						oIssueManager.addIssue({
							severity: Severity.Low,
							details: "'enableExport' property of table is true but should be false because of the hidden toolbar.",
							context: {
								id: oElement.getId()
							}
						});
					}
				});
		}
	};

	return [oHeaderVisibleFalseAndHiddenToolbar, oHeaderSet, oIllustratedMessageForNoData, oRowCountDisabled, oActionsAndVariantsAndQuickFilterNotUsed, oExportDisabled];

});