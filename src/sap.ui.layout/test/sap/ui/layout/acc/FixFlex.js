sap.ui.require([
	"sap/m/App",
	"sap/m/Carousel",
	"sap/m/Image",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/Text",
	"sap/ui/layout/FixFlex"
], function(App, Carousel, Image, Page, Panel, Text, FixFlex) {
	"use strict";

	var app = new App('myApp', {
		initialPage: 'page1'
	});

	var oFixFlexColumn = new FixFlex({
		minFlexSize: 450,

		fixContent: [new Panel({
			expandable: true,
			expanded: false,
			headerText: "Panel with a header text",
			content: new Text({
				text: 'Lorem Ipsum'
			})
		})],

		flexContent: new Carousel({
			pages: [new Image({
				src: "../../../../sap/ui/documentation/sdk/images/HT-6100-large.jpg",
				alt: "item HT-6100",
				decorative: false,
				tooltip: "HT-6100"
			}), new Image({
				src: "../../../../sap/ui/documentation/sdk/images/HT-1112.jpg",
				alt: "item HT-1112",
				decorative: false,
				tooltip: "HT-1112"
			})]
		})

	});

	var page1 = new Page('page1', {
		title: 'FixFlex vertical layout',
		enableScrolling: true,
		content: [oFixFlexColumn]
	});


	app.addPage(page1).placeAt('body');
});
