sap.ui.define(['jquery.sap.global', 'sap/ui/core/UIComponent'],
	function(jQuery, UIComponent) {
	"use strict";


	var Component = UIComponent.extend("testdata.customizing.sap.Component", {

		metadata : {
			version : "1.0",
			rootView : {
				viewName: "testdata.customizing.sap.Main",
				type: "XML",
				id: "mainView"
			}
		}

	});



	return Component;

});
