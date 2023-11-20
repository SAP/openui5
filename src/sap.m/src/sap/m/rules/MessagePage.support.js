/*!
 * ${copyright}
 */
/**
 * Defines support rules of the MessagePage control of sap.m library.
 */
sap.ui.define(["sap/ui/support/library"],
function(SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity, // Hint, Warning, Error
		Audiences = SupportLib.Audiences; // Control, Internal, Application

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/**
	 * Determines <code>Control</code> computed height.
	 * @param {sap.ui.core.Control} oControl
	 * @returns {number}
	 */
	var getControlHeight = function(oControl) {
		return oControl.getDomRef().getBoundingClientRect().height;
	};

	/**
	 * Checks, if MessagePage is in a container which has no set height
	 */
	var oMessagePageHeightRule = {
		id: "messagePageShouldNotBeInAContainerWithoutSetHeight",
		audiences: [Audiences.Application],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "1.28",
		title: "Message Page: In a container without set height",
		description: "Message Page should not be used in a container which has no set height",
		resolution: "Use Message Page in a container with set height, such as sap.m.App",
		resolutionurls: [{
			text: "sap.m.MessagePage API Reference",
			href: "https://sdk.openui5.org/api/sap.m.MessagePage"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.MessagePage").forEach(function(oMPage) {

				var sMPageId = oMPage.getId(),
					iMPageHeight = getControlHeight(oMPage),
					iMPageHeaderHeight = oMPage.getShowHeader() ? getControlHeight(oMPage.getAggregation("_internalHeader")) : 0,
					iMPageContentHeight = iMPageHeight - iMPageHeaderHeight;

				if (oMPage.getParent() === oMPage.getUIArea() && iMPageContentHeight <= 0) {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: "Message Page" + " (" + sMPageId + ") is used in a container which has no height set.",
						context: {
							id: sMPageId
						}
					});
				}
			});
		}
	};

	/**
	 * Checks, if MessagePage is a top-level control
	 */
	var oMessagePageHierarchyRule = {
		id: "messagePageShouldNotBeTopLevel",
		audiences: [Audiences.Application],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "1.28",
		title: "Message Page: Top-level control",
		description: "Message Page should not be a top-level control",
		resolution: "Use Message Page as described in the SAP Fiori Design Guidelines",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: Message Page",
			href: "https://experience.sap.com/fiori-design-web/message-page"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.MessagePage").forEach(function(oMPage) {
				var oMPageUIAreaControls = oMPage.getUIArea().getAggregation("content"),
					sMPageId = oMPage.getId();

				if (oMPageUIAreaControls.length > 1 && oMPage.getParent() === oMPage.getUIArea()) {
					oIssueManager.addIssue({
						severity: Severity.Medium,
						details: "Message Page" + " (" + sMPageId + ") is a top-level control.",
						context: {
							id: sMPageId
						}
					});
				}
			});
		}
	};

	return [oMessagePageHeightRule, oMessagePageHierarchyRule];

}, true);
