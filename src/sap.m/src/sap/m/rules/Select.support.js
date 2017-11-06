/*!
 * ${copyright}
 */
/**
 * Defines support rules of the Select control of sap.m library.
 */
sap.ui.define(["sap/ui/support/library"],
	function(SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity, // Low, Medium, High
		Audiences = SupportLib.Audiences; // Control, Internal, Application

	// const
	var DEFAULT_MODEL_SIZE_LIMIT = 100;

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/**
	 *Checks if the 'items' aggregation binding of sap.m.Select is limited to 100 items
	 */
	var oSelectRule = {
		id : "selectItemsSizeLimit",
		audiences: [Audiences.Control],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "1.28",
		title: "Select: Items have size limit of 100",
		description: "The 'items' model imposes a default size limit of 100",
		resolution: "Use the sap.ui.model.Model.prototype.setSizeLimit to adjust the size limit of the 'items' model if you expect more than 100 items",
		resolutionurls: [{
			text: "API Reference for sap.ui.model.Model",
			href: "https://sapui5.hana.ondemand.com/#/api/sap.ui.model.Model"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.Select")
				.forEach(function(oElement) {

					var oBinding = oElement.getBinding("items"),
						oModel = oBinding && oBinding.oModel;

					if (oModel && (oModel.iSizeLimit === DEFAULT_MODEL_SIZE_LIMIT)) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.Low,
							details: "Select '" + sElementName + "' (" + sElementId + ") model has a default limit of 100 items",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};

	return [oSelectRule];

}, true);
