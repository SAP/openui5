/*!
 * ${copyright}
 */

// Provides information about 'resources'.
sap.ui.define([], function () {
	"use strict";

	var aResources = [
		// #1 Category: Featured
		{
			"id": "iconExplorer",
			"text": "Icon Explorer",
			"href": "test-resources/sap/m/demokit/iconExplorer/webapp/index.html"
		},
		{
			"id": "accessibilityGuide",
			"text": "Accessibility Guide",
			"href": "test-resources/sap/m/demokit/accessibilityGuide/webapp/index.html",
			"hideOnPhone": true
		},

		// #2 Category: Development Tools
		{
			"id": "tooling",
			"text": "UI5 Tooling",
			"href": "https://sap.github.io/ui5-tooling/"
		},
		{
			"id": "fioriTools",
			"text": "SAP Fiori tools",
			"href": "https://help.sap.com/docs/SAP_FIORI_tools"
		},
		{
			"id": "cardExplorer",
			"text": "Card Explorer",
			"href": "test-resources/sap/ui/integration/demokit/cardExplorer/index.html"
		},
		{
			"id": "linter",
			"text": "UI5 linter",
			"href": "https://github.com/SAP/ui5-linter"
		},
		{
			"id": "fpmExplorer",
			"text": "Flexible Programming Model Explorer",
			"href": "test-resources/sap/fe/core/fpmExplorer/index.html#/overview/introduction",
			"isDistributionScope": true,
			"hideOnPhone": true
		},
		{
			"id": "businessAppStudio",
			"text": "SAP Business Application Studio",
			"href": "https://pages.community.sap.com/topics/business-application-studio"
		},

		// #3 Category: Customising
		{
			"id": "themeDesigner",
			"text": "UI Theme Designer",
			"href": "https://pages.community.sap.com/topics/ui-theme-designer"
		},
		{
			"id": "themeParameterToolbox",
			"text": "Theme Parameter Toolbox",
			"href": "test-resources/sap/m/demokit/theming/webapp/index.html"
		},
		{
			"id": "flexibility",
			"text": "SAPUI5 Flexibility",
			"href": "https://help.sap.com/docs/UI5_FLEXIBILITY"
		},

		// #4 Category: Troubleshooting
		{
			"id": "inspector",
			"text": "UI5 Inspector",
			"href": "https://sap.github.io/ui5-inspector/"
		},
		{
			"id": "supportAssistant",
			"text": "Support Assistant",
			"href": "topic/57ccd7d7103640e3a187ed55e1d2c163"
		},

		// #5 Category: Testing
		{
			"id": "testRecorder",
			"text": "Test Recorder",
			"href": "topic/2535ef9272064cb6bd6b44e5402d531d",
			"hideOnPhone": true
		},
		{
			"id": "wdi5",
			"text": "wdi5",
			"href": "https://ui5-community.github.io/wdi5/#/"
		}
	];

	return {
		getResourcesConfig: function () {
			// return promise to be consistent with other resource utils
			return Promise.resolve(aResources);
		}
	};

});
