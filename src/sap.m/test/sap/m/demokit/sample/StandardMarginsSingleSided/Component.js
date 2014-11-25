jQuery.sap.declare("sap.m.sample.StandardMarginsSingleSided.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.StandardMarginsSingleSided.Component", {

	metadata : {
		rootView : "sap.m.sample.StandardMarginsSingleSided.Page",
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