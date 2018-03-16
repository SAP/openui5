/*!
 * ${copyright}
 */
/**
 * Defines support rules of the ObjectPageHeader control of sap.uxap library.
 */
sap.ui.define(["sap/ui/support/library"],
	function(SupportLib) {
		"use strict";

		// shortcuts
		var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
			Severity = SupportLib.Severity,	// Hint, Warning, Error
			Audiences = SupportLib.Audiences; // Control, Internal, Application


		//**********************************************************
		// Rule Definitions
		//**********************************************************

		// Rule checks if objectPage componentContainer height is set
		var oContainerHeightRule = {
			id: "objectPageComponentContainerHeight",
			audiences: [Audiences.Control],
			categories: [Categories.Usability],
			enabled: true,
			minversion: "1.26",
			title: "ObjectPageLayout: Height of componentContainer",
			description: "The componentContainer of ObjectPageLayout should always have a '100%' height explicitly set",
			resolution: "Set a '100%' height to the ComponentContainer of ObjectPageLayout",
			resolutionurls: [{
				text: "SAP Fiori Design Guidelines: Object Page",
				href: "https://experience.sap.com/fiori-design-web/object-page/#guidelines"
			}],
			check: function (issueManager, oCoreFacade, oScope) {

				var aComponentContainers = oScope.getElementsByClassName("sap.ui.core.ComponentContainer"),
					aPages = oScope.getElementsByClassName("sap.uxap.ObjectPageLayout"),
					aPageOwnerComponentIds = [],

					getOwnerComponent = function (oControl) {

						var parent = oControl.getParent();
						while (parent) {
							if (parent instanceof sap.ui.core.Component) {
								return parent;
							} else {
								parent = parent.getParent();
							}
						}
					},
					isPageContainer = function (oComponentContainer) {
						return (aPageOwnerComponentIds.indexOf(oComponentContainer.getComponent()) > -1);
					},
					getPageOwnerComponentId = function (oPage) {
						var oComponent = getOwnerComponent(oPage);
						return oComponent && oComponent.getId();
					};


				aPageOwnerComponentIds = aPages.map(getPageOwnerComponentId);

				aComponentContainers
					.forEach(function (oComponentContainer) {

						if (isPageContainer(oComponentContainer) && (oComponentContainer.getHeight() !== "100%")) {
							var sElementId = oComponentContainer.getId(),
								sElementName = oComponentContainer.getMetadata().getElementName();

							issueManager.addIssue({
								severity: Severity.Medium,
								details: "ComponentContainer '" + sElementName + "' (" + sElementId + ") does not have '100%' height.",
								context: {
									id: sElementId
								}
							});
						}
					});
			}
		};

		return oContainerHeightRule;

	}, true);
