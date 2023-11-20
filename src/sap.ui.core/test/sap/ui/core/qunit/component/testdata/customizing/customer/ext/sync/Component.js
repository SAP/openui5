sap.ui.define(['sap/ui/core/UIComponent'],
	function(Component1) {
	"use strict";

	var Component = Component1.extend("testdata.customizing.customer.Component", {
		metadata : {
			version : "1.0",
			rootView : {
				viewName: "testdata.customizing.customer.ext.sync.Main",
				type: "XML",
				id: "mainView",
				async: false
			},
			customizing: {
			}
		}
	});

	return Component;
});
