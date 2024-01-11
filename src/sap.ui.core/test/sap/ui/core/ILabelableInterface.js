sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/App",
	"sap/m/Label",
	"sap/m/Page",
	"sap/m/HBox"
], function(
	Control,
	App,
	Label,
	Page,
	HBox
) {
	"use strict";

	var CustomControlClass = Control.extend("CustomControlClass", {
		metadata: {
			interfaces : [
				"sap.ui.core.ILabelable"
			],
			properties: {
				isInput: {
					type: "boolean",
					defaultValue: false
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				if (oControl.getIsInput()) {
					oRm.voidStart("input", oControl)
						.voidEnd();
				} else {
					oRm.openStart("span", oControl)
						.openEnd()
						.text("Some text")
						.close("span");
				}
			}
		},
		hasLabelableHTMLElement: function () {
			return this.getIsInput();
		}
	});

	var oPage = new Page("myPage", {
		title: "sap.ui.core.ILabelable Interface Test Page",
		content: [
			new HBox({
				items: [
					new Label({
						text: "Label 1",
						labelFor: "id1"
					}),
					new CustomControlClass("id1", {
						isInput: true
					})
				]
			}),
			new HBox({
				items: [
					new Label({
						text: "Label 2",
						labelFor: "id2"
					}),
					new CustomControlClass("id2", {
						isInput: false
					})
				]
			})
		]
	});

	var oApp = new App("myApp", {
		initialPage:"myPage"
	});
	oApp.addPage(oPage);

	oApp.placeAt("body");
});
