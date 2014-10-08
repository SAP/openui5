jQuery.sap.declare("sap.ui.layout.sample.FixFlexFixedSize.Component");

sap.ui.core.UIComponent.extend("sap.ui.layout.sample.FixFlexFixedSize.Component", {

	metadata : {
		rootView : "sap.ui.layout.sample.FixFlexFixedSize.V",
		dependencies : {
			libs : [
				"sap.ui.layout",
				"sap.m"
			]
		},
		includes : [ "FixFlexFixedSize/style.css" ],
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