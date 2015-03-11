Query.sap.declare("sap.m.sample.SemanticPageFullScreen.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.SemanticPageFullScreen.Component", {

	metadata : {
		rootView : "sap.m.sample.SemanticPageFullScreen.Page",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				stretch : true,
				files : [
					"Page.view.xml"
				]
			}
		}
	}
});
