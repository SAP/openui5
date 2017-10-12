jQuery.sap.declare("sap.ui.codeeditor.sample.CodeEditorIconTabHeader.Component");

sap.ui.core.UIComponent.extend("sap.ui.codeeditor.sample.CodeEditorIconTabHeader.Component", {

	metadata: {
		rootView: "sap.ui.codeeditor.sample.CodeEditorIconTabHeader.CodeEditor",
		dependencies: {
			libs: [ "sap.ui.codeeditor"]
		},
		config: {
			sample: {
				stretch: true,
				files: [
					"CodeEditor.view.xml",
					"CodeEditor.controller.js"
				]
			}
		}
	}
});