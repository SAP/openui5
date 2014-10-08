jQuery.sap.declare("sap.m.sample.PullToRefresh.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.PullToRefresh.Component", {

	metadata : {
		rootView : "sap.m.sample.PullToRefresh.Page",
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