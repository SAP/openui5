jQuery.sap.declare("sap.m.sample.ObjectHeaderResponsiveIII.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ObjectHeaderResponsiveIII.Component", {

	metadata : {
		rootView : "sap.m.sample.ObjectHeaderResponsiveIII.Page",
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
					"Page.controller.js"
				]
			}
		}
	}
});