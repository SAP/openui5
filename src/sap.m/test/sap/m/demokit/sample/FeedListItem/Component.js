jQuery.sap.declare("sap.m.sample.FeedListItem.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.FeedListItem.Component", {

	metadata : {
		rootView : "sap.m.sample.FeedListItem.List",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
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