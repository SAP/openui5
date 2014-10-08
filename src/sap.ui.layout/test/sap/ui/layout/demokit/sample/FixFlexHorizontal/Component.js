jQuery.sap.declare("sap.ui.layout.sample.FixFlexHorizontal.Component");

sap.ui.core.UIComponent.extend("sap.ui.layout.sample.FixFlexHorizontal.Component", {

	metadata : {
		rootView : "sap.ui.layout.sample.FixFlexHorizontal.V",
		dependencies : {
			libs : [
			    "sap.ui.layout",
				"sap.m"
			]
		},
		includes : [ "FixFlexHorizontal/style.css" ],
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