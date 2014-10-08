jQuery.sap.declare("sap.m.sample.FeedInput.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.FeedInput.Component", {

	metadata : {
		rootView : "sap.m.sample.FeedInput.V",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		includes : [ "FeedInput/style.css" ],
		config : {
			sample : {
				files : [
					"V.view.xml",
					"C.controller.js",
					"style.css"
				]
			}
		}
	}
});