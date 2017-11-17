/*!
 * ${copyright}
 */
/**
 * Defines support rules of the Image control of sap.m library.
 */
sap.ui.define(["sap/ui/support/library"],
	function(SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity, // Low, Medium, High
		Audiences = SupportLib.Audiences; // Control, Internal, Application

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/**
	 * Warns about the impact of the <code>densityAware</code> property of <code>sap.m.Image</code>
	 */
	var oImageRule = {
		id : "densityAwareImage",
		audiences: [Audiences.Control],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "1.28",
		title: "Image: Density awareness enabled",
		description: "One or more requests will be sent trying to get the density perfect version of the image. These extra requests will impact performance, if the corresponding density versions of the image do not exist on the server",
		resolution: "Either ensure the corresponding density versions of the image exist on the backend server or disable density awareness",
		resolutionurls: [{
			text: "API Refrence for sap.m.Image",
			href: "https://sapui5.hana.ondemand.com/#/api/sap.m.Image"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.Image")
				.forEach(function(oElement) {
					if (oElement.getDensityAware()) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.Low,
							details: "Image '" + sElementName + "' (" + sElementId + ") is density aware",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};

	return [oImageRule];

}, true);
