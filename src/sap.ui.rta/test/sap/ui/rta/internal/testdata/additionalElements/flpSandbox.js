window["sap-ushell-config"] = {

	defaultRenderer : "fiori2",

	bootstrapPlugins: {
		"RuntimeAuthoringPlugin" : {
			"component": "sap.ushell.plugins.rta"
		},
		"PersonalizePlugin": {
			"component": "sap.ushell.plugins.rta-personalize"
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
			"additionalInformation": "SAPUI5.Component=sap.ui.rta.test.additionalElements",
			"applicationType": "URL",
			"url": "./",
			"description": "Additional Elements Test App",
			"title": "UI Flexibility",
			"applicationDependencies": {
				"self": { name: "sap.ui.rta.test.additionalElements" },
				"manifest": true,
				"asyncHints": {
					"libs": [
						{ "name": "sap.ui.core" },
						{ "name": "sap.m" },
						{ "name": "sap.ui.dt" },
						{ "name": "sap.ui.rta" },
						{ "name": "sap.ui.layout" },
						{ "name": "sap.ui.comp" },
						{ "name": "sap.uxap" }
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

var __sPathPrefix = document.location.pathname.match(/(.*)\/test-resources\//)[1];

document.write('<script src="' + __sPathPrefix + '/resources/sap/ushell/bootstrap/sandbox2.js" id="sap-ushell-bootstrap"><' + '/script>');

document.write('\
	<script \
		id="sap-ui-bootstrap" \
		data-sap-ui-theme="sap_horizon" \
		data-sap-ui-language="en" \
		data-sap-ui-noConflict="true" \
		data-sap-ui-async="true" \
		data-sap-ui-libs="sap.m, sap.ushell, sap.ui.rta" \
		data-sap-ui-xx-bindingSyntax="complex" \
		data-sap-ui-flexibilityServices=\'[{"connector": "LocalStorageConnector"}]\' \
		data-sap-ui-resourceroots=\'{"flpSandboxConfig": "./flpSandboxConfig"}\'\
		data-sap-ui-oninit="module:flpSandboxConfig/appStart" \
		src="' +
	document.location.pathname.match(/(.*)\/test-resources\//)[1] + '/resources/sap-ui-core.js" \
	><' + '/script>'
);