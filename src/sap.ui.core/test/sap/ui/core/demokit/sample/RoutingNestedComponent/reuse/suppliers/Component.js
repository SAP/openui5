sap.ui.define([
	"sap/ui/core/sample/RoutingNestedComponent/base/BaseComponent"
], function(BaseComponent) {
	"use strict";

	return BaseComponent.extend("sap.ui.core.sample.RoutingNestedComponent.reuse.suppliers.Component", {
		metadata: {
			manifest: "json",
			interfaces: ["sap.ui.core.IAsyncContentCreation"]
		},
		eventMappings: {
			productsComponent: [{
				name: "toProduct",
				forward: "toProduct"
			}]
		}
	});
});
