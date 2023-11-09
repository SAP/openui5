sap.ui.define([
	"sap/ui/core/sample/RoutingNestedComponent/base/BaseComponent"
], function(BaseComponent) {
		"use strict";

		return BaseComponent.extend("sap.ui.core.sample.RoutingNestedComponent.Component", {
			metadata: {
				manifest: "json",
				interfaces: ["sap.ui.core.IAsyncContentCreation"]
			},
			// define the events which are fired from the reuse components
			//
			// this component registers handler to those events and navigates
			// to the other reuse components
			//
			// see the implementation in BaseComponent for processing the event
			// mapping
			eventMappings: {
				suppliersComponent: [{
					name: "toProduct",
					route: "products",
					componentTargetInfo: {
						products: {
							route: "detail",
							parameters: {
								id: "productID"
							}
						}
					}
				}],
				productsComponent: [{
					name: "toSupplier",
					route: "suppliers",
					componentTargetInfo: {
						suppliers: {
							route: "detail",
							parameters: {
								id: "supplierID"
							},
							componentTargetInfo: {
								products: {
									route: "list",
									parameters: {
										basepath: "supplierKey"
									}
								}
							}
						}
					}
				}, {
					name: "toCategory",
					route: "categories",
					componentTargetInfo: {
						categories: {
							route: "detail",
							parameters: {
								id: "categoryID"
							},
							componentTargetInfo: {
								products: {
									route: "list",
									parameters: {
										basepath: "categoryKey"
									}
								}
							}
						}
					}
				}, {
					name: "toProduct",
					route: "products",
					componentTargetInfo: {
						products: {
							route: "detail",
							parameters: {
								id: "productID"
							}
						}
					}
				}],
				categoriesComponent: [{
					name: "toProduct",
					route: "products",
					componentTargetInfo: {
						products: {
							route: "detail",
							parameters: {
								id: "productID"
							}
						}
					}
				}]
			},
			init: function() {
				// call the init function of the parent
				BaseComponent.prototype.init.apply(this, arguments);
			}
		});
	}
);
