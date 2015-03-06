jQuery.sap.declare("sap.m.sample.SemanticPage.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.SemanticPage.Component", {

	metadata : {
		rootView : "sap.m.sample.SemanticPage.Page",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				stretch : true,
				files : [
					"Page.view.xml",
					"Page.controller.js",
					"sort.json"
				]
			}
		}
	}
});
