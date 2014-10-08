jQuery.sap.declare("sap.ui.unified.sample.ShellBasic.Component");

sap.ui.core.UIComponent.extend("sap.ui.unified.sample.ShellBasic.Component", {

	metadata : {
		rootView : "sap.ui.unified.sample.ShellBasic.View",
		dependencies : {
			libs : [
				"sap.ui.unified",
				"sap.ui.layout",
				"sap.m"
			]
		},
		includes : [
		            "style.css"
		          ],
		config : {
			sample : {
				files : [
					"View.view.xml",
					"Controller.controller.js",
					"ShellOverlay.fragment.xml"
				]
			}
		}
	}
});