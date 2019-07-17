/*!
 * ${copyright}
 */
/**
 * Defines support rules of the ObjectPageHeader control of sap.uxap library.
 */
sap.ui.define(["sap/ui/support/library"],
	function (SupportLib) {
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

		var oDupicatedElementsOfObjectPageHeader = {
			id: "oPHeaderElementsDuplicatedInOPHeaderContent",
			title: "ObjectPageHeader: Duplicated element(s) in ObjectPageHeaderContent.",
			minversion: "1.26",
			audiences: [Audiences.Application],
			categories: [Categories.Usage],
			description: "When the showTitleInHeaderContent property of ObjectPageLayout control and any of the isObjectIconAlwaysVisible, " +
				"isObjectTitleAlwaysVisible and isObjectSubtitleAlwaysVisible properties are set to true, the respective elements Icon, " +
				"Title and Subtitle are duplicated in the ObjectPageHeaderContent.",
			resolution: "Do not enable combinations of showTitleInHeaderContent and any of the isObjectIconAlwaysVisible, isObjectTitleAlwaysVisible " +
				"and isObjectSubtitleAlwaysVisible properties.",
			check: function (oIssueManager, oCoreFacade, oScope) {
				var addIssueBuilder = function (sHeaderName, sHeaderId, sElement) {
					oIssueManager.addIssue({
						severity: Severity.Low,
						details: "The element (" + sElement + ") of '" + sHeaderName + "' (" + sHeaderId + ") " +
						"is duplicated in ObjectPageHeaderContent.",
						context: {
							id: sHeaderId
						}
					});
				};

				oScope.getElementsByClassName("sap.uxap.ObjectPageLayout")
					.forEach(function (oElement) {
						var bShowTitleInHeaderContent = oElement.getShowTitleInHeaderContent(),
							oHeaderTitle = oElement.getAggregation("headerTitle"),
							bIsObjectIconAlwaysVisible = oHeaderTitle.getIsObjectIconAlwaysVisible(),
							bIsObjectTitleAlwaysVisible = oHeaderTitle.getIsObjectTitleAlwaysVisible(),
							bIsObjectSubtitleAlwaysVisible = oHeaderTitle.getIsObjectSubtitleAlwaysVisible(),
							sHeaderName = oHeaderTitle.getMetadata().getElementName(),
							sHeaderId = oHeaderTitle.getId();

						if (bShowTitleInHeaderContent) {
							if (!!oHeaderTitle.getObjectImageURI() && bIsObjectIconAlwaysVisible) {
								addIssueBuilder(sHeaderName, sHeaderId, "Icon");

							}

							if (!!oHeaderTitle.getObjectTitle() && bIsObjectTitleAlwaysVisible) {
								addIssueBuilder(sHeaderName, sHeaderId, "Title");
							}

							if (!!oHeaderTitle.getObjectSubtitle() && bIsObjectSubtitleAlwaysVisible) {
								addIssueBuilder(sHeaderName, sHeaderId, "SubTitle");
							}
						}
					});
			}
		};

		var oObjectPageAsChildOfControlWithHeightPropertyAuto = {
			id: "objectPageAsChildOfControlWithHeightPropertyAuto",
			title: "ObjectPageLayout: Child of control with property 'height' set to 'auto'",
			minversion: "1.26",
			audiences: [Audiences.Application],
			categories: [Categories.Usage],
			description: "When sap.uxap.ObjectPageLayout is child of a control with property" +
					" 'height' set to 'auto', the calculations for ObjectPageLayout's content result in incorrectness.",
			resolution: "Do not nest ObjectPageLayout in a control which has property 'height' set to 'auto'.",
			check: function (oIssueManager, oCoreFacade, oScope) {
				var oParent, sParentId, oParentMetadata, sParentName, sOPInlineHeight;

				oScope.getElementsByClassName("sap.uxap.ObjectPageLayout").forEach(function (oElement) {
					oParent = oElement.getParent();
					oParentMetadata = oParent.getMetadata();
					sOPInlineHeight = oElement.getDomRef().style.height;

					if (oParentMetadata.hasProperty("height") &&
						oParent.getHeight() === 'auto' &&
						oParent.getDomRef().style.height !== "100%" &&
						(sOPInlineHeight === 'auto' || sOPInlineHeight === "" || sOPInlineHeight === "100%")) {

						sParentName = oParentMetadata.getName();
						sParentId = oParent.getId();

						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "The parent control of sap.uxap.ObjectPageLayout (" +
									sParentName + ") with ID (" + sParentId + ")" +
									 " has property 'height' set to 'auto.",
							context: {
								id: sParentId
							}
						});
					}
				});
			}
		};

		var oObjectPageInDialog = {
			id: "objectPageInDialog",
			title: "ObjectPageLayout: In sap.m.Dialog",
			minversion: "1.26",
			audiences: [Audiences.Application],
			categories: [Categories.Usage],
			description: "When sap.uxap.ObjectPageLayout is inside the content of sap.m.Dialog," +
						 " the calculations for ObjectPageLayout's content result in incorrectness if " +
						 "'stretch' and/or 'verticalScrolling' properties of the Dialog" +
					     " are set to incompatible values.",
			resolution: "Set the following properties of sap.m.Dialog to compatible values:\n" +
						"1. 'stretch' property to 'true'\n" +
						"2. 'verticalScrolling' property to 'false'.",
			check: function (oIssueManager, oCoreFacade, oScope) {
				var oParent, sParentId, sParentName, sOPInlineHeight;

				oScope.getElementsByClassName("sap.uxap.ObjectPageLayout").forEach(function (oElement) {
					oParent = oElement.getParent();
					sParentName = oParent.getMetadata().getName();
					sOPInlineHeight = oElement.getDomRef().style.height;

					if (sParentName === "sap.m.Dialog" &&
						(oParent.getVerticalScrolling() ||  !oParent.getStretch()) &&
						(sOPInlineHeight === 'auto' || sOPInlineHeight === "" || sOPInlineHeight === "100%")) {
						sParentId = oParent.getId();

						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "The parent of sap.uxap.ObjectPageLayout (" + sParentName + ") with ID " +
									"(" + sParentId + ") has 'stretch' and/or 'verticalScrolling' properties" +
									" set to incompatible values.",
							context: {
								id: sParentId
							}
						});
					}
				});
			}
		};
		return [
			oContainerHeightRule,
			oDupicatedElementsOfObjectPageHeader,
			oObjectPageAsChildOfControlWithHeightPropertyAuto,
			oObjectPageInDialog
		];

	}, true);
