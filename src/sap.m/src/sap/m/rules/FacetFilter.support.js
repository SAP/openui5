/*!
 * ${copyright}
 */
/**
 * Defines support rules of the FacetFilter control of sap.m library.
 */
sap.ui.define(["sap/ui/support/library", "sap/ui/model/BindingMode"], function(SupportLib, BindingMode) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, Bindings, Consistency, FioriGuidelines, Functionality, Usability, DataModel, Modularization, Usage, Other
		Severity = SupportLib.Severity,	// Hint, Warning, Error
		Audiences = SupportLib.Audiences; // Control, Internal, Application

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/**
	 *  Checks if growing is set along with one-way binding
	 */
	var oFacetFilterGrowingOneWayBinding = {
		id: "facetFilterGrowingOneWayBinding",
		audiences: [Audiences.Control],
		categories: [Categories.Usage],
		enabled: true,
		minversion: "1.28",
		title: "FacetFilter: growing is set along with two-way binding",
		description: "Growing works only with one-way binding",
		resolution: "Growing works only with one-way binding",
		resolutionurls: [{
			text: "SAP Fiori Design Guidelines: FacetFilter",
			href: "https://experience.sap.com/fiori-design-web/facet-filter/"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.FacetFilterList")
				.forEach(function(oElement) {
					if (oElement.getGrowing()
						&& oElement.getModel()
						&& oElement.getModel().getDefaultBindingMode() === BindingMode.TwoWay) {
						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.High,
							details: "FacetFilter '" + sElementName + "' (" + sElementId
								+ ") growing property is set to true, when binding mode is two-way",
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
		oFacetFilterGrowingOneWayBinding
	];

}, true);