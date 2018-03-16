/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/library", "sap/ui/Device"],
	function(library, Device) {
	"use strict";


	// shortcut for sap.m.CarouselArrowsPlacement
	var CarouselArrowsPlacement = library.CarouselArrowsPlacement;

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;


	/**
	 * Carousel renderer.
	 * @namespace
	 */
	var CarouselRenderer = {
	};

	//The number 9 is by visual specification. Less than 9 pages - bullets for page indicator. 9 or more pages - numeric page indicator.
	CarouselRenderer._BULLETS_TO_NUMBERS_THRESHOLD = 9;


		/**
	 * Renders the Carousel's HTML, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oCarousel An object representation of the control that should be rendered
	 */
	CarouselRenderer.render = function(rm, oCarousel){
		var aPages = oCarousel.getPages(),
			iPageCount = aPages.length,
			sPageIndicatorPlacement = oCarousel.getPageIndicatorPlacement(),
			sArrowsPlacement = oCarousel.getArrowsPlacement(),
			sId = oCarousel.getId(),
			iBulletsToNumbersThreshold = CarouselRenderer._BULLETS_TO_NUMBERS_THRESHOLD,
			iIndex = oCarousel._getPageNumber(oCarousel.getActivePage());
		this._renderOpeningDiv(rm, oCarousel);

		//visual indicator
		if (sPageIndicatorPlacement === PlacementType.Top) {
			this._renderPageIndicatorAndArrows({
				rm: rm,
				iPageCount: iPageCount,
				sId: sId,
				iIndex: iIndex,
				iBulletsToNumbersThreshold: iBulletsToNumbersThreshold,
				sArrowsPlacement : sArrowsPlacement,
				bBottom: false,
				bShowPageIndicator: oCarousel.getShowPageIndicator()
			}, oCarousel);
		}

		this._renderInnerDiv(rm, oCarousel, aPages, sPageIndicatorPlacement);

		if (Device.system.desktop && iPageCount > 1 && sArrowsPlacement === CarouselArrowsPlacement.Content) {
			this._renderHudArrows(rm, oCarousel);
		}

		//visual indicator
		if (sPageIndicatorPlacement === PlacementType.Bottom) {
			this._renderPageIndicatorAndArrows({
				rm: rm,
				iPageCount: iPageCount,
				sId: sId,
				iIndex: iIndex,
				iBulletsToNumbersThreshold: iBulletsToNumbersThreshold,
				sArrowsPlacement : sArrowsPlacement,
				bBottom: true,
				bShowPageIndicator: oCarousel.getShowPageIndicator()
			}, oCarousel);
		}

		this._renderClosingDiv(rm);
		//page-wrap ends
	};

	CarouselRenderer._renderOpeningDiv = function(rm, oCarousel) {
		var sTooltip = oCarousel.getTooltip_AsString();

		//Outer carousel div
		rm.write("<div");
		rm.writeControlData(oCarousel);
		// custom F6 handling
		rm.writeAttribute("data-sap-ui-customfastnavgroup", "true");

		rm.addStyle("width", oCarousel.getWidth());
		rm.addStyle("height", oCarousel.getHeight());
		rm.writeStyles();

		rm.addClass("sapMCrsl");
		//'sapMCrslFluid' is originally from mobify-carousel
		rm.addClass("sapMCrslFluid");

		// add all classes (also custom classes) to carousel tag
		rm.writeClasses();

		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}

		rm.writeAttributeEscaped("tabindex","0");

		// ARIA
		rm.writeAccessibilityState(oCarousel, {
			role: "list"
		});

		rm.write(">");
	};

	CarouselRenderer._renderInnerDiv = function (rm, oCarousel, aPages, sPageIndicatorPlacement) {
		rm.write("<div class='sapMCrslInner");
		//do housekeeping
		oCarousel._cleanUpScrollContainer();

		if (aPages.length > 1 && (oCarousel.getShowPageIndicator() || oCarousel.getArrowsPlacement() === CarouselArrowsPlacement.PageIndicator)) {
			if (sPageIndicatorPlacement === PlacementType.Bottom) {
				rm.write(" sapMCrslBottomOffset");

				if (oCarousel.getArrowsPlacement() === CarouselArrowsPlacement.PageIndicator) {
					rm.write(" sapMCrslBottomArrowsOffset");
				}
			} else {
				rm.write(" sapMCrslTopOffset");
				if (oCarousel.getArrowsPlacement() === CarouselArrowsPlacement.PageIndicator) {
					rm.write(" sapMCrslTopArrowsOffset");
				}
			}
		}

		rm.write("'>");

		var fnRenderPage = function(oPage, iIndex, aArray) {
			//item div
			rm.write("<div class='sapMCrslItem");

			rm.write("' id='" + oCarousel.sId + "-" + oPage.sId + "-slide'");

			// ARIA
			rm.writeAccessibilityState(oPage, {
				role: "listitem",
				posinset: iIndex + 1,
				setsize: aArray.length
			});

			rm.write(">");
			rm.renderControl(oCarousel._createScrollContainer(oPage, iIndex));
			rm.write("</div>");
		};

		//Render Pages
		aPages.forEach(fnRenderPage);

		rm.write("</div>");
	};

	CarouselRenderer._renderClosingDiv = function(rm) {
		rm.write('</div>');
	};

	/**
	 * Renders the page indicator, using the provided {@link sap.ui.core.RenderManager}.
	 * Page indicator is only rendered if there is more than one carousel page
	 *
	 * @param {Object} settings.rm - oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {Array} settings.iPages
	 * @param {boolean} settings.bBottom
	 * @param {boolean} settings.bShowPageIndicator
	 * @private
	 */
	CarouselRenderer._renderPageIndicatorAndArrows = function (settings, oCarousel) {
		var rm = settings.rm,
			iPageCount = settings.iPageCount,
			bShowIndicatorArrows = Device.system.desktop && settings.sArrowsPlacement === CarouselArrowsPlacement.PageIndicator,
			bBottom = settings.bBottom,
			sId = settings.sId,
			iIndex = settings.iIndex,
			iBulletsToNumbersThreshold = settings.iBulletsToNumbersThreshold,
			bShowPageIndicator = settings.bShowPageIndicator,
			sPageIndicatorDisplayStyle = bShowPageIndicator ? '' : 'opacity: 0',
			oResourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m'),
			sOffsetCSSClass = "",
			sTextBetweenNumbers = oResourceBundle.getText("CAROUSEL_PAGE_INDICATOR_TEXT", [iIndex + 1, iPageCount]);

		// If there is only one page - do not render the indicator
		if (iPageCount <= 1) {
			return;
		}
		if (!bShowPageIndicator && !bShowIndicatorArrows) {
			return;
		}
		if (bBottom) {
			sOffsetCSSClass += " sapMCrslControlsBottom";
		} else {
			sOffsetCSSClass += " sapMCrslControlsTop";
		}

		if (bShowIndicatorArrows) {
			rm.write('<div');
			rm.addClass("sapMCrslControls");
			rm.addClass(sOffsetCSSClass);

			rm.writeClasses();
			rm.write('>');
			rm.write('<div class="sapMCrslControlsContainer' + sOffsetCSSClass + '">');
		} else {
			rm.write('<div class="sapMCrslControlsNoArrows' + sOffsetCSSClass + '">');
		}
		// left arrow
		if (bShowIndicatorArrows) {
			this._renderPrevArrow(rm, oCarousel);
		}

		// page indicator
		var sPageIndicatorId = sId + '-pageIndicator';
		rm.write('<div id="' + sPageIndicatorId + '" style="' + sPageIndicatorDisplayStyle + '"');
		if (iPageCount < iBulletsToNumbersThreshold) {
			rm.write(' class="sapMCrslBulleted">');
			for ( var i = 1; i <= iPageCount; i++) {
				rm.write("<span role='img' data-slide=" + i + " aria-label='" + oResourceBundle.getText('CAROUSEL_POSITION', [i, iPageCount]) + "'>" + i + "</span>");
			}
		} else {
			rm.write(' class="sapMCrslNumeric">');
			rm.write('<span id=' + sId + '-' +  'slide-number>' + sTextBetweenNumbers + '</span>');
		}
		rm.write('</div>');
		// page indicator end

		// right arrow
		if (bShowIndicatorArrows) {
			this._renderNextArrow(rm, oCarousel);
		}
		if (!bShowIndicatorArrows) {
			rm.write('</div>');
		}
		if (bShowIndicatorArrows) {
			rm.write('</div>');
			rm.write('</div>');
		}
	};

	CarouselRenderer._renderHudArrows = function(rm, oCarousel) {
		var arrowPositionHudClass;
		if (oCarousel.getShowPageIndicator()) {

			if (oCarousel.getPageIndicatorPlacement() === PlacementType.Top) {
				arrowPositionHudClass = "sapMCrslHudTop";
			} else if (oCarousel.getPageIndicatorPlacement() === PlacementType.Bottom) {
				arrowPositionHudClass = "sapMCrslHudBottom";
			}

		} else {
			arrowPositionHudClass = "sapMCrslHudMiddle";
		}
		//heads up controls for desktop browsers
		var sHudId = oCarousel.getId() + '-hud';
		rm.write('<div id="' + sHudId + '" class="sapMCrslHud ' + arrowPositionHudClass + '">');

		this._renderPrevArrow(rm, oCarousel);

		this._renderNextArrow(rm, oCarousel);

		rm.write("</div>");
	};

	CarouselRenderer._renderPrevArrow = function(rm, oCarousel) {
		rm.write("<a class='sapMCrslPrev' href='#' data-slide='prev' tabindex='-1'><div class='sapMCrslArrowInner'>");
		rm.renderControl(oCarousel._getNavigationArrow('left'));
		rm.write("</div></a>");
	};

	CarouselRenderer._renderNextArrow = function(rm, oCarousel) {
		rm.write("<a class='sapMCrslNext' href='#' data-slide='next' tabindex='-1'><div class='sapMCrslArrowInner'>");
		rm.renderControl(oCarousel._getNavigationArrow('right'));
		rm.write("</div></a>");
	};
	return CarouselRenderer;

}, /* bExport= */ true);
