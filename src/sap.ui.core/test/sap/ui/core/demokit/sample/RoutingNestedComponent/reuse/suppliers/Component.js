sap.ui.define(["sap/ui/demo/routing/nested/base/BaseComponent"], function(BaseComponent) {
	"use strict";

	return BaseComponent.extend("sap.ui.demo.routing.nested.reuse.suppliers.Component", {
		metadata: {
			manifest: "json"
		},
		eventMappings: {
			productsComponent: [{
				name: "toProduct",
				forward: "toProduct"
			}]
		}
	});
});
