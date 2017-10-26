jQuery.sap.declare("sap.m.sample.P13nDialogWithCustomPanel.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.P13nDialogWithCustomPanel.Component", {

	metadata: {
		rootView: {
			"viewName": "sap.m.sample.P13nDialogWithCustomPanel.Page",
			"type": "XML",
			"async": true
		},
		dependencies: {
			libs: [
				"sap.m", "sap.ui.layout"
			]
		},
		config: {
			sample: {
				files: [
					"Page.view.xml", "Page.controller.js", "CustomPanel.js", "PersonalizationDialog.fragment.xml"
				]
			}
		}
	}
});
