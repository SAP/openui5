jQuery.sap.declare("sap.m.sample.Link.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Link.Component", {

	metadata : {
		rootView : "sap.m.sample.Link.LinkGroup",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"LinkGroup.view.xml",
					"LinkGroup.controller.js"
				]
			}
		}
	}
});