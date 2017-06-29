/*!
 * ${copyright}
 */
/**
 * Defines support rules for the app configuration.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library"],
	function(jQuery, SupportLib) {
	"use strict";

	return {
		addRulesToRuleSet: function(oRuleSet) {
/**
		 * Checks whether an application is scaffolding based
		 * It checks libraries in the dependencies of the app descriptor (manifest)
		 * Indicator for scaffolding applications is library "sap.ca.scfld.md"
		 */
		oRuleSet.addRule({
			id : "scaffolding",
			audiences : [sap.ui.support.Audiences.Application],
			categories : [sap.ui.support.Categories.Functionality, sap.ui.support.Categories.Performance],
			enabled : true,
			minversion : "1.30",
			title : "Scaffolding based application",
			description : "Checks whether the application is scaffolding based",
			resolution : "Migrate the application to a non scaffolding based one.\n"
					+ "Scaffolding based applications have several severe drawbacks: \n"
					+ " 1. Performance: No preload during startup ('manifest first' approach) possible.\n"
					+ "    No UI5 model preload, no manifest first supported.\n"
					+ " 2. Functionality: most of the flexibility descriptor changes are not supported.\n"
					+ "For more details, see the Developer Guide.",
			resolutionurls : [{
				text : "Developer Guide: ",
				href : "https://wiki.wdf.sap.corp/wiki/display/UI/Remove+Scaffolding+from+Applications"
			}],
			check : function(oIssueManager, oCoreFacade, oScope) {
				var aList = [];
				var oElement;
				var sId;
				var aElements = oScope.getElements();
				for (var i = 0; i < aElements.length; i++) {
					oElement = aElements[i];
					sId = sap.ui.core.Component.getOwnerIdFor(oElement);
					if (sId) {
						aList.push(sId);
					}
				}
				var aUniqueList = [];
				for (var i = 0; i < aList.length; i++) {
					sId = aList[i];
					if (aUniqueList.indexOf(sId) < 0) {
						aUniqueList.push(sId);
					}
				}
				for (var i = 0; i < aUniqueList.length; i++) {
					sId = aUniqueList[i];
					oElement = sap.ui.getCore().getComponent(sId);
					if (!oElement instanceof sap.ui.core.Component) {
						continue;
					}
					if (oElement.getManifest) {
						var oManifest = oElement.getManifest();
						if (!oManifest) {
							continue;
						}
					}
					var oUI5Namespace = oManifest["sap.ui5"];
					if (!oUI5Namespace) {
						continue;
					}
					var oDependencies = oUI5Namespace.dependencies;
					if (!oDependencies) {
						continue;
					}
					for (var sLibraryName in oDependencies.libs){
						if (sLibraryName === "sap.ca.scfld.md") {
							oIssueManager.addIssue({
								severity : sap.ui.support.Severity.Warning,
								details : "Application '" + oElement.getId() + "is scaffolding based ",
								context : {
									id : oElement.getId()
								}
							});
						}
					}
				}
			}
		});
	}
};
}, true);