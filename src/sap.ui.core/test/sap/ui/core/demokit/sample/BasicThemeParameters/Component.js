jQuery.sap.declare("sap.ui.core.sample.BasicThemeParameters.Component");

sap.ui.core.UIComponent.extend("sap.ui.core.sample.BasicThemeParameters.Component", {

	metadata : {
		rootView : "sap.ui.core.sample.BasicThemeParameters.BasicThemeParameters",
		dependencies : {
			libs : [
				"sap.ui.core"
			]
		},
		config : {
			sample : {
				stretch : false,
				files : [
					"BasicThemeParameters.view.xml",
					"BasicThemeParameters.controller.js",
					"parameters.json"
				]
			}
		}
	}
});