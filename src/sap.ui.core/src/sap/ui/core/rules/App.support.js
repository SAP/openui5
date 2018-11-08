/*!
 * ${copyright}
 */
/**
 * Defines Application related support rules.
 */
sap.ui.define(["sap/ui/support/library"], function(SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories; // Accessibility, Performance, Memory, ...
	var Severity = SupportLib.Severity; // Hint, Warning, Error
	var Audiences = SupportLib.Audiences; // Control, Internal, Application

	var aObsoleteFunctionNames = ["jQuery.sap.require", "$.sap.require", "sap.ui.requireSync", "jQuery.sap.sjax"];

	// avoid spoiling the globalAPIRule by using Object.getOwnPropertyDescriptor
	if (jQuery && jQuery.sap && !!Object.getOwnPropertyDescriptor(jQuery.sap, "sjax").value) {
		aObsoleteFunctionNames.push("jQuery.sap.syncHead",
			"jQuery.sap.syncGet",
			"jQuery.sap.syncPost",
			"jQuery.sap.syncGetText",
			"jQuery.sap.syncGetJSON");
	}

	//**********************************************************
	// Rule Definitions
	//**********************************************************
	/**
	 * Check controller code for obsolete function calls.
	 *
	 * e.g. <code>{aObsoleteFunctionNames:["jQuery.sap.sjax"]}</code>
	 */
	var oControllerSyncCodeCheckRule = {
		id: "controllerSyncCodeCheck",
		audiences: [Audiences.Internal],
		categories: [Categories.Consistency],
		enabled: true,
		minversion: "1.32",
		title: "Synchronous calls in controller code",
		description: "Synchronous calls are deprecated within the Google Chrome browser and block the UI.",
		resolution: "Use asynchronous XHR calls instead",
		resolutionurls: [{
			text: 'Documentation: Loading a Module',
			href: 'https://sapui5.hana.ondemand.com/#docs/guide/d12024e38385472a89c1ad204e1edb48.html'
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {

			// get the controllers and the associated viewId
			var aElements = oScope.getElementsByClassName(sap.ui.core.mvc.View);
			var aControllersWithViewId = [];
			aElements.forEach(function(oElement) {
				if (oElement.getController) {
					var oController = oElement.getController();
					if (oController) {
						aControllersWithViewId.push({
							controller: oController,
							viewId: oElement.getId()
						});
					}
				}
			});

			// checks the given module's functions code for invalidContent
			// returns an array which contains the functions with invalid content
			var fnGatherInvalidControllerFunctions = function(oController, viewId, aInvalidContent, fnProcessInvalidFunction) {
				var _aInvalidControllerFunctions = [];
				Object.keys(oController).forEach(function(sProtoKey) {
					var sFnContent = oController[sProtoKey].toString().replace(/(\r\n|\n|\r)/gm, "");

					aInvalidContent.forEach(function(sInvalidContent) {
						if (sFnContent.indexOf(sInvalidContent) > 0) {
							fnProcessInvalidFunction(oController.getMetadata().getName(), sProtoKey, sInvalidContent, viewId);
						}
					});


				});
				return _aInvalidControllerFunctions;
			};

			var mViewIdToControllerFunctions = {};

			// check the code for each controller and their prototype
			// and stores it grouped by view id in <code>mViewIdToControllerFunctions</code>
			aControllersWithViewId.forEach(function(oControllerWithViewId) {

				var fnMapUsingViewIds = function(sControllerName, sFnName, sInvalidContent, sViewId) {
					mViewIdToControllerFunctions[sViewId] = mViewIdToControllerFunctions[sViewId] || [];
					mViewIdToControllerFunctions[sViewId].push({
						controllerName: sControllerName,
						functionName: sFnName,
						invalidContent: sInvalidContent
					});
				};

				// check each controller and their prototypes
				var oController = oControllerWithViewId.controller;
				while (oController) {
					fnGatherInvalidControllerFunctions(oController, oControllerWithViewId.viewId, aObsoleteFunctionNames, fnMapUsingViewIds);
					var oControllerPrototype = Object.getPrototypeOf(oController);
					// sanity check to avoid potential endless loops and limit recursion only up to the Controller itself
					if (oController === oControllerPrototype || oControllerPrototype === sap.ui.core.mvc.Controller.prototype) {
						break;
					}
					oController = oControllerPrototype;
				}
			});


			// add issues for each invalid controller function
			Object.keys(mViewIdToControllerFunctions).forEach(function(sViewId) {
				var aControllerFunctions = mViewIdToControllerFunctions[sViewId];
				oIssueManager.addIssue({
					severity: Severity.Medium,
					details: aControllerFunctions.map(function(oController) {
						return "Synchronous call " + oController.invalidContent + " found in " + oController.controllerName + "#" + oController.functionName;
					}).reduce(function(sFullText, sCurrentText) {
						return sFullText + "\n" + sCurrentText;
					}),
					context: {
						id: sViewId
					}
				});

			});

		}

	};

	/**
	 * Check for usage of stubbed global API, which leads to a sync request and should be avoided.
	 *
	 * e.g. <code>jQuery.sap.assert(bValue)</code>
	 */
	var oGlobalAPIRule = {
		id: "globalApiUsage",
		audiences: [Audiences.Internal],
		categories: [Categories.Modularization],
		enabled: true,
		minversion: "1.58",
		title: "Call of deprecated global API",
		description: "Calls of deprecated global API without declaring the according dependency should be avoided.",
		resolution: "Declare the dependency properly or even better: Migrate to the modern module API as documented.",
		resolutionurls: [{
			text: 'Documentation: Modularization',
			// TODO: link to the modularization dev guide
			href: 'https://openui5.hana.ondemand.com/#/api'
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var oLoggedObjects = oScope.getLoggedObjects("jquery.sap.stubs");
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
	 * Check for usage of jquery.sap modules and provide a hint on the alternatives.
	 */
	var oJquerySapRule = {
		id: "jquerySapUsage",
		audiences: [Audiences.Internal],
		categories: [Categories.Modularization],
		enabled: true,
		minversion: "1.58",
		async: true,
		title: "Usage of deprecated jquery.sap module",
		description: "Usage of deprecated jquery.sap API should be avoided and dependencies to jquery.sap are not needed any longer.",
		resolution: "Migrate to the modern module API as documented.",
		resolutionurls: [{
			text: 'Documentation: Modularization',
			// TODO: link to the modularization dev guide
			href: 'https://openui5.hana.ondemand.com/#/api'
		}],
		check: function(oIssueManager, oCoreFacade, oScope, fnResolve) {
			sap.ui.require(["sap/base/util/LoaderExtensions"], function(LoaderExtensions) {
				var sDetails = "Usage of deprecated jquery.sap modules detected: \n" +
					LoaderExtensions.getAllRequiredModules().filter(function(sModuleName) {
						return sModuleName.startsWith("jquery.sap");
					}).reduce(function(sModuleList, sModuleName) {
						return sModuleList + "\t- " + sModuleName + "\n";
					}, "");

				oIssueManager.addIssue({
					severity: Severity.Medium,
					details: sDetails,
					context: {
						id: "WEBPAGE"
					}
				});

				fnResolve();
			});
		}
	};

	/**
	 * Check if deprecated factories are called.
	 */
	var oSyncFactoryLoadingRule = {
		id: "syncFactoryLoading",
		audiences: [Audiences.Internal],
		categories: [Categories.Modularization],
		enabled: true,
		minversion: "1.58",
		title: "Usage of deprecated synchronous factories",
		description: "Usage of deprecated synchronous factories",
		resolution: "Avoid using synchronous factory functions. Use the create() and/or load() functions of the respective modules instead. For example: View.create(...) or Component.load(). Migrate to the modern module API as documented.",
		resolutionurls: [{
			text: 'Documentation: Legacy Factories Replacement',
			href: 'https://openui5.hana.ondemand.com/#/topic/491bd9c70b9f4c4d913c8c7b4a970833'
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aFactoryTypes = [
				"sap.ui.fragment",
				"sap.ui.xmlfragment",
				"sap.ui.jsfragment",
				"sap.ui.htmlfragment",
				"sap.ui.controller",
				"sap.ui.extensionpoint",
				"sap.ui.component",
				"sap.ui.view",
				"sap.ui.template"
			];

			aFactoryTypes.forEach(function(sType) {
				var oLoggedObjects = oScope.getLoggedObjects(sType);
				oLoggedObjects.forEach(function(oLoggedObject) {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: oLoggedObject.message,
						context: {
							id: "WEBPAGE"
						}
					});
				});
			});
		}
	};

	/**
	 * Check for avoidable synchronous XHRs.
	 */
	var oGlobalSyncXhrRule = {
		id: "globalSyncXHR",
		audiences: [Audiences.Internal],
		categories: [Categories.Consistency],
		enabled: true,
		minversion: "1.59",
		title: "Sending of synchronous XHR",
		description: "Sending synchronus XHRs has to be avoided.",
		resolution: "Check the details of the findings for tips to fix the issue.",
		resolutionurls: [{
			text: "Performance: Speed Up Your App",
			href: "https://sapui5.hana.ondemand.com/#/topic/408b40efed3c416681e1bd8cdd8910d4"
		},
		{
			text: "Configuration of 'sap.ui.loader'",
			href: "https://sapui5.hana.ondemand.com/#/api/sap.ui.loader"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var oLoggedObjects = oScope.getLoggedObjects("SyncXHR");
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
	 * Check for deprecated API calls in general.
	 * Not specific to factories or already covered APIs.
	 */
	var oDeprecatedAPIRule = {
		id: "deprecatedApiUsage",
		audiences: [Audiences.Internal],
		categories: [Categories.Modularization],
		enabled: true,
		minversion: "1.59",
		title: "Usage of deprecated API",
		description: "Usage of deprecated API should be avoided.",
		resolution: "Check the details of the findings for tips to fix the issue.",
		resolutionurls: [{
			text: 'Documentation: Adapting to the Modularization of the Core',
			href: 'https://openui5.hana.ondemand.com/#/topic/b8fdf0c903424c9191f142842323ae22'
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var oLoggedObjects = oScope.getLoggedObjects("Deprecation");
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

	return [oControllerSyncCodeCheckRule, oGlobalAPIRule, oJquerySapRule, oSyncFactoryLoadingRule, oGlobalSyncXhrRule, oDeprecatedAPIRule];
}, true);