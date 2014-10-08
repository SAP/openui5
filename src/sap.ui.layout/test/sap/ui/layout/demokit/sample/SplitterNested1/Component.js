jQuery.sap.declare("sap.ui.layout.sample.SplitterNested1.Component");

sap.ui.core.UIComponent.extend("sap.ui.layout.sample.SplitterNested1.Component", {

	metadata : {
		rootView : "sap.ui.layout.sample.SplitterNested1.Splitter",
		dependencies : {
			libs : [
				"sap.ui.commons",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"Splitter.view.xml",
					"Splitter.controller.js"
				]
			}
		}
	}
});