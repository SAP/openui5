jQuery.sap.declare("sap.ui.core.sample.OpaMatchers.Component");

sap.ui.core.UIComponent.extend("sap.ui.core.sample.OpaMatchers.Component", {

	metadata : {
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				iframe : "OpaMatchers.html",
				stretch : true,
				files : [
					"OpaMatchers.html",
					"applicationUnderTest/view/Main.view.xml",
					"applicationUnderTest/view/Main.controller.js",
					"applicationUnderTest/index.html",
					"applicationUnderTest/Component.js"
				]
			}
		}
	}

});