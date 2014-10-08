jQuery.sap.declare("sap.ui.core.sample.OpaById.Component");

sap.ui.core.UIComponent.extend("sap.ui.core.sample.OpaById.Component", {

	metadata : {
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				iframe : "Opa.html",
				stretch : true,
				files : [
					"Opa.html",
					"applicationUnderTest/view/Main.view.xml",
					"applicationUnderTest/view/Main.controller.js",
					"applicationUnderTest/index.html",
					"applicationUnderTest/Component.js"
				]
			}
		}
	}

});