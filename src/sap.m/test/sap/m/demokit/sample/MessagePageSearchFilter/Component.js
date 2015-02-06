jQuery.sap.declare("sap.m.sample.MessagePageSearchFilter.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.MessagePageSearchFilter.Component", {

	metadata : {
		rootView : "sap.m.sample.MessagePageSearchFilter.Page",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				stretch : true,
				files : [
					"Page.view.xml",
					"Page.controller.js",
					"Master.controller.js",
					"Master.view.xml",
					"Detail.view.xml",
					"Empty.view.xml"
				]
			}
		}
	}
});
