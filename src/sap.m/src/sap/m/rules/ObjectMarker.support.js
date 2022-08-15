/*!
 * ${copyright}
 */
/**
 * Defines support rules of the ObjectMarker control of sap.m library.
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
		 * Checks if the ObjectMarker sets type property when additionalInfo use used
		 */
		var oObjMarkerAdditionalInfoRule = {
			id : "objectMarkerAdditionalInfo",
			audiences: [Audiences.Control],
			categories: [Categories.Usage],
			enabled: true,
			minversion: "*",
			title: "ObjectMarker: additionalInfo property",
			description: "Checks if additionalInfo property is used but no type is set",
			resolution: "Set type of the ObjectMarker",
			resolutionurls: [{
				text: "API Reference: sap.m.ObjectMarker",
				href: "https://sdk.openui5.org/api/sap.m.ObjectMarker"
			}],
			check: function (oIssueManager, oCoreFacade, oScope) {
				oScope.getElementsByClassName("sap.m.ObjectMarker")
					.forEach(function(oElement) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						if (oElement.getAdditionalInfo() && !oElement.getType()) {
							oIssueManager.addIssue({
								severity: Severity.Medium,
								details: "ObjectMarker '" + sElementName + "' (" + sElementId + ") sets additionalInfo but has no type.",
								context: {
									id: sElementId
								}
							});
						}
					});
			}
		};

		return [
			oObjMarkerAdditionalInfoRule
		];

	}, true);
