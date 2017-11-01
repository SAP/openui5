/*!
 * ${copyright}
 */
/**
 * Defines support rules of the Select control of sap.m library.
 */
sap.ui.define(["sap/ui/support/library"],
	function(SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity, // Low, Medium, High
		Audiences = SupportLib.Audiences; // Control, Internal, Application

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/**
	 * Checks if the Breadcrumbs control is placed in OverflowToolbar
	 */
	var oBreadcrumbsRule = {
		id : "breadcrumbsInOverflowToolbar",
		audiences: [Audiences.Control],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "1.34",
		title: "Breadcrumbs in OverflowToolbar",
		description: "The Breadcrumbs should not be placed inside an OverflowToolbar",
		resolution: "Place breadcrumbs in another container.",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: Breadcrumbs",
			href: "https://experience.sap.com/fiori-design-web/breadcrumb/#guidelines"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.Breadcrumbs")
				.forEach(function(oElement) {

					var sElementId = oElement.getId(),
						sElementName = oElement.getMetadata().getElementName();

					if (oElement.getParent() instanceof sap.m.OverflowToolbar) {
						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "Breadcrumbs '" + sElementName + "' (" + sElementId + ") is placed inside an OverflowToolbar.",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};

	return [oBreadcrumbsRule];

}, true);
