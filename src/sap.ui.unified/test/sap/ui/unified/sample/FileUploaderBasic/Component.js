jQuery.sap.declare("sap.ui.unified.sample.FileUploaderBasic.Component");

sap.ui.core.UIComponent.extend("sap.ui.unified.sample.FileUploaderBasic.Component", {

	metadata : {
		rootView : "sap.ui.unified.sample.FileUploaderBasic.View",
		dependencies : {
			libs : [
				"sap.ui.unified"
			]
		},
		includes : [
		           	"style.css"
		          ],
		config : {
			sample : {
				files : [
					"View.view.xml",
					"Controller.controller.js"
				]
			}
		}
	}
});