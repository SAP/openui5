/*!
 * ${copyright}
 */
/**
 * Defines support rules of the ObjectHeader control of sap.m library.
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
		 * Checks if the ObjectHeader control uses both markers and deprecated markedFlagged or markedFavorite
		 */
		var oObjHeaderMarkersRule = {
			id : "objectHeaderMarkers",
			audiences: [Audiences.Control],
			categories: [Categories.Usage],
			enabled: true,
			minversion: "1.42",
			title: "ObjectHeader: markers aggregation",
			description: "Checks if markers aggregation is used together with deprecated properties markFlagged or markFavorite",
			resolution: "Use markers aggregation",
			resolutionurls: [{
				text: "API Reference: sap.m.ObjectHeader",
				href: "https://openui5.hana.ondemand.com/api/sap.m.ObjectHeader"
			}],
			check: function (oIssueManager, oCoreFacade, oScope) {
				oScope.getElementsByClassName("sap.m.ObjectHeader")
					.forEach(function(oElement) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName(),
							iDeprecatedMark = oElement.getMarkFlagged() + oElement.getMarkFavorite();

						if (oElement.getMarkers().length > iDeprecatedMark && iDeprecatedMark > 0) {
							oIssueManager.addIssue({
								severity: Severity.High,
								details: "ObjectHeader '" + sElementName + "' (" + sElementId + ") uses both markers aggregation and deprecated properties markFlagged or markFavorite.",
								context: {
									id: sElementId
								}
							});
						}
					});
			}
		};

		/**
		 * Checks if the ObjectHeader control uses both statuses and deprecated firstStatus or secondStatus
		 */
		var oObjHeaderStatusessRule = {
			id : "objectHeaderStatuses",
			audiences: [Audiences.Control],
			categories: [Categories.Usage],
			enabled: true,
			minversion: "1.16",
			title: "ObjectHeader: statuses aggregation",
			description: "Checks if statuses aggregation is used together with deprecated aggregation firstStatus or secondStatus",
			resolution: "Use statuses aggregation",
			resolutionurls: [{
				text: "API Reference: sap.m.ObjectHeader",
				href: "https://openui5.hana.ondemand.com/api/sap.m.ObjectHeader"
			}],
			check: function (oIssueManager, oCoreFacade, oScope) {
				oScope.getElementsByClassName("sap.m.ObjectHeader")
					.forEach(function(oElement) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						if (oElement.getStatuses().length && (oElement.getFirstStatus() || oElement.getSecondStatus())) {
							oIssueManager.addIssue({
								severity: Severity.Medium,
								details: "ObjectHeader '" + sElementName + "' (" + sElementId + ") uses both statuses aggregation and deprecated aggregations firstStatus or secondStatus.",
								context: {
									id: sElementId
								}
							});
						}
					});
			}
		};

		/**
		 * Checks if the responsive property is set to false when condensed property is used
		 */
		var oObjHeaderCondensedRule = {
			id : "objectHeaderCondensed",
			audiences: [Audiences.Control],
			categories: [Categories.Usage],
			enabled: true,
			minversion: "1.21",
			title: "ObjectHeader: condensed property",
			description: "Checks if condensed property is set to true and responsive property is set to false",
			resolution: "Change the responsive property to false",
			resolutionurls: [{
				text: "API Reference: sap.m.ObjectHeader",
				href: "https://openui5.hana.ondemand.com/api/sap.m.ObjectHeader"
			}],
			check: function (oIssueManager, oCoreFacade, oScope) {
				oScope.getElementsByClassName("sap.m.ObjectHeader")
					.forEach(function(oElement) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						if (oElement.getCondensed() && oElement.getResponsive()) {
							oIssueManager.addIssue({
								severity: Severity.Medium,
								details: "ObjectHeader '" + sElementName + "' (" + sElementId + ") sets both condensed and responsive property to true.",
								context: {
									id: sElementId
								}
							});
						}
					});
			}
		};

		/**
		 * Checks if the responsive property is set to true when fullScreenOptimized property is used
		 */
		var oObjHeaderFullScreenOptimizedRule = {
			id : "objectHeaderFullScreenOptimized",
			audiences: [Audiences.Control],
			categories: [Categories.Usage],
			enabled: true,
			minversion: "1.28",
			title: "ObjectHeader: fullScreenOptimized property",
			description: "Checks if fullScreenOptimized property is set to true and responsive property is set to true",
			resolution: "Change the responsive property to true",
			resolutionurls: [{
				text: "API Reference: sap.m.ObjectHeader",
				href: "https://openui5.hana.ondemand.com/api/sap.m.ObjectHeader"
			}],
			check: function (oIssueManager, oCoreFacade, oScope) {
				oScope.getElementsByClassName("sap.m.ObjectHeader")
					.forEach(function(oElement) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						if (oElement.getFullScreenOptimized() && !oElement.getResponsive()) {
							oIssueManager.addIssue({
								severity: Severity.Medium,
								details: "ObjectHeader '" + sElementName + "' (" + sElementId + ") sets fullScreenOptimized to true but responsive property is false.",
								context: {
									id: sElementId
								}
							});
						}
					});
			}
		};

		/**
		 * Checks if the responsive property is set to false when additionalNumbers aggregation is used
		 */
		var oObjHeaderAdditionalNumbersRule = {
			id : "objectHeaderAdditionalNumbers",
			audiences: [Audiences.Control],
			categories: [Categories.Usage],
			enabled: true,
			minversion: "1.38",
			title: "ObjectHeader: additionalNumbers aggregation",
			description: "Checks if additionalNumbers aggregation is used and responsive property is set to false",
			resolution: "Change the responsive property to false",
			resolutionurls: [{
				text: "API Reference: sap.m.ObjectHeader",
				href: "https://openui5.hana.ondemand.com/api/sap.m.ObjectHeader"
			}],
			check: function (oIssueManager, oCoreFacade, oScope) {
				oScope.getElementsByClassName("sap.m.ObjectHeader")
					.forEach(function(oElement) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						if (oElement.getAdditionalNumbers().length && oElement.getResponsive()) {
							oIssueManager.addIssue({
								severity: Severity.Medium,
								details: "ObjectHeader '" + sElementName + "' (" + sElementId + ") uses additionalNumbers aggregation and responsive property is true.",
								context: {
									id: sElementId
								}
							});
						}
					});
			}
		};

		/**
		 * Checks if the responsive property is set to true when headerContainer aggregation is used
		 */
		var oObjHeaderHeaderContainerRule = {
			id : "objectHeaderHeaderContainer",
			audiences: [Audiences.Control],
			categories: [Categories.Usage],
			enabled: true,
			minversion: "1.21",
			title: "ObjectHeader: headerContainer aggregation",
			description: "Checks if headerContainer aggregation is used and responsive property is set to true",
			resolution: "Change the responsive property to true",
			resolutionurls: [{
				text: "API Reference: sap.m.ObjectHeader",
				href: "https://openui5.hana.ondemand.com/api/sap.m.ObjectHeader"
			}],
			check: function (oIssueManager, oCoreFacade, oScope) {
				oScope.getElementsByClassName("sap.m.ObjectHeader")
					.forEach(function(oElement) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						if (oElement.getHeaderContainer() && !oElement.getResponsive()) {
							oIssueManager.addIssue({
								severity: Severity.Medium,
								details: "ObjectHeader '" + sElementName + "' (" + sElementId + ") sets headerContainer aggregation but responsive property is false.",
								context: {
									id: sElementId
								}
							});
						}
					});
			}
		};


		return [
			oObjHeaderMarkersRule,
			oObjHeaderStatusessRule,
			oObjHeaderCondensedRule,
			oObjHeaderFullScreenOptimizedRule,
			oObjHeaderAdditionalNumbersRule,
			oObjHeaderHeaderContainerRule
		];

	}, true);
