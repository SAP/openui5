sap.ui.define(["sap/ui/core/UIComponent"], function(UIComponent) {
	"use strict";

	return UIComponent.extend("testdata.extensionPoints.Component", {
		metadata : {
			interfaces: ["sap.ui.core.IAsyncContentCreation"]
		}
	});
});
