jQuery.sap.declare("sap.m.sample.StandardMarginsCollapse.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.StandardMarginsCollapse.Component", {

	metadata : {
		rootView : "sap.m.sample.StandardMarginsCollapse.Page",
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