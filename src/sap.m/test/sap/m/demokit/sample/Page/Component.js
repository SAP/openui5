jQuery.sap.declare("sap.m.sample.Page.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Page.Component", {

	metadata : {
		rootView : "sap.m.sample.Page.Page",
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