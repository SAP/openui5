jQuery.sap.declare("sap.m.sample.ScrollContainer.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ScrollContainer.Component", {

	metadata : {
		rootView : "sap.m.sample.ScrollContainer.ScrollContainer",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				stretch : true,
				files : [
					"ScrollContainer.view.xml",
					"ScrollContainer.controller.js"
				]
			}
		}
	}
});