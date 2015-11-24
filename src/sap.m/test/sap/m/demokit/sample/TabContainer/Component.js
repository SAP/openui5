jQuery.sap.declare("sap.m.sample.TabContainer.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TabContainer.Component", {

	metadata : {
		rootView : "sap.m.sample.TabContainer.TabContainer",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				files : [
					"TabContainer.view.xml",
					"TabContainer.controller.js"
				]
			}
		}
	}
});
