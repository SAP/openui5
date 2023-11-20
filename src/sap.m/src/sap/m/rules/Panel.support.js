/* eslint-disable linebreak-style */
/*!
 * ${copyright}
 */
/**
 * Defines support rules of the Panel control of sap.m library.
 */
sap.ui.define([
	"sap/ui/support/library",
	"sap/base/util/isEmptyObject"
],
	function(SupportLib, isEmptyObject) {
		"use strict";
		// shortcuts
		var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
			Severity = SupportLib.Severity,	// Hint, Warning, Error
			Audiences = SupportLib.Audiences; // Control, Internal, Application

		//**********************************************************
		// Rule Definitions
		//**********************************************************

		/**
		 *Checks if a panel has a title or a header toolbar with a title
		 */
		var oPanelNeedHeaderRule = {
			id : "panelWithheaderTextOrWithHeaderToolbarWithTitle",
			audiences: [Audiences.Control],
			categories: [Categories.Usability],
			enabled: true,
			minversion: "1.28",
			title: "Panel: Header text is missing",
			description: "According to the SAP Fiori Guidelines, a panel needs a header text or a header toolbar.",
			resolution: "Add a title directly to the panel or use a headerToolbar with title element",
			resolutionurls: [{
				text: "SAP Fiori Design Guidelines: Panel",
				href: "https://experience.sap.com/fiori-design-web/panel/#components",
				text2: "Explored Sample",
				href2: "https://sdk.openui5.org/entity/sap.m.Panel/sample/sap.m.sample.Panel"
			}],
			check: function (oIssueManager, oCoreFacade, oScope) {
				oScope.getElementsByClassName("sap.m.Panel")
					.forEach(function(oElement) {
						if (!isEmptyObject(oElement.getAggregation("Title text"))
							|| !isEmptyObject(oElement.getAggregation("Toolbar"))) {

							var sElementId = oElement.getId(),
								sElementName = oElement.getMetadata().getElementName();

							oIssueManager.addIssue({
								severity: Severity.Medium,
								details: "Panel '" + sElementName + "' (" + sElementId + ") does not have a title or a toolbar aggregation",
								context: {
									id: sElementId
								}
							});
						}
					});
			}
		};

		return [oPanelNeedHeaderRule];

	}, true);