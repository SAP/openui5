/*!
 * ${copyright}
 */
/**
 * Defines support rules for the IllustratedMessage control of sap.m library.
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
	 * Checks for deprecated illustration sizes in sap.m.IllustratedMessage
	 */
	var oDeprecatedIllustrationSizeRule = {
		id: "deprecatedIllustrationSize",
		audiences: [Audiences.Application],
		categories: [Categories.Functionality],
		enabled: true,
		minversion: "1.135",
		title: "IllustratedMessage is using deprecated illustrationSize",
		description: "Using deprecated illustration sizes should be avoided, because they are not maintained anymore.",
		resolution: "Refer to the API of sap.m.IllustratedMessageSize for supported sizes.",
		resolutionurls: [{
			text: "API Reference",
			href: "https://sdk.openui5.org/api/sap.m.IllustratedMessageSize"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aDeprecatedSizes = ["Dialog", "Spot", "Dot", "Scene"];
			oScope.getElementsByClassName("sap.m.IllustratedMessage").forEach(function(oElement) {
				var sSize = oElement.getIllustrationSize && oElement.getIllustrationSize();
				if (aDeprecatedSizes.indexOf(sSize) !== -1) {
					oIssueManager.addIssue({
						severity: Severity.Medium,
						details: "Deprecated illustrationSize '" + sSize + "' is used for IllustratedMessage '" + oElement.getId() + "'.",
						context: { id: oElement.getId() }
					});
				}
			});
		}
	};

	/**
	 * Checks for deprecated illustration types in sap.m.IllustratedMessage
	 */
	var oDeprecatedIllustrationTypeRule = {
		id: "deprecatedIllustrationType",
		audiences: [Audiences.Application],
		categories: [Categories.Functionality],
		enabled: true,
		minversion: "1.135",
		title: "IllustratedMessage is using deprecated illustrationType",
		description: "Using deprecated illustration types should be avoided, because they are not maintained anymore.",
		resolution: "Refer to the API of sap.m.IllustratedMessageType for supported types.",
		resolutionurls: [{
			text: "API Reference",
			href: "https://sdk.openui5.org/api/sap.m.IllustratedMessageType"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aDeprecatedTypes = [
				"sapIllus-NoMail_v1",
				"sapIllus-NoSavedItems_v1",
				"sapIllus-NoTasks_v1",
				"sapIllus-NoDimensionsSet",
				"sapIllus-AddColumn",
				"sapIllus-AddPeople",
				"sapIllus-BalloonSky",
				"sapIllus-Connection",
				"sapIllus-EmptyCalendar",
				"sapIllus-EmptyList",
				"sapIllus-ErrorScreen",
				"sapIllus-FilterTable",
				"sapIllus-GroupTable",
				"sapIllus-ReloadScreen",
				"sapIllus-ResizeColumn",
				"sapIllus-SearchEarth",
				"sapIllus-SearchFolder",
				"sapIllus-SimpleBalloon",
				"sapIllus-SimpleBell",
				"sapIllus-SimpleCalendar",
				"sapIllus-SimpleCheckMark",
				"sapIllus-SimpleConnection",
				"sapIllus-SimpleEmptyDoc",
				"sapIllus-SimpleEmptyList",
				"sapIllus-SimpleError",
				"sapIllus-SimpleMagnifier",
				"sapIllus-SimpleMail",
				"sapIllus-SimpleNoSavedItems",
				"sapIllus-SimpleNotFoundMagnifier",
				"sapIllus-SimpleReload",
				"sapIllus-SimpleTask",
				"sapIllus-SleepingBell",
				"sapIllus-SortColumn",
				"sapIllus-SuccessBalloon",
				"sapIllus-SuccessCheckMark",
				"sapIllus-SuccessHighFive",
				"sapIllus-SuccessScreen",
				"sapIllus-Tent",
				"sapIllus-UploadCollection"
			];
			oScope.getElementsByClassName("sap.m.IllustratedMessage").forEach(function(oElement) {
				var sType = oElement.getIllustrationType && oElement.getIllustrationType();
				if (aDeprecatedTypes.indexOf(sType) !== -1) {
					oIssueManager.addIssue({
						severity: Severity.Medium,
						details: "Deprecated illustrationType '" + sType + "' is used for IllustratedMessage '" + oElement.getId() + "'.",
						context: { id: oElement.getId() }
					});
				}
			});
		}
	};

	return [oDeprecatedIllustrationSizeRule, oDeprecatedIllustrationTypeRule];

}, true);
