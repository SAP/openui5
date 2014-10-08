jQuery.sap.declare("sap.ui.layout.sample.FixFlexInFixFlex.Component");

sap.ui.core.UIComponent.extend("sap.ui.layout.sample.FixFlexInFixFlex.Component", {

	metadata : {
		rootView : "sap.ui.layout.sample.FixFlexInFixFlex.V",
		dependencies : {
			libs : [
			    "sap.ui.layout",
				"sap.m"
			]
		},
		includes : [ "FixFlexInFixFlex/style.css" ],
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