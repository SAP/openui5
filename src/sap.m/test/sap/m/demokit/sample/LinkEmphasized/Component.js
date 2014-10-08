jQuery.sap.declare("sap.m.sample.LinkEmphasized.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.LinkEmphasized.Component", {

	metadata : {
		rootView : "sap.m.sample.LinkEmphasized.Link",
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