jQuery.sap.declare("sap.m.sample.TabContainer.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TabContainer.Component", {

	metadata : {
		rootView : {
			"viewName": "sap.m.sample.TabContainer.TabContainer",
			"type": "XML",
			"async": true
		},
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
