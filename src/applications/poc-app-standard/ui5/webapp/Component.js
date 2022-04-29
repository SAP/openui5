sap.ui.define(["sap/ui/core/library", "sap/ui/core/UIComponent", "sap/ui/core/ComponentSupport"], function(library, UIComponent) {
	"use strict";
	return UIComponent.extend("sap.ui.demo.todo.Component", {
		metadata: {
			manifest: "json",
			interfaces: [library.IAsyncContentCreation]
		}
	});
});
