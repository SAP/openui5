jQuery.sap.declare("sap.m.sample.SelectList.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.SelectList.Component", {

	metadata : {
		rootView : "sap.m.sample.SelectList.Page",
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