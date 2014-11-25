jQuery.sap.declare("sap.m.sample.StandardNoMargins.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.StandardNoMargins.Component", {

	metadata : {
		rootView : "sap.m.sample.StandardNoMargins.Page",
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