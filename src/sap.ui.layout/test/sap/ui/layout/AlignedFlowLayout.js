// Note: the HTML page 'AlignedFlowLayout.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Core",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/layout/AlignedFlowLayout",
	"sap/m/Input",
	"sap/m/TextArea",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/Label",
	"sap/m/Slider"
], async function(
	Core,
	App,
	Page,
	AlignedFlowLayout,
	Input,
	TextArea,
	Button,
	Text,
	Label,
	Slider
) {
	"use strict";

	await Core.ready();

	var oAlignedFlowLayout1 = new AlignedFlowLayout({
		content: [
			new Input(),
			new Input(),
			new Input(),
			new Input(),
			new Input(),
			new Input()
		],
		endContent: new Button({
			text: "Search"
		})
	});

	var oAlignedFlowLayout2 = new AlignedFlowLayout({
		content: [
			new Input(),
			new Input()
		],
		endContent: new Button({
			text: "Search"
		})
	});

	var oAlignedFlowLayout3 = new AlignedFlowLayout({
		content: [
			new Input(),
			new Input(),
			new Input(),
			new Input(),
			new Input(),
			new Input(),
			new Input()
		],
		endContent: new Button({
			text: "Searrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrch"
		})
	});

	var oAlignedFlowLayout4 = new AlignedFlowLayout({
		content: [
			new Input(),
			new Input(),
			new Input(),
			new Input(),
			new Input(),
			new Input(),
			new Input(),
			new Input()
		],
		endContent: new Button({
			text: "Searrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrch"
		})
	});

	var oAlignedFlowLayout5 = new AlignedFlowLayout({
		content: [
			new Input(),
			new Input(),
			new Input()
		]
	});

	var oAlignedFlowLayout6 = new AlignedFlowLayout({
		content: [
			new Input(),
			new Input(),
			new Input()
		],
		endContent: [
			new Button({
				text: "Dostosowanie filtrów (1)",
			}),

			new Button({
				text: "Rozpoczęcie",
			})
		]
	});

	var oAlignedFlowLayout7 = new AlignedFlowLayout({
		content: [
			new TextArea({
				height: "8rem",
				width: "100%"
			}),
			new TextArea({
				height: "8rem",
				width: "100%"
			}),
			new TextArea({
				height: "8rem",
				width: "100%"
			}),
			new TextArea({
				height: "8rem",
				width: "100%"
			})
		],
		endContent: new TextArea({
			height: "18rem"
		})
	});

	var aAlignedFlowLayout = [oAlignedFlowLayout1, oAlignedFlowLayout2, oAlignedFlowLayout3, oAlignedFlowLayout4, oAlignedFlowLayout5, oAlignedFlowLayout6, oAlignedFlowLayout7];
	var oSlider = new Slider({
		id: "slider",
		min: 50,
		max: 500,
		change: function(oControlEvent) {
			var sValue = oControlEvent.getParameter("value");

			aAlignedFlowLayout.forEach(function(oAlignedFlowLayout) {
				oAlignedFlowLayout.getEndContent().forEach(function(oEndContent) {

					if (sValue === this.getMin()) {
						oEndContent.setWidth(undefined);
					} else {
						oEndContent.setWidth(sValue + "px");
					}
				}, this);
				oAlignedFlowLayout.invalidate();
			}, this);
		}
	});

	new App({
		pages: new Page({
			title: "AlignedFlowLayout Test Page",
			content: [
				new Label({
					text: "Adjust the end items' width",
					labelFor: oSlider
				}),
				oSlider,

				new Text({
					text: "A FilterBar-like Layout"
				}),
				oAlignedFlowLayout1,

				new Text({
					text: "Alternative content to test behavior with few items"
				}),
				oAlignedFlowLayout2,

				new Text({
					text: "Alternative content to test behavior with wide buttons"
				}),
				oAlignedFlowLayout3,

				new Text({
					text: "Alternative content to test behavior with wide buttons"
				}),
				oAlignedFlowLayout4,

				new Text({
					text: "Alternative content to test behavior with no buttons"
				}),
				oAlignedFlowLayout5,

				new Text({
					text: "Alternative content to test behavior with 3 items and a large end content"
				}),
				oAlignedFlowLayout6,

				new Text({
					text: "Alternative content to test height behavior"
				}),
				oAlignedFlowLayout7
			]
		})
	}).placeAt("content");
});