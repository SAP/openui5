jQuery.sap.declare("sap.m.sample.SearchField.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.SearchField.Component", {

	metadata : {
		rootView : "sap.m.sample.SearchField.Page",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
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