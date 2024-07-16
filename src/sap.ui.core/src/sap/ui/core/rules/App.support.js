/*!
 * ${copyright}
 */
/**
 * Defines Application related support rules.
 */
sap.ui.define([
	"sap/ui/support/library"
], function(SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories; // Accessibility, Performance, Memory, ...
	var Severity = SupportLib.Severity; // Hint, Warning, Error
	var Audiences = SupportLib.Audiences; // Control, Internal, Application

	//**********************************************************
	// Rule Definitions
	//**********************************************************
	/**
	 * Check for usage of Controller Extension API.
	 */
	var oControllerExtensionRule = {
		id: "controllerExtension",
		audiences: [Audiences.Internal],
		categories: [Categories.Usage],
		enabled: true,
		minversion: "1.61",
		title: "Wrong usage of Controller Extension API",
		description: "Your controller extension definition is a subclass of sap.ui.core.mvc.Controller.",
		resolution: "Your controller extension module should return a plain object.",
		check: function(oIssueManager, oCoreFacade, oScope) {
			var oLoggedObjects = oScope.getLoggedObjects("ControllerExtension");
			oLoggedObjects.forEach(function(oLoggedObject) {
				oIssueManager.addIssue({
					severity: Severity.Medium,
					details: oLoggedObject.message,
					context: {
						id: "WEBPAGE"
					}
				});
			});
		}
	};

	/**
	 * Checks for missing super init() calls on sap.ui.core.UIComponents.
	 */
	var oMissingSuperInitRule = {
	   id: "missingInitInUIComponent",
	   audiences: [Audiences.Application, Audiences.Control, Audiences.Internal],
	   categories: [Categories.Functionality],
	   enabled: true,
	   minversion: "1.89",
	   title: "Missing super init() call in sap.ui.core.UIComponent",
	   description: "A sub-class of sap.ui.core.UIComponent which overrides the init() function must apply the super init() function as well.",
	   resolution: "A bound call to sap.ui.core.UIComponent.prototype.init must be introduced in the sub-class.",
	   resolutionurls: [{
		   text: "API Documentation: sap.ui.core.UIComponent#init",
		   href: "https://sdk.openui5.org/api/sap.ui.core.UIComponent/methods/init"
	   }],
	   check: function(oIssueManager, oCoreFacade, oScope) {
		   var oLoggedObjects = oScope.getLoggedObjects("missingInitInUIComponent");
		   oLoggedObjects.forEach(function(oLoggedObject) {
			   oIssueManager.addIssue({
				   severity: Severity.High,
				   details: oLoggedObject.message,
				   context: {
					   id: "WEBPAGE"
				   }
			   });
		   });
	   }
   };

	/**
	 * Checks for missing super constructor calls on sap.ui.core.Component and sap.ui.core.mvc.Controller.
	 */
	var oMissingSuperConstructorRule = {
	   id: "missingSuperConstructor",
	   audiences: [Audiences.Application, Audiences.Control, Audiences.Internal],
	   categories: [Categories.Functionality],
	   enabled: true,
	   minversion: "1.93",
	   title: "Missing super constructor call",
	   description: "A sub-class of sap.ui.core.Component or sap.ui.core.mvc.Controller which overrides the constructor must apply the super constructor as well.",
	   resolution: "A bound call to sap.ui.core.Component or sap.ui.core.mvc.Controller must be introduced in the sub-class.",
	   resolutionurls: [{
		   text: "API Documentation: sap.ui.core.mvc.Controller",
		   href: "https://sdk.openui5.org/api/sap.ui.core.mvc.Controller"
	   },
	   {
		   text: "API Documentation: sap.ui.core.Component",
		   href: "https://sdk.openui5.org/api/sap.ui.core.Component"
	   }],
	   check: function(oIssueManager, oCoreFacade, oScope) {
		   var oLoggedObjects = oScope.getLoggedObjects("missingSuperConstructor");
		   oLoggedObjects.forEach(function(oLoggedObject) {
			   oIssueManager.addIssue({
				   severity: Severity.High,
				   details: oLoggedObject.message,
				   context: {
					   id: "WEBPAGE"
				   }
			   });
		   });
	   }
   };

	return [
		oMissingSuperInitRule,
		oMissingSuperConstructorRule,
		oControllerExtensionRule
	];
});