sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Image",
	"sap/m/library"
], function (Controller, JSONModel, Image, mobileLibrary) {
	"use strict";

	// shortcut for sap.m.CarouselArrowsPlacement
	var CarouselArrowsPlacement = mobileLibrary.CarouselArrowsPlacement;

	// shortcut for sap.m.CarouselPageIndicatorPlacementType
	var CarouselPageIndicatorPlacementType = mobileLibrary.CarouselPageIndicatorPlacementType;

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = mobileLibrary.BackgroundDesign;

	// shortcut for sap.m.BorderDesign
	var BorderDesign = mobileLibrary.BorderDesign;


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

			if (sSelectedValue in CarouselPageIndicatorPlacementType) {
				oCarousel.setPageIndicatorPlacement(sSelectedValue);
			}
		},

		onBackgroundDesignSelect: function (oEvent) {
			var oCarousel = this.byId("carouselSample"),
				sSelectedValue = oEvent.getSource().getSelectedButton().getText();

			if (sSelectedValue in BackgroundDesign) {
				oCarousel.setBackgroundDesign(sSelectedValue);
			}
		},

		onPageIndicatorBackgroundDesignSelect: function (oEvent) {
			var oCarousel = this.byId("carouselSample"),
				sSelectedValue = oEvent.getSource().getSelectedButton().getText();

			if (sSelectedValue in BackgroundDesign) {
				oCarousel.setPageIndicatorBackgroundDesign(sSelectedValue);
			}
		},

		onPageIndicatorBorderDesignSelect: function (oEvent) {
			var oCarousel = this.byId("carouselSample"),
				sSelectedValue = oEvent.getSource().getSelectedButton().getText();

			if (sSelectedValue in BorderDesign) {
				oCarousel.setPageIndicatorBorderDesign(sSelectedValue);
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
		},

		onNumberOfPages: function(oEvent) {
				const sVisiblePageCount = oEvent.getParameter("value");

				this.byId("carouselSample").getCustomLayout()?.setVisiblePagesCount(Number(sVisiblePageCount));
		},

		OnScrollModeChange: function(oEvent) {
			const CarouselScrollMode = mobileLibrary.CarouselScrollMode,
					bViewMode = oEvent.getParameter("state"),
					sScrollMode = bViewMode ?  CarouselScrollMode.VisiblePages : CarouselScrollMode.SinglePage;

					this.byId("carouselSample").getCustomLayout()?.setScrollMode(sScrollMode);
		}

	});
});