jQuery.sap.declare("samples.components.ext.sap.Component");
jQuery.sap.require("sap.ui.core.UIComponent");

sap.ui.core.UIComponent.extend("samples.components.ext.sap.Component", {

	metadata : {
		version : "1.0",
		rootView : {
			viewName: "samples.components.ext.sap.Main",
			type: "XML"
		},
		config : {
			"myConfig": {
				"key1": "value1"
			}
		}
	}

});

