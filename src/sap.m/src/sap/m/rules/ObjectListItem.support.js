/*!
 * ${copyright}
 */
/**
 * Defines support rules of the ObjectListItem control of sap.m library.
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
		 * Checks if the ObjectListItem control uses both markers and deprecated markedFlagged or markedFavorite
		 */
		var oObjListItemMarkersRule = {
			id : "objectListItemMarkers",
			audiences: [Audiences.Control],
			categories: [Categories.Usage],
			enabled: true,
			minversion: "*",
			title: "ObjectListItem: markers aggregation",
			description: "Checks if markers aggregation is used together with deprecated properties markFlagged or markFavorite",
			resolution: "Use markers aggregation",
			resolutionurls: [{
				text: "API Reference: sap.m.ObjectListItem",
				href: "https://openui5.hana.ondemand.com/api/sap.m.ObjectListItem"
			}],
			check: function (oIssueManager, oCoreFacade, oScope) {
				oScope.getElementsByClassName("sap.m.ObjectListItem")
					.forEach(function(oElement) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName(),
							iDeprecatedMark = oElement.getMarkFlagged() + oElement.getMarkFavorite();

						if (oElement.getMarkers().length > iDeprecatedMark && iDeprecatedMark > 0) {
							oIssueManager.addIssue({
								severity: Severity.High,
								details: "ObjectListItem '" + sElementName + "' (" + sElementId + ") uses both markers aggregation and deprecated properties markFlagged or markFavorite.",
								context: {
									id: sElementId
								}
							});
						}
					});
			}
		};

		return [
			oObjListItemMarkersRule
		];

	}, true);
