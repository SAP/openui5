sap.ui.define(["sap/ui/layout/form/SimpleForm", "sap/ui/layout/VerticalLayout", "sap/m/Text", "sap/m/Label", "sap/m/Button"], function(SimpleForm, VerticalLayout, Text, Label, Button) {
	"use strict";
	sap.ui.jsview("sap.uxap.sample.SharedBlocks.goals.GoalsBlock", {
		getControllerName: function () {
			return "sap.uxap.sample.SharedBlocks.goals.GoalsBlockController";
		},
		createContent: function (oController) {
			var oForm = new SimpleForm({
				maxContainerCols: 1,
				layout: "ResponsiveGridLayout",
				width: "100%",
				content: new VerticalLayout({
					content: [
						new Label({text: "Evangelize the UI framework accross the company", design: "Bold"}),
						new Text({text: "4 days overdue Cascaded"}),
						new Text({text: " "}),
						new Label({text: "Get trained in development management direction", design: "Bold"}),
						new Text({text: "Due Nov 21"}),
						new Text({text: " "}),
						new Label({text: "Mentor junior developers", design: "Bold"}),
						new Text({text: "Due Dec 31 Cascaded"}),
						new Button({text: "Hello from a JS View", press: oController.onBtnPress})
					]
				})
			});
			return oForm;
		}
	});
});
