/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
 
jQuery.sap.declare("sap.m.CarouselRenderer");

/**
 * @class Carousel renderer. 
 * @static
 */
sap.m.CarouselRenderer = {
};




/**
 * Renders the Carousel's HTML, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.m.CarouselRenderer.render = function(rm, oCarousel){ 
	// Return immediately if control is invisible or if there are no pages to be rendered
	if (!oCarousel.getVisible() || oCarousel.getPages().length == 0) {
		return;
	}

	//div for pages
	rm.write("<div");
	rm.writeControlData(oCarousel);

	rm.addStyle("width", oCarousel.getWidth());
	rm.addStyle("height", oCarousel.getHeight());
	rm.writeStyles();
	
	rm.write(" class='sapMCrsl'>");
	
	//visual indicator
	if(oCarousel.getPageIndicatorPlacement() == sap.m.PlacementType.Top) {
		this._renderPageIndicator(rm, oCarousel);
	}
	
	//prepare the div which will contain the pages
	if(!oCarousel._oSwipeView) {
		rm.write("<div id='" + oCarousel._getContentId() + "' class='sapMCrslCont'></div>");
	}
	
	//visual indicator
	if(oCarousel.getPageIndicatorPlacement() == sap.m.PlacementType.Bottom) {
		this._renderPageIndicator(rm, oCarousel);
	}
	rm.write("</div>");
	
		
};


/**
 * Renders the page indicator, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 * @private
 */
sap.m.CarouselRenderer._renderPageIndicator = function(rm, oCarousel){
	rm.write("<ul id='" + oCarousel._getNavId() + "' class='sapMCrslIndLst'>");
	rm.write("<div id='" + oCarousel._getPrevBtnId() + "' class='sapMCrslIndLstBt'/>");
	this.renderPageIndicatorDots(rm, oCarousel);
	rm.write("<div id='" + oCarousel._getNextBtnId() + "' class='sapMCrslIndLstBt'/>");
	rm.write("</ul>");
};


/**
 * Renders the page indicator dots, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.m.CarouselRenderer.renderPageIndicatorDots = function(rm, oCarousel){
	var dotCount = oCarousel.getPages().length;
	for(var i= 0; i< dotCount; i ++) {
		rm.write("<li id='" + oCarousel._getNavId() + "-dot" + i + "' class='sapMCrslIndLstIt'></li>");
	}
};

