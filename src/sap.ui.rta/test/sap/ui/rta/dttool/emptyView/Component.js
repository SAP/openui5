sap.ui.define(["sap/ui/core/UIComponent"],
	function(UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.rta.dttool.emptyView.Component", {

			metadata: {
				rootView: {
					viewName: "sap.ui.rta.dttool.emptyView.EmptyView",
					type: "XML",
					async: true,
					id: "page"
				},
				dependencies: {
					libs: [
						"sap.m"
					]
				},
				config: {
					sample: {
						stretch: true,
						files: [
							"EmptyView.view.xml",
							"Controller.controller.js"
						]
					}
				}
			}
		});

		return Component;
	});
