jQuery.sap.declare("sap.ui.core.sample.OpaDynamicWait.Component");

sap.ui.core.UIComponent.extend("sap.ui.core.sample.OpaDynamicWait.Component", {

	metadata : {
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.commons"
			]
		},
		config : {
			sample : {
				iframe : "Opa.html",
				stretch : true,
				files : [
					"Opa.html",
					"applicationUnderTest/view/Main.view.xml",
					"applicationUnderTest/index.html",
					"applicationUnderTest/Component.js"
				]
			}
		}
	}

});