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
				"text": "UI Theme Designer"
			},
			{
				"id": "businessApplicationStudio",
				"text": "Business Application Studio",
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
				"href": "https://chrome.google.com/webstore/detail/ui5-inspector/bebecogbafbighhaildooiibipcnbngo?hl=en"
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
			}
		];

		return {
			getToolsConfig: function () {
				// return promise to be consistent with other resource utils
				return Promise.resolve(aTools);
			}
		};

	}, /* bExport= */ true);