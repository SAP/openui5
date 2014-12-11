jQuery.sap.declare("sap.m.sample.PageStandardClasses.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.PageStandardClasses.Component", {

	metadata : {
		rootView : "sap.m.sample.PageStandardClasses.Page",
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