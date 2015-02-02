jQuery.sap.declare("sap.m.sample.ListCounter.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ListCounter.Component", {

	metadata : {
		rootView : "sap.m.sample.ListCounter.List",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				files : [
					"List.view.xml",
					"List.controller.js"
				]
			}
		}
	}
});
