jQuery.sap.declare("sap.m.sample.Feed.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Feed.Component", {

	metadata : {
		rootView : "sap.m.sample.Feed.V",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
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