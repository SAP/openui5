/*!
 * ${copyright}
 */
/**
 * Defines support rules of the ViewSettingsDialog control of sap.m library.
 */
sap.ui.define(["sap/ui/support/library"], function(SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, Bindings, Consistency, FioriGuidelines, Functionality, Usability, DataModel, Modularization, Usage, Other
		Severity = SupportLib.Severity,	// Hint, Warning, Error
		Audiences = SupportLib.Audiences; // Control, Internal, Application

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/**
	 *  Checks if every item has a key
	 */
	var oVSDItemsHasKeys = {
		id: "vsdItemsHaveKeys",
		audiences: [Audiences.Control],
		categories: [Categories.Usage],
		enabled: true,
		minversion: "1.28",
		title: "ViewSettingsDialog: not all items have keys",
		description: "All items should have keys",
		resolution: "Provide keys for all items",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: DatePicker",
			href: "https://experience.sap.com/fiori-design-web/date-picker/"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.ViewSettingsDialog")
				.forEach(function(oElement) {
					var aFilterItems = oElement.getFilterItems();
					var aSortItems = oElement.getSortItems();
					var aGroupItems = oElement.getGroupItems();
					var fnFilterNoKeyItems = function(f) { return !f.getKey(); };
					if (aFilterItems.filter(fnFilterNoKeyItems).length
						|| aSortItems.filter(fnFilterNoKeyItems).length
						|| aGroupItems.filter(fnFilterNoKeyItems).length) {
						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.High,
							details: "ViewSettingsDialog '" + sElementName + "' (" + sElementId
								+ ")'s items do not have keys",
							context: {
								id: sElementId
							}
						});
					}
				}
				);
		}
	};

	return [
		oVSDItemsHasKeys
	];

}, true);