/*!
 * ${copyright}
 */
/**
 * Defines support rules of the Form controls of sap.ui.layout library.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library"],
	function(jQuery, SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories; // Accessibility, Performance, Memory, ...
	var Severity = SupportLib.Severity; // Hint, Warning, Error
	var Audiences = SupportLib.Audiences; // Control, Internal, Application

	var aRules = [];

	function createRule(oRuleDef) {
		aRules.push(oRuleDef);
	}

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/* eslint-disable no-lonely-if */

	function isSimpleForm(oControl){
		if (oControl) {
			var oMetadata = oControl.getMetadata();
			if (oMetadata.getName() == "sap.ui.layout.form.SimpleForm") {
				return true;
			}
		}

		return false;
	}

	function isSmartForm(oControl){
		if (oControl) {
			var oMetadata = oControl.getMetadata();
			if (oMetadata.getName() == "sap.ui.comp.smartform.SmartForm" ||
					(oMetadata.getName() == "sap.m.Panel" && oControl.getParent().getMetadata().getName() == "sap.ui.comp.smartform.SmartForm")) {
				return true;
			}
		}

		return false;
	}

	createRule({
		id: "formResponsiveLayout",
		audiences: [Audiences.Control],
		categories: [Categories.Functionality],
		enabled: true,
		minversion: "1.48",
		title: "Form: Use of ResponsiveLayout",
		description: "ResponsiveLayout should not be used any longer because of UX requirements",
		resolution: "Use the ResponsiveGridLayout instead",
		resolutionurls: [{
				text: "API Reference: Form",
				href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.Form.html"
			},
			{
				text: "API Reference: SimpleForm",
				href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.SimpleForm.html"
			},
			{
				text: "API Reference: ResponsiveGridLayout",
				href:"https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.layout.form.ResponsiveGridLayout.html"
			}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.layout.form.Form")
			.forEach(function(oForm) {
				var oLayout = oForm.getLayout();
				if (oLayout && oLayout.getMetadata().getName() == "sap.ui.layout.form.ResponsiveLayout") {
					var oParent = oForm.getParent();
					var sId;
					var sName = "Form";

					if (isSimpleForm(oParent)) {
						sId = oParent.getId();
						sName = "SimpleForm";
					} else if (isSmartForm(oParent)) {
						// for SmartForm don't check on Form level
						return;
					} else {
						sId = oForm.getId();
					}

					oIssueManager.addIssue({
						severity: Severity.Medium,
						details: sName + " " + sId + " uses ResponsiveLayout.",
						context: {
							id: sId
						}
					});
				}
			});
		}
	});

	return {
		addRulesToRuleset: function(oRuleset) {
			jQuery.each(aRules, function(idx, oRuleDef){
				oRuleset.addRule(oRuleDef);
			});
		}
	};

}, true);