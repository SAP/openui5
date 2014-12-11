jQuery.sap.declare("sap.m.sample.StandardMarginsAll.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.StandardMarginsAll.Component", {

	metadata : {
		rootView : "sap.m.sample.StandardMarginsAll.Page",
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