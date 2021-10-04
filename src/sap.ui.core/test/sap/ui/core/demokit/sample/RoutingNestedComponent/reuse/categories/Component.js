sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/sample/RoutingNestedComponent/base/BaseComponent"
], function(library, BaseComponent) {
	"use strict";

	return BaseComponent.extend("sap.ui.core.sample.RoutingNestedComponent.reuse.categories.Component", {
		metadata: {
			manifest: "json",
			interfaces: [library.IAsyncContentCreation]
		},
		eventMappings: {
			productsComponent: [{
				name: "toProduct",
				forward: "toProduct"
			}]
		}
	});
});
