/*!
 * ${copyright}
 */
/**
 * Defines support rules of the Button control of sap.m library.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library"],
	function(jQuery, SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity,	// Hint, Warning, Error
		Audiences = SupportLib.Audiences; // Control, Internal, Application


	var aRules = [];

	function createRule(oRuleDef) {
		aRules.push(oRuleDef);
	}


	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/**
	 *Checks, if a button consisting of only an icon has a tooltip (design guideline)
	 */
	createRule({
		id : "onlyIconButtonNeedsTooltip",
		audiences: [Audiences.Control],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "1.28",
		title: "Button: Consists of only an icon, needs a tooltip",
		description: "A button without text needs a tooltip, so that the user knows what the button does",
		resolution: "Add a value to the tooltip property of the button",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: Button",
			href: "https://experience.sap.com/fiori-design-web/button/#guidelines"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.Button")
				.forEach(function(oElement) {
					if (!jQuery.isEmptyObject(oElement.getProperty("icon"))
						&& jQuery.isEmptyObject(oElement.getProperty("text"))
						&& jQuery.isEmptyObject(oElement.getProperty("tooltip"))) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "Button '" + sElementName + "' (" + sElementId + ") consists of only an icon but has no tooltip",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	});

	return {
		addRulesToRuleset: function(oRuleset) {
			jQuery.each(aRules, function(idx, oRuleDef){
				oRuleset.addRule(oRuleDef);
			});
		}
	};

}, true);
