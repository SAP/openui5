jQuery.sap.declare("sap.ui.codeeditor.sample.CodeEditor.Component");

sap.ui.core.UIComponent.extend("sap.ui.codeeditor.sample.CodeEditor.Component", {

	metadata: {
		rootView: "sap.ui.codeeditor.sample.CodeEditor.CodeEditor",
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