jQuery.sap.declare("sap.m.sample.ContainerNoPadding.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ContainerNoPadding.Component", {

	metadata : {
		rootView : "sap.m.sample.ContainerNoPadding.Page",
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
					"Page.controller.js"
				]
			}
		}
	}
});