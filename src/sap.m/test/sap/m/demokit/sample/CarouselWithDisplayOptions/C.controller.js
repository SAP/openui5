sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Image",
	"sap/m/CarouselArrowsPlacement",
	"sap/m/PlacementType"
], function (Controller, JSONModel, Image, CarouselArrowsPlacement, PlacementType) {
	"use strict";

	return Controller.extend("sap.m.sample.CarouselWithDisplayOptions.C", {

		onInit: function () {
			var oImgModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/img.json"));
			this.getView().setModel(oImgModel, "img");

			this._setNumberOfImagesInCarousel(3);
		},

		onArrowsPlacementSelect: function (oEvent) {
			var oCarousel = this.byId("carouselSample"),
				sSelectedValue = oEvent.getSource().getSelectedButton().getText();

			if (sSelectedValue in CarouselArrowsPlacement) {
				oCarousel.setArrowsPlacement(sSelectedValue);
			}
		},

		onPageIndicatorPlacementSelect: function (oEvent) {
			var oCarousel = this.byId("carouselSample"),
				sSelectedValue = oEvent.getSource().getSelectedButton().getText();

			if (sSelectedValue in PlacementType) {
				oCarousel.setPageIndicatorPlacement(sSelectedValue);
			}
		},

		onShowPageIndicatorChange: function (oEvent) {
			var oCarousel = this.byId("carouselSample");
			oCarousel.setShowPageIndicator(oEvent.getParameter("state"));
		},

		onResizeCarouselContainer: function (oEvent) {
			var iOriginalHeight = 650,
				iValue = oEvent.getParameter("value"),
				oCarouselContainer = this.byId("carouselContainer"),
				iNewHeight = Math.floor(iOriginalHeight * iValue / 100);

			oCarouselContainer.setWidth(iValue + "%");
			oCarouselContainer.setHeight(iNewHeight + "px");
		},

		onNumberOfImagesChange: function (oEvent) {
			this._setNumberOfImagesInCarousel(Number(oEvent.getParameter("value")));
		},

		_setNumberOfImagesInCarousel: function (iNumberOfImages) {
			if (!iNumberOfImages || iNumberOfImages < 1 || iNumberOfImages > 9) {
				return;
			}

			var oCarousel = this.byId("carouselSample");
			oCarousel.destroyPages();

			for (var i = 0; i < iNumberOfImages; i++) {
				var iImageNumber = i + 1;

				oCarousel.addPage(new Image("img" + iImageNumber, {
					src: "{img>/images/" + i + "}",
					alt: "Example picture " + iImageNumber,
					densityAware: false,
					decorative: false
				}));
			}
		}

	});
});