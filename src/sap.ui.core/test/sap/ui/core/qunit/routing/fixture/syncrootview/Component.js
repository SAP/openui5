sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("test.routing.target.syncrootview", {

		metadata : {
			rootView : {
				"viewName": "test.routing.target.syncrootview.Sync",
				"type": "XML",
				"async": false
			},
			routing: {
				config: {
					async: true,
					viewType: "XML"
				},
				routes: [{
					pattern: "",
					name: "home",
					target: "home"
				}],
				targets: {
					"home": {
						type: "View",
						name: "test.routing.target.Async2",
						controlAggregation: "pages",
						controlId: "container"
					}
				}
			}
		}
	});

	return Component;
});