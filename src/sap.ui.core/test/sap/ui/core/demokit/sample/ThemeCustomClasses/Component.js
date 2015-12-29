jQuery.sap.declare("sap.ui.core.sample.ThemeCustomClasses.Component");

sap.ui.core.UIComponent.extend("sap.ui.core.sample.ThemeCustomClasses.Component", {

	metadata : {
		rootView : "sap.ui.core.sample.ThemeCustomClasses.ThemeCustomClasses",
		dependencies : {
			libs : [
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				stretch : false,
				files : [
					"ThemeCustomClasses.view.xml",
					"ThemeCustomClasses.controller.js"
				]
			}
		}
	}
});