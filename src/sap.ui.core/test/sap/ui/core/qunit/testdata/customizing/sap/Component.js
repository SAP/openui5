jQuery.sap.declare("testdata.customizing.sap.Component");
jQuery.sap.require("sap.ui.core.UIComponent");

sap.ui.core.UIComponent.extend("testdata.customizing.sap.Component", {

	metadata : {
		version : "1.0",
		rootView : {
			viewName: "testdata.customizing.sap.Main",
			type: "XML",
			id: "mainView"
		}
	}

});

