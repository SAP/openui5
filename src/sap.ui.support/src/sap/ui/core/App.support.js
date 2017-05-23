/*!
 * ${copyright}
 */
/**
 * Defines Application related support rules.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library"],
	function(jQuery, SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories; // Accessibility, Performance, Memory, ...
	var Severity = SupportLib.Severity; // Hint, Warning, Error
	var Audiences = SupportLib.Audiences; // Control, Internal, Application

	return {
		/**
		 *
		 * @param oRuleSet
		 * @param {object} oCfg configuration object with key 'aObsoleteFunctionNames' containing an array with obsolete
		 * function names.
		 */
		addRulesToRuleSet: function(oRuleSet, oCfg) {
			oCfg = oCfg || {};
			//**********************************************************
			// Rule Definitions
			//**********************************************************
			/**
			 * Check controller code for obsolete function calls.
			 *
			 * Uses oCfg with the obsolete function name
			 * e.g. <code>{aObsoleteFunctionNames:["jQuery.sap.sjax"]}</code>
			 */
			oRuleSet.addRule({
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

					// content which should be avoided (sync calls)
					var aObsoleteFunctionNames = oCfg.aObsoleteFunctionNames || [];

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
							var sFnContent = oController[sProtoKey].toString().replace(/(\r\n|\n|\r)/gm,"");

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
								return "\nSynchronous call " + oController.invalidContent + " found in " + oController.controllerName + "#" + oController.functionName;
							}),
							context: {
								id: sViewId
							}
						});

					});


				}
			});

		}
	};

}, true);