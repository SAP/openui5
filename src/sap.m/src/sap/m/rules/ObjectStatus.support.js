/*!
 * ${copyright}
 */
/**
 * Defines support rules of the ObjectStatus control of sap.m library.
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
		 * Checks if the ObjectStatus control sets text or icon when active property is set
		 */
		var oObjStatusActiveRule = {
			id : "objectStatusActive",
			audiences: [Audiences.Control],
			categories: [Categories.Usage],
			enabled: true,
			minversion: "*",
			title: "ObjectStatus: active property",
			description: "Checks if active property is set to true but no icon or text are set.",
			resolution: "Set text or icon when active property is true",
			resolutionurls: [{
				text: "API Reference: sap.m.ObjectStatus",
				href: "https://sdk.openui5.org/api/sap.m.ObjectStatus"
			}],
			check: function (oIssueManager, oCoreFacade, oScope) {
				oScope.getElementsByClassName("sap.m.ObjectStatus")
					.forEach(function(oElement) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						if (oElement.getActive() && !oElement.getText() && !oElement.getIcon()) {
							oIssueManager.addIssue({
								severity: Severity.Medium,
								details: "ObjectStatus '" + sElementName + "' (" + sElementId + ") sets active to true but no icon or text.",
								context: {
									id: sElementId
								}
							});
						}
					});
			}
		};

		return [
			oObjStatusActiveRule
		];

	}, true);
