(() => {
	"use strict";
	window["sap-ushell-config"] = {

		defaultRenderer: "fiori2",

		bootstrapPlugins: {
			RuntimeAuthoringPlugin: {
				component: "sap.ushell.plugins.rta"
			},
			PersonalizePlugin: {
				component: "sap.ushell.plugins.rta-personalize"
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
				additionalInformation: "SAPUI5.Component=sap.ui.rta.test.variantManagement",
				applicationType: "URL",
				url: "../",
				description: "Variant Management Test App",
				title: "UI Flexibility",
				applicationDependencies: {
					self: { name: "sap.ui.rta.test.variantManagement" },
					manifest: true,
					asyncHints: {
						libs: [
							{ name: "sap.ui.core" },
							{ name: "sap.m" },
							{ name: "sap.ui.dt" },
							{ name: "sap.ui.rta" },
							{ name: "sap.ui.layout" },
							{ name: "sap.ui.comp" },
							{ name: "sap.uxap" }
						]
					}
				}
			}
		},
		services: {
			NavTargetResolution: {
				config: {
					allowTestUrlComponentConfig: true,
					enableClientSideTargetResolution: true
				}
			},
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
