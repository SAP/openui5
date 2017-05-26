/*!
 * ${copyright}
 */
/**
 * Defines support rules of the List, Table and Tree controls of sap.m library.
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

	createRule({
		id : "dialogarialabelledby",
		audiences: [Audiences.Control],
		categories: [Categories.Accessibility],
		enabled: true,
		minversion: "1.28",
		title: "Dialog accessibility",
		description: "Dialogs with content should have ariaLabelledBy association set",
		resolution: "Use ariaLabelledBy association so that dialog content is read out",
		resolutionurls: [{
			text: "Set ariaLabelledBy",
			href: "https://uacp2.hana.ondemand.com/viewer/DRAFT/SAPUI5_Internal/5709e73d51f2401a9a5a89d8f5479132.html"
		}],
		check: function (issueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.Dialog")
				.forEach(function(oElement) {

				var ariaLabelledBy = oElement.getAssociation("ariaLabelledBy"),
					sDetails,
					sElementTitle = oElement.getTitle(),
					sElementId = oElement.getId(),
					sElementName = oElement.getMetadata().getElementName();

				if ((oElement.getContent() && oElement.getContent().length > 0)	// dialog has content
						&& (!ariaLabelledBy || ariaLabelledBy.length == 0)) {	// but has no ariaLabelledBy set
					if (sElementTitle) {
						sDetails = "'" + sElementTitle + "' " + sElementName + " (" + sElementId + ") has content but ariaLabelledBy association is not set. Set the association so that dialog's content is read out.";
					} else {
						sDetails = sElementName + " (" + sElementId + ") has content but ariaLabelledBy association is not set. Set the association so that dialog's content is read out.";
					}

					issueManager.addIssue({
						severity: Severity.Medium,
						details: sDetails,
						context: {
							id: oElement.getId()
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