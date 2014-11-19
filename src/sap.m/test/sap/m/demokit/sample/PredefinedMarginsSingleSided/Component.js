jQuery.sap.declare("sap.m.sample.PredefinedMarginssingleSided.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.PredefinedMarginsSingleSided.Component", {

	metadata : {
		rootView : "sap.m.sample.PredefinedMarginsSingleSided.Page",
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