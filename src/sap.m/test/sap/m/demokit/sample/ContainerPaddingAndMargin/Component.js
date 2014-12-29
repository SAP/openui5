jQuery.sap.declare("sap.m.sample.ContainerPaddingAndMargin.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ContainerPaddingAndMargin.Component", {

	metadata : {
		rootView : "sap.m.sample.ContainerPaddingAndMargin.Page",
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