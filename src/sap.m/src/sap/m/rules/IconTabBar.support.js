/*!
 * ${copyright}
 */
/**
 * Defines support rules of the IconTabBar control of sap.m library.
 */
sap.ui.define(["sap/ui/support/library", "sap/m/library"],
	function(SupportLib, mobileLibrary) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity,	// Hint, Warning, Error
		Audiences = SupportLib.Audiences, // Control, Internal, Application
		IconTabFilterDesign = mobileLibrary.IconTabFilterDesign;

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	var oIconTabBarRuleHDesign = {
		id: "iconTabFilterWithHorizontalDesingShouldHaveIcons",
		audiences: [Audiences.Application],
		categories: [Categories.FioriGuidelines],
		enabled: true,
		minversion: "*",
		title: "IconTabBar: tab filters with horizontal design should always have icons",
		description: "According to Fiori guidelines tab filters with horizontal design shall always have icons",
		resolution: 'Add icons to all tabs \n Note: There is one exception - if "showAll" is set to true, icon may not be set',
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: IconTabBar",
			href: "https://experience.sap.com/fiori-design-web/icontabbar/#guidelines"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.IconTabFilter")
				.forEach(function(oElement) {
					if (oElement.getProperty("design") === IconTabFilterDesign.Horizontal
						&& !oElement.getProperty("icon")
						&& !oElement.getProperty("showAll")) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.High,
							details: "IconTabFilter '" + sElementName + "' (" + sElementId + ") consists only of text, icon needs to be set",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};

	var oIconTabBarRuleIcons = {
		id: "iconTabBarIconsRule",
		audiences: [Audiences.Application],
		categories: [Categories.FioriGuidelines],
		enabled: true,
		minversion: "*",
		title: "IconTabBar: Icons rule for tabs",
		description: 'Either all tabs should have icons or none of them. Note: There is one exception - There is one exception - if "showAll" is set to true, icon may not be set',
		resolution: "Make all tabs the same type",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: IconTabBar",
			href: "https://experience.sap.com/fiori-design-web/icontabbar/#guidelines"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.IconTabBar")
				.forEach(function(oElement) {
					var aIconTabFilters = oElement.getItems();
					var bHasIconFirstTab;
					var bHasIconSomeTab;
					var bHasDifference = false;
					var bFirstCheckedTab = true;

					for (var index = 0; index < aIconTabFilters.length; index++) {
						if (aIconTabFilters[index].isA('sap.m.IconTabFilter') && !aIconTabFilters[index].getProperty("showAll")) {
							if (bFirstCheckedTab) {
								bHasIconFirstTab = !!aIconTabFilters[index].getIcon();
								bFirstCheckedTab = false;
							} else {
								bHasIconSomeTab = !!aIconTabFilters[index].getIcon();
								if (bHasIconFirstTab !== bHasIconSomeTab) {
									bHasDifference = true;
									break;
								}
							}
						}
					}

					if (bHasDifference) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.High,
							details: "In one IconTabBar '" + sElementName + "' (" + sElementId + ") all tabs should have icons or all tabs shouldn't have icons",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};

	var oIconTabBarRuleIconsLongCount = {
		id: "iconTabFilterWithIconsAndLongCount",
		audiences: [Audiences.Application],
		categories: [Categories.FioriGuidelines],
		enabled: true,
		minversion: "*",
		title: "IconTabBar: IconTabFilters with icons and long count number should have horizontal design",
		description: "Note: All filters in one IconTabBar should have the same design",
		resolution: "Change the design property to horizontal for all tabs in the IconTabBar",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: IconTabBar",
			href: "https://experience.sap.com/fiori-design-web/icontabbar/#guidelines"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.IconTabFilter")
				.forEach(function(oElement) {
					if (oElement.getProperty("design") === IconTabFilterDesign.Vertical
						&& oElement.getProperty("icon")
						&& oElement.getProperty("count").length > 4) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.High,
							details: "IconTabFilter '" + sElementName + "' (" + sElementId + ") has long count and should have horizontal design",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};


	return [oIconTabBarRuleHDesign, oIconTabBarRuleIcons, oIconTabBarRuleIconsLongCount];

}, true);