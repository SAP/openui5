sap.ui.define(['sap/ui/core/UIComponent'], function(UIComponent) {
	"use strict";
	return UIComponent.extend("test1.Component", {
		metadata : {
			includes : [ "style1.css" ]
		}
	});
}, true);
