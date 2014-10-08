jQuery.sap.declare("sap.ui.core.sample.OpaReuse.Component");

sap.ui.core.UIComponent.extend("sap.ui.core.sample.OpaReuse.Component", {

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
					"action/Common.js",
					"action/TestPage1.js",
					"action/TestPage2.js",
					"arrangement/Common.js",
					"assertion/TestPage1.js",
					"assertion/TestPage2.js",
					"applicationUnderTest/view/Main.view.xml",
					"applicationUnderTest/view/Main.controller.js",
					"applicationUnderTest/index.html",
					"applicationUnderTest/Component.js"
				]
			}
		}
	}

});