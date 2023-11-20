sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";
	return UIComponent.extend("routing.scenario1.nested.Component", {
		metadata : {
			manifest: "json",
			properties: {
				nickname: { type: "string" }
			}
		}
	});
});
