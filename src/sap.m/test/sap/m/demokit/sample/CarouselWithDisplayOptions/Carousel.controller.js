sap.ui.define(['jquery.sap.global','sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(jQuery, Controller, JSONModel) {
	"use strict";

	var CarouselController = Controller.extend("sap.m.sample.CarouselWithDisplayOptions.Carousel", {
		onInit: function (evt) {
			// set explored app's demo model on this sample
			var oImgModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/img.json"));
			this.getView().setModel(oImgModel, "img");

			// set the possible screen sizes
			var oCarouselContainer = {
				screenSizes : [
					"350px",
					"420px",
					"555px",
					"743px",
					"908px"
				]
			};
			var oScreenSizesModel = new JSONModel(oCarouselContainer);
			this.getView().setModel(oScreenSizesModel, "ScreenSizesModel");

			this._setNumberOfImagesInCarousel(3);
		},
		onArrowsPlacementSelect: function (oEvent) {
			var oCarousel = this.byId("carouselSample");
			var sSelectedValue = oEvent.getSource().getSelectedButton().getText();
			if (sSelectedValue === "Content") {
				oCarousel.setArrowsPlacement(sap.m.CarouselArrowsPlacement.Content);
			} else if (sSelectedValue === "PageIndicator") {
				oCarousel.setArrowsPlacement(sap.m.CarouselArrowsPlacement.PageIndicator);
			}
		},
		onPageIndicatorPlacementSelect: function (oEvent) {
			var oCarousel = this.byId("carouselSample");
			var sSelectedValue = oEvent.getSource().getSelectedButton().getText();
			if (sSelectedValue === "Bottom") {
				oCarousel.setPageIndicatorPlacement(sap.m.PlacementType.Bottom);
			} else if (sSelectedValue === "Top") {
				oCarousel.setPageIndicatorPlacement(sap.m.PlacementType.Top);
			}
		},
		onShowPageIndicatorSelect: function (oEvent) {
			var oCarousel = this.byId("carouselSample");
			var sSelectedValue = oEvent.getSource().getSelectedButton().getText();
			if (sSelectedValue === "Yes") {
				oCarousel.setShowPageIndicator(true);
			} else if (sSelectedValue === "No") {
				oCarousel.setShowPageIndicator(false);
			}
		},
		onSliderMoved: function (oEvent) {
			var origingalHeight = 650;

			var screenSizesJSON = this.getView().getModel("ScreenSizesModel").getData();
			var iValue = oEvent.getParameter("value");
			var screenWidth = screenSizesJSON.screenSizes[Number(iValue) - 1];
			var oCarouselContainer = this.byId("carouselContainer");
			oCarouselContainer.setWidth(screenWidth);
			var screenHeight = origingalHeight * parseFloat(screenWidth) / 1000;
			oCarouselContainer.setHeight(screenHeight + 'px');
		},
		onNumberOfImagesChange: function (oEvent) {
			var numberOfImages = oEvent.getSource().getValue();
			this._setNumberOfImagesInCarousel(Number(numberOfImages));
		},
		_setNumberOfImagesInCarousel: function (numberOfImages) {
			if (!numberOfImages || numberOfImages < 1 || numberOfImages > 9){
				return;
			}

			var oCarousel = this.byId("carouselSample");
			oCarousel.destroyPages();

			for (var i = 0; i < numberOfImages; i++) {
				var imgId = "img" + (i + 1);
				var imgSrc = "{img>/images/" + i + "}";
				var imgAlt = "Example picture " + (i + 1);
				var img = new sap.m.Image(imgId, {
					src: imgSrc,
					alt: imgAlt,
					densityAware: false,
					decorative: false
				});

				oCarousel.addPage(img);
			}
		}
	});

	return CarouselController;
});
