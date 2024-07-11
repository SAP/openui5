sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"storyId": {
						"manifestpath": "/sap.card/content/widget/storyId",
						"type": "string",
						"label": "Story ID"
					},
					"widgetId": {
						"manifestpath": "/sap.card/content/widget/widgetId",
						"type": "string",
						"label": "Widget ID"
					},
					"minHeight": {
						"manifestpath": "/sap.card/content/minHeight",
						"type": "string",
						"label": "Minimum Height"
					},
					"enableInteraction": {
						"manifestpath": "/sap.card/content/options/attributes/enableInteraction",
						"label": "Enable Interaction",
						"description": "Controls whether or not user interaction is allowed in chart.",
						"type": "boolean"
					},
					"enableUndoRedo": {
						"manifestpath": "/sap.card/content/options/attributes/enableUndoRedo",
						"label": "Enable Undo/Redo",
						"description": "Controls whether or not undo/redo is allowed in chart.",
						"type": "boolean"
					},
					"enableMenus": {
						"manifestpath": "/sap.card/content/options/attributes/enableMenus",
						"label": "Enable Menus",
						"description": "Controls whether widget context menu and datapoint content menus are enabled or not.",
						"type": "boolean"
					},
					"showHeader": {
						"manifestpath": "/sap.card/content/options/attributes/showHeader",
						"label": "Show Header",
						"description": "Controls whether chart header should be shown or not.",
						"type": "boolean"
					},
					"showFooter": {
						"manifestpath": "/sap.card/content/options/attributes/showFooter",
						"label": "Show Footer",
						"description": "Controls whether chart footer should be shown or not.",
						"type": "boolean"
					}
				}
			},
			"preview": {
				"modes": "LiveAbstract"
			}
		});
	};
});
