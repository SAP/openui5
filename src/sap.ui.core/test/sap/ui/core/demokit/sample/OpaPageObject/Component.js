jQuery.sap.declare("sap.ui.core.sample.OpaPageObject.Component");

sap.ui.core.UIComponent.extend("sap.ui.core.sample.OpaPageObject.Component", {

	metadata : {
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				iframe : "OpaPageObject.html",
				stretch : true,
				files : [
					"OpaPageObject.html",
					"pageObjects/Intro.js",
					"pageObjects/Overview.js",
					"pageObjects/Common.js",
					"pageObjects/TestPage1.js",
					"pageObjects/TestPage2.js",
					"arrangements/Common.js",
					"applicationUnderTest/view/Main.view.xml",
					"applicationUnderTest/view/Main.controller.js",
					"applicationUnderTest/index.html",
					"applicationUnderTest/Component.js"
				]
			}
		}
	}

});