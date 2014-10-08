jQuery.sap.declare("sap.m.sample.LinkSubtle.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.LinkSubtle.Component", {

	metadata : {
		rootView : "sap.m.sample.LinkSubtle.Link",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				files : [
					"Link.view.xml",
					"Link.controller.js"
				]
			}
		}
	}
});