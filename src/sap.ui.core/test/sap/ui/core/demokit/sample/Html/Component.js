jQuery.sap.declare("sap.ui.core.sample.Html.Component");

sap.ui.core.UIComponent.extend("sap.ui.core.sample.Html.Component", {

	metadata : {
		rootView : "sap.ui.core.sample.Html.Html",
		dependencies : {
			libs : [
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				stretch : true,
				files : [
					"Html.view.xml"
				]
			}
		}
	}
});