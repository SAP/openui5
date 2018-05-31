/*!
 * ${copyright}
 */
/**
 * Defines support rules for the app configuration.
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/base/util/LoaderExtensions",
	"sap/ui/support/library"
], function(
	jQuery,
	LoaderExtensions,
	SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories; // Accessibility, Performance, Memory, ...
	var Severity = SupportLib.Severity; // Hint, Warning, Error
	var Audiences = SupportLib.Audiences; // Control, Internal, Application

	//**********************************************************
	// Rule Definitions
	//**********************************************************
	/**
	 * Checks whether the preload configuration was set correctly to async
	 */
	var oPreloadAsyncCheck = {
		id: "preloadAsyncCheck",
		audiences: [Audiences.Application],
		categories: [Categories.Performance],
		enabled: true,
		minversion: "1.32",
		title: "Preload Configuration",
		description: "Checks whether the preload configuration was set correctly to async",
		resolution: "Add \"data-sap-ui-preload=\"async\"\" to script tag that includes \"sap-ui-core.js\"",
		resolutionurls: [{
			text: "Performance: Speed Up Your App",
			href: "https://sapui5.hana.ondemand.com/#docs/guide/408b40efed3c416681e1bd8cdd8910d4.html"
		}],
		check: function(oIssueManager, oCoreFacade) {
			// Check for FLP scenario
			var oUshellLib = sap.ui.getCore().getLoadedLibraries()["sap.ushell"],
				bIsDebug = sap.ui.getCore().getConfiguration().getDebug();

			if (!bIsDebug && sap.ui.getCore().getConfiguration().getPreload() !== "async" && !oUshellLib) {
				oIssueManager.addIssue({
					severity: Severity.High,
					details: "Preloading libraries asynchronously improves the application performance massively.",
					context: {
						id: "WEBPAGE"
					}
				});
			}
		}
	};

	/**
	 * Checks whether all requests for SAPUI5 repository resources contain a cache buster token
	 * It checks the requests under ICF node "/sap/bc/ui5_ui5/"
	 */
	var oCacheBusterToken = {
		id: "cacheBusterToken",
		audiences: [Audiences.Application],
		categories: [Categories.Performance],
		enabled: true,
		minversion: "1.28",
		title: "Application Resource Caching",
		description: "Checks whether the application uses cache buster tokens in its requests for static resources from SAPUI5 repositories",
		resolution: "Change the application\n" +
			"Note: Not using cache buster tokens has a negative impact on performance.\n" +
			"For more information, see the SAPUI5 developer guide.",
		resolutionurls: [{
			text: "Documentation: Cache Buster for SAPUI5 Application Resources",
			href: "https://sapui5.hana.ondemand.com/#docs/guide/4cfe7eff3001447a9d4b0abeaba95166.html"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var sUI5ICFNode = "/sap/bc/ui5_ui5/";
			var aAppNames = [];
			var sAppName;
			var aRequests = jQuery.sap.measure.getRequestTimings();
			for (var i = 0; i < aRequests.length; i++) {
				var sUrl = aRequests[i].name;
				//We limit the check to requests under ICF node "/sap/bc/ui5_ui5/", only these are relevant here
				if (sUrl.indexOf(sUI5ICFNode) > 0) {
					if (!sUrl.match(/\/~[A-Z0-9]*~/g)) {
						if (sUrl.indexOf("/sap-ui-cachebuster/sap-ui-core.js") < 0 && sUrl.indexOf("sap-ui-cachebuster-info.json") < 0) {
							var aSegments = sUrl.split(sUI5ICFNode);
							aSegments = aSegments[1].split("/");
							sAppName = aSegments[0] === "sap" ? aSegments[1] : "/" + aSegments[0] + "/" + aSegments[1];
							if (aAppNames.indexOf(sAppName) < 0) {
								aAppNames.push(sAppName);
							}
						}
					}
				}
			}
			for (var i = 0; i < aAppNames.length; i++) {
				sAppName = aAppNames[i];
				var sICFPath = sUI5ICFNode + (sAppName.charAt(0) === "/" ? sAppName.substr(1) : "sap/" + sAppName);
				oIssueManager.addIssue({
					severity: Severity.Medium,
					details: "Application '" + sAppName + "' has no cache buster tokens in some or all of its requests.\n " +
						"For more information about the URLs affected under application '" + sAppName + "' please check the network trace for URLs starting with '" + sICFPath + "'",
					context: {
						id: "WEBPAGE"
					}
				});
			}
		}
	};

	var oLibraryUsage = {
		id: "libraryUsage",
		audiences: [Audiences.Application],
		categories: [Categories.Performance],
		enabled: true,
		minversion: "1.34",
		title: "Library Usage",
		description: "Checks whether there are unused loaded libraries",
		resolution: "Adapt your application descriptor and your application coding to improve the performance",
		resolutionurls: [{
			text: 'Documentation: Descriptor Dependencies to Libraries and Components',
			href: 'https://openui5.hana.ondemand.com/#/topic/8521ad1955f340f9a6207d615c88d7fd'
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {

			//1. Ignore libraries with instantiated elements
			var mLibraries = sap.ui.getCore().getLoadedLibraries();
			oScope.getElements().forEach(function(oElement) {
				var sElementLib = oElement.getMetadata().getLibraryName();
				if (mLibraries[sElementLib]) {
					delete mLibraries[sElementLib];
				}
			});

			// 2. Ignore libraries with declared modules
			// Alternative: More exact, but request-dependent solution would be loading and evaluating the resources.json file for each library
			var aDeclaredModules = LoaderExtensions.getAllRequiredModules();
			Object.keys(mLibraries).forEach(function(sLibrary) {
				var sLibraryWithDot = sLibrary + ".";
				for (var i = 0; i < aDeclaredModules.length; i++) {
					// Ignore library types and library enum files
					var sDeclaredModule = aDeclaredModules[i];
					if (sDeclaredModule.indexOf(sLibraryWithDot) === 0 &&
						mLibraries[sLibrary].types.indexOf(sDeclaredModule) === -1 &&
						sDeclaredModule.lastIndexOf(".library") !== sDeclaredModule.length - ".library".length &&
						sDeclaredModule.lastIndexOf(".library-preload") !== sDeclaredModule.length - ".library-preload".length &&
						sDeclaredModule.lastIndexOf(".flexibility") !== sDeclaredModule.length - ".flexibility".length &&
						sDeclaredModule.lastIndexOf(".support") !== sDeclaredModule.length - ".support".length) {
						delete mLibraries[sLibrary];
						break;
					}
				}
			});

			// 3. Remove unused library dependent unused libraries
			var aUnusedLibrary = Object.keys(mLibraries);
			Object.keys(mLibraries).forEach(function(sLibrary) {
				mLibraries[sLibrary].dependencies.forEach(function(oDependency) {
					var iIndex = aUnusedLibrary.indexOf(oDependency);
					if (iIndex > -1) {
						aUnusedLibrary.splice(iIndex, 1);
					}
				});
			});

			aUnusedLibrary.forEach(function(sUnusedLibrary) {
				// There are apps which use modules with default lib (empty string)
				if (sUnusedLibrary){
					oIssueManager.addIssue({
						severity: Severity.Medium,
						details: "The library '" + sUnusedLibrary + "' has been loaded, but not used so far in the analyzed scope of the application. There are two options to solve this issue: \n" +
							"1. If the library is needed at later state in your application, you can make use of lazy library loading (see resolution section)." +
							" Please be aware that if this lazy flag isn't used correctly this might lead to a performance decrease. \n" +
							"2. If the library has been loaded by accident and is never used in the application, you should remove the library from the bootstrap or application descriptor.",
						context: {
							id: "WEBPAGE"
						}
					});
				}
			});
		}
	};

	var oLazyComponents = {
		id: "lazyComponents",
		audiences: [Audiences.Application],
		categories: [Categories.Performance],
		enabled: true,
		minversion: "1.48",
		title: "Lazy loading of components",
		description: "Checks whether lazy loading of components is used",
		resolution: "Adapt your application descriptor and your application coding to improve the performance",
		resolutionurls: [{
			text: 'Documentation: Descriptor Dependencies to Libraries and Components',
			href: 'https://openui5.hana.ondemand.com/#/topic/8521ad1955f340f9a6207d615c88d7fd'
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var mComponents = oCoreFacade.getComponents();
			var mComponentReuseUsage = {};
			var bComponentLazyKnown = false;

			Object.keys(mComponents).forEach(function(sComponentId) {
				var oManifest = mComponents[sComponentId].getManifest();
				if (oManifest && oManifest['sap.ui5'] && oManifest['sap.ui5'].dependencies) {
					var mComps = oManifest['sap.ui5'].dependencies.components;
					if (mComps && Object.keys(mComps).length > 0) {
						mComponentReuseUsage[sComponentId] = true;
						Object.keys(mComps).forEach(function(sComp) {
							if (mComps[sComp].lazy !== undefined) {
								bComponentLazyKnown = true;
							}
						});
					}
				}
			});

			if (Object.keys(mComponentReuseUsage).length > 0 && !bComponentLazyKnown) {
				Object.keys(mComponentReuseUsage).forEach(function(sComponent) {
					oIssueManager.addIssue({
						severity: Severity.Medium,
						details: "No lazy Component loading detected. Define lazy components in your application descriptor, if this feature can be used in the application.",
						context: {
							id: sComponent
						}
					});
				});
			}
		}
	};

	var oReuseComponents = {
		id: "reuseComponents",
		audiences: [Audiences.Application],
		categories: [Categories.Performance],
		enabled: true,
		minversion: "1.48",
		title: "Components reusage via componentUsages",
		description: "Components are more performant and flexible, if defined via componentUsages",
		resolution: "Adapt your application descriptor and your application coding to improve the performance",
		resolutionurls: [{
			text: 'Documentation: Using and Nesting Components',
			href: 'https://openui5.hana.ondemand.com/#/topic/346599f0890d4dfaaa11c6b4ffa96312'
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var mComponents = oCoreFacade.getComponents();
			var mComponentUsage = {};
			var bComponentUsagesUsed = false;

			Object.keys(mComponents).forEach(function(sComponentId) {
				var oManifest = mComponents[sComponentId].getManifest();
				var oManifestSapUi5 = oManifest['sap.ui5'];

				// Check usage of old way of defining Components
				if (oManifestSapUi5 && oManifestSapUi5.dependencies &&
					oManifestSapUi5.dependencies['components'] &&
					Object.keys(oManifestSapUi5.dependencies['components']).length > 0) {
					mComponentUsage[sComponentId] = true;
				}

				// Check usage of new way of defining Components
				if (oManifestSapUi5 && oManifestSapUi5.componentUsages !== undefined) {
					bComponentUsagesUsed = true;
				}
			});

			if (Object.keys(mComponentUsage).length > 0 && !bComponentUsagesUsed) {
				Object.keys(mComponentUsage).forEach(function(sComponentId) {
					oIssueManager.addIssue({
						severity: Severity.Medium,
						details: "There are defined reuse components in the application descriptor. Please check the documentation," +
							" whether you can define your components via componentUsage.",
						context: {
							id: sComponentId
						}
					});
				});
			}
		}
	};

	var oModelPreloading = {
		id: "modelPreloading",
		audiences: [Audiences.Application],
		categories: [Categories.Performance],
		enabled: true,
		minversion: "1.38",
		title: "Model preloading",
		description: "Preloaded models, which load their data from external locations, can load data earlier",
		resolution: "Adapt your application descriptor and your application coding to improve the performance",
		resolutionurls: [{
			text: 'Documentation: Manifest Model Preload',
			href: 'https://openui5.hana.ondemand.com/#/topic/26ba6a5c1e5c417f8b21cce1411dba2c'
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var mComponents = oCoreFacade.getComponents();
			var mComponentsWithRelevantModels = {};
			var bModelPreloadKnown = false;

			Object.keys(mComponents).forEach(function(sComponentId) {
				var oManifest = mComponents[sComponentId].getManifest();
				var mModels = oManifest['sap.ui5'].models || {};
				var mDataSources = oManifest['sap.app'].dataSources;
				Object.keys(mModels).forEach(function(sModel) {
					var mModel = mModels[sModel];
					var mDataSource;
					if (mModel.dataSource) {
						mDataSource = mDataSources[mModel.dataSource];
					}
					if (mModel.type === "sap.ui.model.odata.v2.ODataModel"
						|| mModel.type === "sap.ui.model.odata.v4.ODataModel"
						|| mDataSource && mDataSource.type === "OData") {
						mComponentsWithRelevantModels[sComponentId] = true;
						if (mModel.preload !== undefined) {
							bModelPreloadKnown = true;
						}
					}
				});
			});
			if (!bModelPreloadKnown) {
				Object.keys(mComponentsWithRelevantModels).forEach(function(sComponentId) {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: "The used OData models don't make use of the preloading feature.",
						context: {
							id: sComponentId
						}
					});
				});
			}
		}
	};

	var oAsynchronousXMLViews = {
		id: "asynchronousXMLViews",
		audiences: [Audiences.Application],
		categories: [Categories.Performance],
		enabled: true,
		minversion: "1.34",
		title: "Asynchronous XML views",
		description: "Asynchronous XML views leads to smoother view transitions, doesn't block the UI and allows for more efficient SAPUI5 flexibility services",
		resolution: "Adapt your application descriptor and your application coding to improve the performance and efficiency",
		resolutionurls: [{
			text: 'Documentation: Routing Configuration',
			href: 'https://openui5.hana.ondemand.com/#/topic/902313063d6f45aeaa3388cc4c13c34e'
		}, {
			text: "Documentation: Instantiating Views",
			href: "https://openui5.hana.ondemand.com/#/topic/68d0e58857a647d49470d9f92dd859bd"
		}, {
			text: "Documentation: UI Adaptation at Runtime: Enable Your App",
			href: "https://sapui5.hana.ondemand.com/#docs/guide/f1430c0337534d469da3a56307ff76af.html"
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var mComponents = oCoreFacade.getComponents();
			var mComponentsRoutingSync = {};

			// 1. Collect XML views in analyzed scope
			var aSyncXMLViews = oScope.getElements().filter(function(oControl) {
				return oControl.getMetadata().getName() === "sap.ui.core.mvc.XMLView";
			}).filter(function(oXMLView) {
				return oXMLView.oAsyncState === undefined;
			});

			Object.keys(mComponents).forEach(function(sComponentId) {
				// 2. Check router instances and collect connected views (also other view types than XML)
				var oRouter = mComponents[sComponentId].getRouter && mComponents[sComponentId].getRouter();
				if (oRouter && oRouter._oConfig) {
					if (oRouter._oConfig._async !== true) {
						mComponentsRoutingSync[sComponentId] = [];
						if (mComponents[sComponentId].getTargets() &&
							mComponents[sComponentId].getTargets()._oViews &&
							mComponents[sComponentId].getTargets()._oViews._oViews) {
							var oTargetViews = mComponents[sComponentId].getTargets()._oViews._oViews;
							Object.keys(oTargetViews).forEach(function(sViewId) {
								var sViewName = oTargetViews[sViewId].getViewName().split("\.").pop();
								mComponentsRoutingSync[sComponentId].push(sViewName);
								aSyncXMLViews = aSyncXMLViews.filter(function(oXMLView) {
									return oTargetViews[sViewId] !== oXMLView;
								});
							});
						}
					}
				}
			});

			Object.keys(mComponentsRoutingSync).forEach(function(sComponentId) {
				oIssueManager.addIssue({
					severity: Severity.High,
					details: "Routing between views (" + mComponentsRoutingSync[sComponentId].join(', ') + ") is used, but configured to be synchronous." +
						" Please take a look at the resolution 'Routing Configuration'.",
					context: {
						id: sComponentId
					}
				});
			});

			aSyncXMLViews.forEach(function(oSyncView) {
				var sSyncViewId = oSyncView.getId();
				var sViewName = oSyncView.getViewName().split("\.").pop();
				oIssueManager.addIssue({
					severity: Severity.Medium,
					details: "The XML view '" + sViewName + " is loaded synchronous. Please take a look at the resolution 'Instantiating Views'.",
					context: {
						id: sSyncViewId
					}
				});
			});
		}
	};

	return [
		oPreloadAsyncCheck,
		oCacheBusterToken,
		oLibraryUsage,
		oLazyComponents,
		oReuseComponents,
		oModelPreloading,
		oAsynchronousXMLViews
	];
}, true);