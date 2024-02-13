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
			"href": "test-resources/sap/m/demokit/iconExplorer/webapp/index.html",
			"viewDocHref": "topic/21ea0ea94614480d9a910b2e93431291",
			"runUnitTestsHref": "test-resources/sap/m/demokit/iconExplorer/webapp/test/unit/unitTests.qunit.html"
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
			"href": "https://sap.github.io/ui5-tooling/stable",
			"gettingStartedHref": "https://sap.github.io/ui5-tooling/stable/pages/GettingStarted",
			"cliDocHref": "https://sap.github.io/ui5-tooling/stable/pages/CLI"
		},
		{
			"id": "fioriTools",
			"text": "SAP Fiori tools",
			"href": "https://help.sap.com/viewer/product/SAP_FIORI_tools/Latest/en-US",
			"viewDocHref": "https://help.sap.com/viewer/17d50220bcd848aa854c9c182d65b699/Latest/en-US"
		},
		{
			"id": "cardExplorer",
			"text": "Card Explorer",
			"href": "test-resources/sap/ui/integration/demokit/cardExplorer/index.html",
			"viewDocHref": "test-resources/sap/ui/integration/demokit/cardExplorer/webapp/index.html",
			"samplesHref": "test-resources/sap/ui/integration/demokit/cardExplorer/webapp/index.html#/explore/list"
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
			"href": "https://www.sap.com/appstudio",
			"viewDocHref": "https://help.sap.com/docs/bas"
		},

		// #3 Category: Customising
		{
			"id": "themeDesigner",
			"text": "UI Theme Designer",
			"href": "https://www.sap.com/community/topics/ui-theme-designer.html",
			"viewDocHref": "https://help.sap.com/docs/btp/ui-theme-designer/ui-theme-designer"
		},
		{
			"id": "themeParameterToolbox",
			"text": "Theme Parameter Toolbox",
			"href": "test-resources/sap/m/demokit/theming/webapp/index.html"
		},
		{
			"id": "flexibility",
			"text": "SAPUI5 Flexibility",
			"href": "topic/a8e55aa2f8bc4127923b20685a6d1621"
		},

		// #4 Category: Troubleshooting
		{
			"id": "inspector",
			"text": "UI5 Inspector",
			"href": "https://sap.github.io/ui5-inspector/",
			"viewDocHref": "topic/b24e72443eb34d0fb7bf6940f2d697eb",
			"viewSourceHref": "https://github.com/SAP/ui5-inspector"
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
			"text": "WebdriverIO for UI5",
			"href": "https://ui5-community.github.io/wdi5/#/",
			"gettingStartedHref": "https://ui5-community.github.io/wdi5/#/installation"
		}
	];

	return {
		getResourcesConfig: function () {
			// return promise to be consistent with other resource utils
			return Promise.resolve(aResources);
		}
	};

});
