jQuery.sap.declare("sap.ui.layout.sample.FixFlexVertical.Component");

sap.ui.core.UIComponent.extend("sap.ui.layout.sample.FixFlexVertical.Component", {

	metadata : {
		rootView : "sap.ui.layout.sample.FixFlexVertical.V",
		dependencies : {
			libs : [
			    "sap.ui.layout",
				"sap.m"
			]
		},
		includes : [ "FixFlexVertical/style.css" ],
		config : {
			sample : {
				stretch : true,
				files : [
					"V.view.xml",
					"style.css"
				]
			}
		}
	}
});