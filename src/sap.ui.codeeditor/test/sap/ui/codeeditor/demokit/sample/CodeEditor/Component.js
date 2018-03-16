jQuery.sap.declare("sap.ui.codeeditor.sample.CodeEditor.Component");

sap.ui.core.UIComponent.extend("sap.ui.codeeditor.sample.CodeEditor.Component", {

	metadata: {
		rootView: {
			"viewName": "sap.ui.codeeditor.sample.CodeEditor.CodeEditor",
			"type": "XML",
			"async": true
		},
		dependencies: {
			libs: [ "sap.ui.codeeditor"]
		},
		config: {
			sample: {
				stretch: true,
				files: [
					"CodeEditor.view.xml"
				]
			}
		}
	}
});