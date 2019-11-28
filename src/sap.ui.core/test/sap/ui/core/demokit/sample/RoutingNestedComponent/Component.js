sap.ui.define([
	"sap/ui/demo/routing/nested/base/BaseComponent",
	"sap/ui/model/json/JSONModel"
], function(BaseComponent, JSONModel) {
		"use strict";

		return BaseComponent.extend("sap.ui.demo.routing.nested.Component", {
			metadata: {
				manifest: "json"
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

				this.getRouter().attachRouteMatched(this._onRouteMatched, this);
			},
			_onRouteMatched: function(oEvent) {
				var oConfig = oEvent.getParameter("config");

				// select the corresponding item in the left menu
				this.setSelectedMenuItem(oConfig.name);
			},
			setSelectedMenuItem: function(sKey) {
				var oRootView = this.getRootControl();

				if (oRootView) {
					oRootView.byId("navigationList").setSelectedKey(sKey);
				}
			}
		});
	}
);
