/*!
 * ${copyright}
 */
/**
 * Defines support rules of the SelectDialog control of sap.m library.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library"],
	function(jQuery, SupportLib) {
		"use strict";

		// shortcuts
		var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
			Severity = SupportLib.Severity,	// Hint, Warning, Error
			Audiences = SupportLib.Audiences; // Control, Internal, Application

		//**********************************************************
		// Rule Definitions
		//**********************************************************

		/**
		 *Checks, if a selectDialog does not contain inactive list items
		 */
		var oSelectDialogNonActiveItem = {
			id : "noContainInactiveItemsInSelectDialog",
			audiences: [Audiences.Control],
			categories: [Categories.Usability],
			enabled: true,
			minversion: "1.28",
			title: "SelectDialog: Select Dialog should not contain inactive items",
			description: "All items in a Select Dialog should be interactable/selectable",
			resolution: "Make all items interactable/selectable or remove the inactive ones",
			resolutionurls: [{
				text: "SAP Fiori Design Guidelines: SelectDialog",
				href: "https://experience.sap.com/fiori-design-web/select-dialog/#behavior-and-interaction"
			}],
			check: function (oIssueManager, oCoreFacade, oScope) {
				oScope.getElementsByClassName("sap.m.SelectDialog")
					.forEach(function(oElement) {
						var aListItems = oElement.getItems(),
							sListOfInactiveItems = "";

						aListItems.forEach(function(oListItem){
							if (oListItem.getType() === sap.m.ListType.Inactive) {
								var sListItemId = oListItem.getId(),
									sListItemName = oListItem.getMetadata().getElementName();

								sListOfInactiveItems += sListItemName + " (" + sListItemId + "); ";

							}
						});

						if (sListOfInactiveItems) {
							var sElementId = oElement.getId(),
								sElementName = oElement.getMetadata().getElementName();

							oIssueManager.addIssue({
								severity: Severity.Medium,
								details: "SelectDialog '" + sElementName + "' (" + sElementId + ") contains one or more items of type 'Inactive' : " + sListOfInactiveItems,
								context: {
									id: sElementId
								}
							});
						}
					});
			}
		};

		return [oSelectDialogNonActiveItem];

	}, true);