/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/library",
	"sap/base/strings/capitalize",
	"sap/ui/Device",
	"sap/ui/core/Lib"
], function (library, capitalize, Device, Library) {
	"use strict";

	// shortcut for sap.m.CarouselArrowsPlacement
	var CarouselArrowsPlacement = library.CarouselArrowsPlacement;

	// shortcut for sap.m.CarouselPageIndicatorPlacementType
	var CarouselPageIndicatorPlacementType = library.CarouselPageIndicatorPlacementType;

	var oResourceBundle = Library.getResourceBundleFor("sap.m");

	/**
	 * Carousel renderer.
	 * @namespace
	 */
	var CarouselRenderer = {
		apiVersion: 2
	};

	//The number 9 is by visual specification. Less than 9 pages - bullets for page indicator. 9 or more pages - numeric page indicator.
	CarouselRenderer._BULLETS_TO_NUMBERS_THRESHOLD = 9;

	/**
	 * Renders the Carousel's HTML, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Carousel} oCarousel An object representation of the control that should be rendered
	 */
	CarouselRenderer.render = function (oRM, oCarousel){
		var aPages = oCarousel.getPages(),
			iPageCount = aPages.length,
			sPageIndicatorPlacement = oCarousel.getPageIndicatorPlacement(),
			sArrowsPlacement = oCarousel.getArrowsPlacement(),
			iIndex = oCarousel._iCurrSlideIndex;

		this._renderOpeningDiv(oRM, oCarousel);
		this._renderDummyArea(oRM, oCarousel, "before");

		//visual indicator
		if (sPageIndicatorPlacement === CarouselPageIndicatorPlacementType.Top ||
			sPageIndicatorPlacement === CarouselPageIndicatorPlacementType.OverContentTop) {
			this._renderPageIndicatorAndArrows(oRM, oCarousel, {
				iPageCount: iPageCount,
				iIndex: iIndex,
				sArrowsPlacement : sArrowsPlacement,
				sPlacement: sPageIndicatorPlacement,
				bShowPageIndicator: oCarousel.getShowPageIndicator()
			});
		}

		this._renderInnerDiv(oRM, oCarousel, aPages, sPageIndicatorPlacement);

		if (Device.system.desktop && iPageCount > oCarousel._getNumberOfItemsToShow() && sArrowsPlacement === CarouselArrowsPlacement.Content) {
			this._renderHudArrows(oRM, oCarousel);
		}

		//visual indicator
		if (sPageIndicatorPlacement === CarouselPageIndicatorPlacementType.OverContentBottom
			|| sPageIndicatorPlacement === CarouselPageIndicatorPlacementType.Bottom) {
			this._renderPageIndicatorAndArrows(oRM, oCarousel, {
				iPageCount: iPageCount,
				iIndex: iIndex,
				sArrowsPlacement : sArrowsPlacement,
				sPlacement: sPageIndicatorPlacement,
				bShowPageIndicator: oCarousel.getShowPageIndicator()
			});
		}

		this._renderDummyArea(oRM, oCarousel, "after");
		oRM.close("div");
		//page-wrap ends
	};

	CarouselRenderer._renderOpeningDiv = function (oRM, oCarousel) {
		var sTooltip = oCarousel.getTooltip_AsString();
		var sBackgroundDesign = "sapMCrslBackground-" + oCarousel.getBackgroundDesign();

		//Outer carousel div
		oRM.openStart("div", oCarousel)
			.class("sapMCrsl")
			.class(sBackgroundDesign)
			.class("sapMCrslFluid") // sapMCrslFluid is originally from mobify-carousel
			.style("width", oCarousel.getWidth())
			.style("height", oCarousel.getHeight())
			.attr("data-sap-ui-customfastnavgroup", true) // custom F6 handling
			.accessibilityState(oCarousel, {
				role: "listbox"
			});

		if (sTooltip) {
			oRM.attr("title", sTooltip);
		}

		oRM.openEnd();
	};

	CarouselRenderer._renderInnerDiv = function (oRM, oCarousel, aPages, sPageIndicatorPlacement) {
		oRM.openStart("div").class("sapMCrslInner");

		if (!aPages.length) {
			oRM.class("sapMCrslInnerNoPages");
		}

		if (aPages.length > 1 && (oCarousel.getShowPageIndicator() || oCarousel.getArrowsPlacement() === CarouselArrowsPlacement.PageIndicator)) {

			if (sPageIndicatorPlacement === CarouselPageIndicatorPlacementType.Bottom) {
				oRM.class("sapMCrslBottomOffset");

				if (oCarousel.getArrowsPlacement() === CarouselArrowsPlacement.PageIndicator) {
					oRM.class("sapMCrslBottomArrowsOffset");
				}
			} else if (sPageIndicatorPlacement === CarouselPageIndicatorPlacementType.Top) {
				oRM.class("sapMCrslTopOffset");

				if (oCarousel.getArrowsPlacement() === CarouselArrowsPlacement.PageIndicator) {
					oRM.class("sapMCrslTopArrowsOffset");
				}
			}
		}

		oRM.openEnd();

		// Render Pages
		if (aPages.length) {
			aPages.forEach(function (oPage, iIndex, aArray) {
				CarouselRenderer._renderPage(oRM, oPage, oCarousel, iIndex, aArray);
			});
		} else {
			CarouselRenderer._renderNoData(oRM, oCarousel);
		}

		oRM.close("div");
	};

	CarouselRenderer._renderPage = function (oRM, oPage, oCarousel, iIndex, aArray) {
		var bSelected = oCarousel.getActivePage() === oPage.getId();

		oRM.openStart("div", oCarousel.getId() + "-" + oPage.getId() + "-slide")
			.class("sapMCrslItem")
			.accessibilityState(oPage, {
				role: "option",
				posinset: iIndex + 1,
				setsize: aArray.length,
				selected: bSelected,
				hidden: !oCarousel._isPageDisplayed(iIndex)
			})
			.attr("tabindex", bSelected ? 0 : -1)
			.openEnd();

		CarouselRenderer._renderPageInScrollContainer(oRM, oCarousel, oPage);

		oRM.close("div");
	};

	CarouselRenderer._renderNoData = function (oRM, oCarousel) {
		var oEmptyPage = oCarousel._getEmptyPage();
		var oAccInfo = oEmptyPage.getAccessibilityInfo();

		oRM.openStart("div", oCarousel.getId() + "-noData")
			.attr("tabindex", 0)
			.class("sapMCrslNoDataItem")
			.accessibilityState({
				label: oAccInfo.type + " " + oAccInfo.description
			})
			.openEnd();

		oRM.renderControl(oCarousel._getEmptyPage());

		oRM.close("div");
	};

	/**
	 * Renders the page indicator, using the provided {@link sap.ui.core.RenderManager}.
	 * Page indicator is only rendered if there is more than one carousel page
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Carousel} oCarousel the control being rendered
	 * @param {object} mSettings
	 * @param {int} mSettings.iPageCount
	 * @param {int} mSettings.iIndex
	 * @param {string} mSettings.sPlacement
	 * @param {sap.m.CarouselArrowsPlacement} mSettings.sArrowsPlacement
	 * @param {boolean} mSettings.bShowPageIndicator
	 * @private
	 */
	CarouselRenderer._renderPageIndicatorAndArrows = function (oRM, oCarousel, mSettings) {
		var iPageCount = mSettings.iPageCount,
			bShowIndicatorArrows = Device.system.desktop && mSettings.sArrowsPlacement === CarouselArrowsPlacement.PageIndicator,
			sId = oCarousel.getId(),
			aOffsetClasses = [],
			iNumberOfItemsToShow = oCarousel._getNumberOfItemsToShow(),
			sPageIndicatorBackgroundDesign = "sapMCrslControlsBackground-" + oCarousel.getPageIndicatorBackgroundDesign(),
			sPageIndicatorBorderDesign = "sapMCrslControlsBorder-" + oCarousel.getPageIndicatorBorderDesign();

		// If there is only one page - do not render the indicator
		if (iPageCount <= oCarousel._getNumberOfItemsToShow()) {
			return;
		}

		if (!mSettings.bShowPageIndicator && !bShowIndicatorArrows) {
			return;
		}

		aOffsetClasses.push("sapMCrslControls" + mSettings.sPlacement);

		if (bShowIndicatorArrows) {
			oRM.openStart("div").class("sapMCrslControls");
		} else {
			oRM.openStart("div").class("sapMCrslControlsNoArrows");
		}

		oRM.class(sPageIndicatorBackgroundDesign).class(sPageIndicatorBorderDesign);
		aOffsetClasses.forEach(function (sClass) { oRM.class(sClass); });
		oRM.openEnd();

		if (bShowIndicatorArrows) {
			oRM.openStart("div").class("sapMCrslControlsContainer");
			aOffsetClasses.forEach(function (sClass) { oRM.class(sClass); });
			oRM.openEnd();
		}

		// left arrow
		if (bShowIndicatorArrows) {
			this._renderArrow(oRM, oCarousel, "previous");
		}

		// page indicator
		oRM.openStart("div", sId + "-pageIndicator");

		if (!mSettings.bShowPageIndicator) {
			oRM.style("opacity", "0");
		}

		if (iPageCount < CarouselRenderer._BULLETS_TO_NUMBERS_THRESHOLD) {

			oRM.class("sapMCrslBulleted").openEnd();

			for (var i = 1; i <= iPageCount - iNumberOfItemsToShow + 1; i++) {
				oRM.openStart("span")
					.attr("data-slide", i)
					.accessibilityState({
						role: "img",
						label: oResourceBundle.getText("CAROUSEL_POSITION", [i, iPageCount])
					}).openEnd()
					.close("span");
			}

		} else {
			oRM.class("sapMCrslNumeric")
				.openEnd();

			var sTextBetweenNumbers = oResourceBundle.getText("CAROUSEL_PAGE_INDICATOR_TEXT", [mSettings.iIndex + 1, iPageCount - iNumberOfItemsToShow + 1]);
			oRM.openStart("span", sId + "-" + "slide-number")
				.attr("dir", "auto")
				.openEnd()
				.text(sTextBetweenNumbers)
				.close("span");
		}

		oRM.close("div");
		// page indicator end

		// right arrow
		if (bShowIndicatorArrows) {
			this._renderArrow(oRM, oCarousel, "next");
		}

		if (!bShowIndicatorArrows) {
			oRM.close("div");
		}

		if (bShowIndicatorArrows) {
			oRM.close("div")
				.close("div");
		}
	};

	CarouselRenderer._renderHudArrows = function (oRM, oCarousel) {
		var sArrowPositionHudClass;

		if (oCarousel.getShowPageIndicator()) {
			sArrowPositionHudClass = "sapMCrslHud" + oCarousel.getPageIndicatorPlacement();
		} else {
			sArrowPositionHudClass = "sapMCrslHudMiddle";
		}

		//heads up controls for desktop browsers
		oRM.openStart("div", oCarousel.getId() + "-hud")
			.class("sapMCrslHud")
			.class(sArrowPositionHudClass)
			.openEnd();

		this._renderArrow(oRM, oCarousel, "previous");
		this._renderArrow(oRM, oCarousel, "next");

		oRM.close("div");
	};

	CarouselRenderer._renderArrow = function (oRM, oCarousel, sDirection) {
		var sShort = sDirection.slice(0, 4),
			bLoop = oCarousel.getLoop(),
			bFirstPageIsActive = oCarousel._aAllActivePagesIndexes[0] === 0,
			bLastPageIsActive = oCarousel._aAllActivePagesIndexes[oCarousel._aAllActivePagesIndexes.length - 1] === oCarousel.getPages().length - 1;

		oRM.openStart("span", oCarousel.getId() + "-arrow-" + sDirection)
			.class("sapMCrslArrow")
			.class("sapMCrsl" + capitalize(sShort))
			.attr("data-slide", sShort)
			.attr("title", oResourceBundle.getText("PAGINGBUTTON_" + sDirection.toUpperCase()));

		// Hide unneeded arrow when we are on the first or last page and "loop" property is set to false
		if (bFirstPageIsActive && sDirection === "previous" && !bLoop) {
			oRM.class("sapMCrslLeftmost");
		} else if (bLastPageIsActive && sDirection !== "previous" && !bLoop) {
			oRM.class("sapMCrslRightmost");
		}

		oRM.openEnd();

		oRM.openStart("div").class("sapMCrslArrowInner").openEnd();

		oRM.renderControl(oCarousel._getNavigationArrow(sDirection === "previous" ? "Left" : "Right"));

		oRM.close("div").close("span");
	};

	/**
	 * Private method that places a given page control into
	 * a scroll container which does not scroll. That container does
	 * not scroll itself. This is necessary to achieve the 100% height
	 * effect with an offset for the page indicator.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Carousel} oCarousel the carousel containg the page
	 * @param {sap.ui.core.Control} oPage the page to check
	 * @private
	 */
	CarouselRenderer._renderPageInScrollContainer = function (oRM, oCarousel, oPage) {
		// wrap in scrollcontainer
		oRM.openStart("div").class("sapMScrollCont")
			.class("sapMScrollContH")
			.style("width", "100%")
			.style("height", "100%")
			.openEnd();

			oRM.openStart("div").class("sapMScrollContScroll").openEnd();

				oRM.openStart("div").class("sapMCrslItemTable").openEnd();

					oRM.openStart("div").class("sapMCrslItemTableCell");

					if (oPage.isA("sap.m.Image")) {
						var sImgClass = "sapMCrslImgNoArrows",
							bShowIndicatorArrows = Device.system.desktop && oCarousel.getArrowsPlacement() === CarouselArrowsPlacement.PageIndicator;
						if (bShowIndicatorArrows) {
							sImgClass = "sapMCrslImg";
						}

						oRM.class(sImgClass);
					}

					oRM.openEnd();
					oRM.renderControl(oPage.addStyleClass("sapMCrsPage"));
					oRM.close("div");

				oRM.close("div");

			oRM.close("div");

		oRM.close("div");
		// end wrapping in scroll container
	};

	CarouselRenderer._renderDummyArea = function(oRM, oControl, sAreaId) {
		oRM.openStart("div", oControl.getId() + "-" + sAreaId)
			.class("sapMCrslDummyArea")
			.attr("role", "none")
			.attr("tabindex", 0)
			.openEnd()
			.close("div");
	};

	return CarouselRenderer;
});