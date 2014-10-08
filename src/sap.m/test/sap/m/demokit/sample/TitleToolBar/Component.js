jQuery.sap.declare("sap.m.sample.TitleToolBar.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TitleToolBar.Component", {

	metadata : {
		rootView : "sap.m.sample.TitleToolBar.Toolbar",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				stretch : true,
				files : [
					"Toolbar.view.xml"
				]
			}
		}
	}
});