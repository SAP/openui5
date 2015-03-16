jQuery.sap.declare("sap.m.sample.P13nDialogWithCustomPanel.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.P13nDialogWithCustomPanel.Component", {

	metadata: {
		rootView: "sap.m.sample.P13nDialogWithCustomPanel.Page",
		dependencies: {
			libs: [
				"sap.m", "sap.ui.layout"
			]
		},
		config: {
			sample: {
				files: [
					"Page.view.xml", "Page.controller.js", "CustomPanel.js", "PersonalizationDialog.fragment.xml", "products.json"
				]
			}
		}
	}
});
