jQuery.sap.declare("sap.ui.unified.sample.MenuMenuEventing.Component");

sap.ui.core.UIComponent.extend("sap.ui.unified.sample.MenuMenuEventing.Component", {

	metadata : {
		rootView : "sap.ui.unified.sample.MenuMenuEventing.MenuMenuEventing",
		dependencies : {
			libs : [
				"sap.ui.unified"
			]
		},
		
		config : {
			sample : {
				files : [
					"MenuMenuEventing.view.xml",
					"MenuMenuEventing.fragment.xml",
					"MenuMenuEventing.controller.js"
				]
			}
		}
	}
});