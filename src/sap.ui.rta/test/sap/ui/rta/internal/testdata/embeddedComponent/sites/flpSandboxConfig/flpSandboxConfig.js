(() => {
	"use strict";
	window["sap-ushell-config"] = {

		defaultRenderer: "fiori2",

		bootstrapPlugins: {
			RuntimeAuthoringPlugin: {
				component: "sap.ushell.plugins.rta"
			}
		},
		renderers: {
			fiori2: {
				componentData: {
					config: {
						enableMergeAppAndShellHeaders: true,
						search: "hidden"
					}
				}
			}
		},
		applications: {
			"masterDetail-display": {
				additionalInformation: "SAPUI5.Component=sap.ui.rta.test.embeddedComponent",
				applicationType: "URL",
				url: "../",
				description: "Embedded Component Test App",
				title: "UI Flexibility",
				applicationDependencies: {
					self: { name: "sap.ui.rta.test.embeddedComponent" },
					manifest: true,
					asyncHints: {
						libs: [
							{ name: "sap.ui.core" },
							{ name: "sap.m" },
							{ name: "sap.ui.dt" },
							{ name: "sap.ui.rta" },
							{ name: "sap.ui.layout" },
							{ name: "sap.ui.comp" }
						]
					}
				}
			}
		},
		services: {
			EndUserFeedback: {
				adapter: {
					config: {
						enabled: true
					}
				}
			}
		}
	};
})();

