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
	 * @returns {Number}
	 */
	var getControlHeight = function(oControl) {
		return oControl.getDomRef().getBoundingClientRect().height;
	};

	/**
	 * Checks, if a MessagePage is a top-level control
	 */
	var oMessagePageRule = {
		id: "messagePageShouldNotBeInAContainerWithoutSetHeight",
		audiences: [Audiences.Application],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "1.28",
		title: "Message Page: In a container without set height",
		description: "Message Page should not be used in a container which has no set height",
		resolution: "Use Message Page in a container with set height, such as sap.m.NavContainer",
		resolutionurls: [{
			text: "sap.m.MessagePage API Reference",
			href: "https://openui5.hana.ondemand.com/#/api/sap.m.MessagePage"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.MessagePage").forEach(function(oMPage) {

				var sMPageId = oMPage.getId(),
					iMPageHeight = getControlHeight(oMPage),
					iMPageHeaderHeight = oMPage.getShowHeader() ? getControlHeight(oMPage.getAggregation("_internalHeader")) : 0,
					iMPageContentHeight = iMPageHeight - iMPageHeaderHeight;

				if (!iMPageContentHeight) {
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

	return [oMessagePageRule];
}, true);
