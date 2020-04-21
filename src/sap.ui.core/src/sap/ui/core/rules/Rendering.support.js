/*!
 * ${copyright}
 */
/**
 * Defines support rules related to the view.
 */
sap.ui.define([
		"sap/ui/support/library",
		"sap/ui/core/RenderManager"
	],
	function(SupportLib, RenderManager) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories;
	var Severity = SupportLib.Severity;
	var Audiences = SupportLib.Audiences;

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/**
	 * Checks for renderers not using semantic rendering
	 */
	var oRendererInterfaceVersion = {
		id: "semanticRenderingNotUsed",
		audiences: [Audiences.Control],
		categories: [Categories.Performance],
		enabled: true,
		minversion: "-",
		title: "Control and renderer not migrated to modern rendering syntax",
		description: "Controls must use modern rendering syntax.",
		resolution: "Control and renderer must be migrated to modern rendering syntax. For more information consult with documentation.",
		resolutionurls: [{
			text: "Documentation: RenderManager syntax",
			href: "https://sapui5.hana.ondemand.com/#/api/sap.ui.core.RenderManager"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aControls = oScope.getElements().filter(function (oElement) { return oElement.isA("sap.ui.core.Control"); });

			aControls.forEach(function (oControl) {
				// The XMLView is excluded for now to not produce false-positive results
				// Due to the possibility of mixing XHTML and UI5 content in the XML content,
				// the XMLViewRenderer cannot be migrated fully to API version 2 yet.
				if (RenderManager.getApiVersion(oControl.getRenderer()) < 2 && !oControl.isA("sap.ui.core.mvc.XMLView")) {
					var sControlName = oControl.getMetadata().getName();

					oIssueManager.addIssue({
						severity: Severity.Medium,
						category: Categories.Performance,
						details: "The control '" + sControlName + "' is not migrated to modern rendering syntax. " +
										 "This means it cannot benefit from UI5's modern, DOM-based rendering engine. " +
										 "Please consult with the referred documentation regarding the modern API of RenderManager.",
						context: {
							id: oControl.getId()
						}
					});

				}
			});
		}
	};

	return [
		oRendererInterfaceVersion
	];
}, true);
