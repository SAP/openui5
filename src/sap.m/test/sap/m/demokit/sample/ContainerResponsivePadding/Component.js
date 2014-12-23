jQuery.sap.declare("sap.m.sample.ContainerResponsivePadding.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ContainerResponsivePadding.Component", {

	metadata : {
		rootView : "sap.m.sample.ContainerResponsivePadding.Page",
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