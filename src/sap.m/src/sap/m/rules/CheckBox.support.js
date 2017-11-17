/*!
 * ${copyright}
 */
/**
 * Defines support rules of the CheckBox control of sap.m library.
 */
sap.ui.define(["sap/ui/support/library"],
	function(SupportLib) {
		"use strict";

		var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
			Severity = SupportLib.Severity, // Low, Medium, High
			Audiences = SupportLib.Audiences; // Control, Internal, Application

		//**********************************************************
		// Rule Definitions
		//**********************************************************

		/**
		* Checks if the control is <code>enabled</code>, when the <code>editable</code> property is true.
		*/
		var oCheckBoxRule = {
			id : "checkBoxDisabledAndEditable",
			audiences: [Audiences.Control],
			categories: [Categories.Functionality],
			enabled: true,
			minversion: "-",
			title: "CheckBox: the control is editable, while the control is disabled",
			description: "Disabled control can`t be edited",
			resolution: "Either set enabled to true ot set editable to false",
			resolutionurls: [{
				text: "API Reference: sap.m.CheckBox",
				href: "https://sapui5.hana.ondemand.com/#/api/sap.m.CheckBox"
			}],
			check: function (oIssueManager, oCoreFacade, oScope) {
				oScope.getElementsByClassName("sap.m.CheckBox")
					.forEach(function(oElement) {
						var sElementId,
							sElementName;

						if (oElement.getEditable() && !oElement.getEnabled()) {
								sElementId = oElement.getId();
								sElementName = oElement.getMetadata().getElementName();

								oIssueManager.addIssue({
									severity: Severity.Low,
									details: "CheckBox '" + sElementName + "' (" + sElementId + ") is editable, but disabled",
									context: {
										id: sElementId
									}
								});
							}
						});
			}
		};

		return [oCheckBoxRule];

	}, true);
