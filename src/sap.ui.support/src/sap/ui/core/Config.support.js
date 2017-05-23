/*!
 * ${copyright}
 */
/**
 * Defines support rules for the app configuration.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library"],
	function(jQuery, SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories; // Accessibility, Performance, Memory, ...
	var Severity = SupportLib.Severity; // Hint, Warning, Error
	var Audiences = SupportLib.Audiences; // Control, Internal, Application

	return {
		addRulesToRuleSet: function(oRuleSet) {

			//**********************************************************
			// Rule Definitions
			//**********************************************************
			/**
			 * Checks whether the preload configuration was set correctly to async
			 */
			oRuleSet.addRule({
				id : "preloadAsyncCheck",
				audiences: [Audiences.Control, Audiences.Internal],
				categories: [Categories.Performance],
				enabled: true,
				minversion: "1.32",
				maxversion: "-",
				title: "Preload Configuration",
				description: "Checks whether the preload configuration was set correctly to async",
				resolution: "Add \"data-sap-ui-preload=\"async\"\" to script tag that includes \"sap-ui-core.js\"",
				resolutionurls: [{
					text: "Performance: Speed Up Your App",
					href: "https://sapui5.hana.ondemand.com/#docs/guide/408b40efed3c416681e1bd8cdd8910d4.html"
				}],
				check: function(oIssueManager, oCoreFacade) {
					if (sap.ui.getCore().getConfiguration().getPreload() !== "async") {
						oIssueManager.addIssue({
							severity: Severity.High,
							details: "None",
							context: {
								id: "WEBPAGE"
							}
						});
					}
				}
			});

			/**
			 * Checks whether all requests for SAPUI5 repository resources contain a cache buster token
			 * It checks the requests under ICF node "/sap/bc/ui5_ui5/"
			 */
			oRuleSet.addRule({
				id: "cacheBusterToken",
				audiences : [Audiences.Application],
				categories : [Categories.Performance],
				enabled : true,
				minversion : "1.28",
				title : "Cache Buster Token",
				description : "Checks whether the application uses cache buster tokens in its requests for static resources from SAPUI5 repositories.",
				resolution : "Change the application.\n"
				+ "Note: Not using cache buster tokens negatively impacts performance.\n"
				+ "For more information, see the SAPUI5 developer guide.",
				resolutionurls : [{
					text : "SAPUI5 developer guide: ",
					href : "https://sapui5.hana.ondemand.com/#docs/guide/4cfe7eff3001447a9d4b0abeaba95166.html"
				}],
				check : function (oIssueManager, oCoreFacade, oScope) {
					var sUI5ICFNode = "/sap/bc/ui5_ui5/";
					var aAppNames = [];
					var sAppName;
					var aRequests = jQuery.sap.measure.getRequestTimings();
					for (var i = 0; i < aRequests.length; i++) {
						var sUrl = aRequests[i].name;
						//We limit the check to requests under ICF node "/sap/bc/ui5_ui5/", only these are relevant here
						if (sUrl.indexOf( sUI5ICFNode ) > 0) {
							if (!sUrl.match(/\/~[A-Z0-9]*~/g)) {
								if (sUrl.indexOf("/sap-ui-cachebuster/sap-ui-core.js") < 0 && sUrl.indexOf("sap-ui-cachebuster-info.json") < 0) {
									var aSegments = sUrl.split( sUI5ICFNode );
									aSegments = aSegments[1].split("/");
									sAppName = aSegments[0] === "sap" ? aSegments[1] : "/" + aSegments[0] + "/" + aSegments[1];
									if (aAppNames.indexOf(sAppName) < 0){
										aAppNames.push(sAppName);
									}
								}
							}
						}
					}
					for (var i = 0 ; i < aAppNames.length ; i++){
						sAppName = aAppNames[i];
						var sICFPath = sUI5ICFNode + ( sAppName.charAt(0) === "/" ? sAppName.substr(1) : "sap/" + sAppName ) ;
						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "Application '" + sAppName + "' is lacking cache buster tokens in some or all of its requests.\n " +
							"For more information about the URLs affected under application '" + sAppName + "' please check the network trace for URLs starting with '" + sICFPath + "'",
							context: {
								id: "WEBPAGE"
							}
						});
					}
				}
			});

		}
	};

}, true);
