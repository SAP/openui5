sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Carousel",
	"sap/m/Text",
	"sap/m/Title",
	"sap/ui/model/json/JSONModel"
], function (
	App,
	Page,
	Carousel,
	Text,
	Title,
	JSONModel
) {
	"use strict";
	// create and add app
	var app = new App("myApp", {initialPage:"tabBarPage"});
	app.placeAt("body");

	var data = {
		texts : [ {
			text : "Travel Expend"
		}, {
			text : "Travel and expense report"
		}, {
			text : "Expense report"
		}]
	};
	var oCarousel = new Carousel("car1", {
		width : "100%",
		height : "50%",
		pages : {path:"/wrongPath", template:
			new Text({
				text: "{text}"
			})
		}
	});

	var oCarousel2 = new Carousel("car2", {
		width : "40%",
		height : "50%",
		pages : {path:"/wrongPath", template:
			new Text({
				text: "{text}"
			})
		}
	});

	var oCarousel3 = new Carousel("car3", {
		width : "400px",
		height : "210px",
		pages : {path:"/wrongPath", template:
			new Text({
				text: "{text}"
			})
		}
	});

	var initialPage = new Page("tabBarPage", {
		showHeader: false,
		content: [
			new Title({
				text: "Carousel with 100% width and no pages"
			}),
			oCarousel,
			new Title({
				text: "Carousel with 40% width and no pages"
			}),
			oCarousel2,
			oCarousel3
		]
	});

	var oModel = new JSONModel();
	oModel.setData(data);
	oCarousel.setModel(oModel);
	oCarousel2.setModel(oModel);

	app.addPage(initialPage);

});

