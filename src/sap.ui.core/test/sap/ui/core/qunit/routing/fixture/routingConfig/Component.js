sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("test.routing.target.Component", {

		metadata : {
			rootView : {
				viewName: "test.routing.target.Async2",
				type: "XML",
				async: true
			},
			routing : {
				config: {
					async: true
				},
				routes: [{
					name: "home",
					pattern: "",
					target: "home"
				}],
				targets: {
					home: {
						type: "View",
						name: "test.routing.target.Async3",
						viewType: "XML",
						controlId: "panel",
						controlAggregation: "content"
					}
				}
			}
		},

		init: function() {
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
		}

	});

	return Component;
});
