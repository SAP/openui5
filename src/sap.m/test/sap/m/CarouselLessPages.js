sap.ui.define(["sap/m/Image", "sap/m/Carousel", "sap/m/App", "sap/m/Page"], function(MImage, Carousel, App, Page) {
	"use strict";

			// Create Images
			var imgDesert = new MImage("desert", {
				src: "images/demo/nature/desert.jpg",
				alt: "Majestic Desert Image",
				tooltip: "Majestic Desert",
				densityAware: false,
				decorative: false
			});

			var imgPrairie = new MImage("prairie", {
				src: "images/demo/nature/prairie.jpg",
				alt: "Prairie in Dawn Image",
				tooltip: "Prairie in Dawn",
				densityAware: false,
				decorative: false
			});

			var imgWaterfall = new MImage("waterfall", {
				src: "images/demo/nature/waterfall.jpg",
				alt: "Waterfall in the Jungle Image",
				tooltip: "Waterfall in the Jungle",
				densityAware: false,
				decorative: false
			});


			var carousel = new Carousel("myCarousel", {
				width: "50%",
				height: "50%",
				pages: [imgDesert, imgPrairie, imgWaterfall]
			});


			var appCarousel = new App("myApp", {initialPage:"carouselPage"});

			var carouselPage = new Page("carouselPage",
				{title: "Carousel Test Page",
				enableScrolling: false }
			);

			carouselPage.addContent(carousel);
			appCarousel.addPage(carouselPage);
			appCarousel.placeAt("body");

			sap.ui.getCore().applyChanges();
});
