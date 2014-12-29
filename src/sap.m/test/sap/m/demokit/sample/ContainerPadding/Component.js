jQuery.sap.declare("sap.m.sample.ContainerPadding.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ContainerPadding.Component", {

	metadata : {
		rootView : "sap.m.sample.ContainerPadding.Page",
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
					"Page.view.xml",
					"Page.controller.js",
					"Dialog.fragment.xml"
				]
			}
		}
	}
});