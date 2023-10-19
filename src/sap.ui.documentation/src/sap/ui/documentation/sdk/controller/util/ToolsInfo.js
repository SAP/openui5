/*!
 * ${copyright}
 */

// Provides information about 'tools'.
sap.ui.define([],
	function () {
		"use strict";

		var aTools = [
			{
				"id": "uiThemeDesigner",
				"text": "UI Theme Designer",
				"href": "https://www.sap.com/community/topics/ui-theme-designer.html"
			},
			{
				"id": "businessApplicationStudio",
				"text": "SAP Business Application Studio",
				"href": "http://www.sap.com/appstudio"
			},
			{
				"id": "ui5Tooling",
				"text": "UI5 Tooling",
				"href": "https://github.com/SAP/ui5-tooling"
			},
			{
				"id": "ui5Inspector",
				"text": "UI5 Inspector",
				"href": "https://github.com/SAP/ui5-inspector"
			},
			{
				"id": "cardExplorer",
				"text": "Card Explorer",
				"href": "test-resources/sap/ui/integration/demokit/cardExplorer/index.html"
			},
			{
				"id": "supportAssistant",
				"text": "Support Assistant",
				"href": "topic/57ccd7d7103640e3a187ed55e1d2c163"
			},
			{
				"id": "iconExplorer",
				"text": "Icon Explorer",
				"href": "test-resources/sap/m/demokit/iconExplorer/webapp/index.html"
			},
			{
				"id": "themeParameterToolbox",
				"text": "Theme Parameter Toolbox",
				"href": "test-resources/sap/m/demokit/theming/webapp/index.html"
			},
			{
				"id": "ui5WebComponents",
				"text": "UI5 Web Components",
				"href": "https://sap.github.io/ui5-webcomponents/"
			},
			{
				"id": "liveEditor",
				"text": "Live Editor",
				"href": "liveEditor",
				"hideOnPhone": true
			},
			{
				"id": "fioriTools",
				"text": "SAP Fiori Tools",
				"href": "https://help.sap.com/viewer/product/SAP_FIORI_tools/Latest/en-US"
			},
			{
				"id": "flexibleProgrammingModelExplorer",
				"text": "Flexible Programming Model Explorer",
				"href": "test-resources/sap/fe/core/fpmExplorer/index.html#/overview/introduction",
				"isDistributionScope": true,
				"hideOnPhone": true
			},
			{
				"id": "accessibilityGuide",
				"text": "Accessibility Guide",
				"href": "test-resources/sap/m/demokit/accessibilityGuide/webapp/index.html",
				"hideOnPhone": true
			},
			{
				"id": "ui5TestRecorder",
				"text": "Test Recorder",
				"href": "topic/2535ef9272064cb6bd6b44e5402d531d",
				"hideOnPhone": true
			}
		];

		return {
			getToolsConfig: function () {
				// return promise to be consistent with other resource utils
				return Promise.resolve(aTools);
			}
		};

	}, /* bExport= */ true);
