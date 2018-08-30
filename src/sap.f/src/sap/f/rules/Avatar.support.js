/*!
 * ${copyright}
 */
/**
 * Defines support rules of the Avatar control of sap.f library.
 */
sap.ui.define(["sap/ui/support/library", "../library"],
	function(SupportLib, library) {
		"use strict";

		var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
			Severity = SupportLib.Severity, // Hint, Warning, Error
			Audiences = SupportLib.Audiences; // Control, Internal, Application

		var oAvatarWithCustomDisplaySize = {
			id : "avatarWithCustomDisplaySize",
			title: "Avatar: Invalid combination of customDisplaySize and displaySize properties",
			minversion: "1.46",
			audiences: [Audiences.Application],
			categories: [Categories.Usage],
			description: "Avatar customDisplaySize property takes affect, only when displaySize property is set to Custom.",
			resolution: "Set displaySize property to Custom",
			check: function (oIssueManager, oCoreFacade, oScope) {
				oScope.getElementsByClassName("sap.f.Avatar")
					.forEach(function(oElement) {

					var sElementId = oElement.getId(),
					sElementName = oElement.getMetadata().getElementName(),
					bIsDefaultCustomDisplaySize = oElement.getCustomDisplaySize() === oElement.getMetadata().getProperty("customDisplaySize").getDefaultValue();

					if (!bIsDefaultCustomDisplaySize && oElement.getDisplaySize() !== library.AvatarSize.Custom) {
						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "Avatar '" + sElementName + "' (" + sElementId + ") has customDisplaySize property, without setting displaySize to Custom",
							context: {
								id: sElementId
							}
						});
					}
				});
			}
		};

		var oAvatarWithCustomFontSize = {
			id : "avatarWithCustomFontSize",
			title: "Avatar: Invalid combination of customFontSize and displaySize properties",
			minversion: "1.46",
			audiences: [Audiences.Application],
			categories: [Categories.Usage],
			description: "Avatar customFontSize property takes affect, only when displaySize property is set to Custom.",
			resolution: "Set displaySize property to Custom",
			check: function (oIssueManager, oCoreFacade, oScope) {
				oScope.getElementsByClassName("sap.f.Avatar")
					.forEach(function(oElement) {

					var sElementId = oElement.getId(),
					sElementName = oElement.getMetadata().getElementName(),
					bIsDefaultCustomFontSize = oElement.getCustomFontSize() === oElement.getMetadata().getProperty("customFontSize").getDefaultValue();

					if (!bIsDefaultCustomFontSize && oElement.getDisplaySize() !== library.AvatarSize.Custom) {
						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "Avatar '" + sElementName + "' (" + sElementId + ") has customFontSize property, without setting displaySize to Custom",
							context: {
								id: sElementId
							}
						});
					}
				});
			}
		};

		return [oAvatarWithCustomDisplaySize, oAvatarWithCustomFontSize];

	}, true);