/*!
 * ${copyright}
 */
/**
 * Defines support rules of the Link control of sap.m library.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library"],
	function(jQuery, SupportLib) {
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
	var oLinkRule = {
		id : "linkWithPressHandlerNoHref",
		audiences: [Audiences.Control],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "1.28",
		title: "Link: If a press handler is attached, the href property should not be set",
		description: "If a JavaScript action should be triggered using the press event, the href property should not be set",
		resolution: "Remove the href property of the link",
		resolutionurls: [{
			text: "API Reference: sap.m.Link",
			href: "https://sapui5.hana.ondemand.com/#/api/sap.m.Link"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.Link")
				.forEach(function(oElement) {
					if (oElement.getProperty("href")
						&& oElement.mEventRegistry.hasOwnProperty("press")) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "Link '" + sElementName + "' (" + sElementId + ") has both press handler attached and href property set",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};

	return [oLinkRule];

}, true);
