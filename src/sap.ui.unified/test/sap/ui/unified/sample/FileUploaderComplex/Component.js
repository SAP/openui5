jQuery.sap.declare("sap.ui.unified.sample.FileUploaderComplex.Component");

sap.ui.core.UIComponent.extend("sap.ui.unified.sample.FileUploaderComplex.Component", {

	metadata : {
		rootView : "sap.ui.unified.sample.FileUploaderComplex.View",
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