sap.ui.require([
	"sap/m/Button",
	"sap/ui/core/TooltipBase"
], function(Button, TooltipBase) {
	"use strict";

	/*
	 * a simple Tooltip control, inheriting from TooltipBase
	 */
	var MyToolTip = TooltipBase.extend("MyTooltip", {
		metadata: {
			properties: {
				title: "string",
				text: "string"
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(rm, ctrl) {
				rm.openStart("div", ctrl)
					.style("background", "white")
					.style("border", "1px solid black")
					.style("padding", "0.5rem")
					.openEnd();
					if ( ctrl.getTitle()) {
						rm.openStart("div")
							.style("font-weight", "bold")
							.style("border-bottom", "1px solid gray")
							.style("margin-bottom", "1rem")
							.attr("role", "tooltip")
							.openEnd();
							rm.text(ctrl.getTitle());
						rm.close("div");
					}
					rm.openStart("div").openEnd();
					rm.text(ctrl.getText());
					rm.close("div");
				rm.close("div");
			}
		}
	});

	new Button({
		icon: "sap-icon://syringe",
		text: "Rich Fuel Injection",
		tooltip: new MyToolTip({
			title: "Title",
			text: "Some explanatory text"
		})
	}).placeAt("content");
});
