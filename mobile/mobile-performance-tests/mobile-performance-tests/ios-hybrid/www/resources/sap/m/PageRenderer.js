/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.PageRenderer");

/**
 * @class Page renderer. 
 * @static
 */
sap.m.PageRenderer = {
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.m.PageRenderer.render = function(rm, oPage) {
	var hdr = null;
	if (oPage.getShowHeader()) {
		hdr = oPage._getAnyHeader();
	}
	var oSubHeader = oPage.getSubHeader();
	
	var oFooter = oPage.getFooter();
	rm.write("<div");
	rm.writeControlData(oPage);
	rm.addClass("sapMPage");
	if (oFooter){
		rm.addClass("sapMPageWithFooter"); //it is used in the PopOver to remove additional margin bottom for page with footer 
	}
	rm.writeClasses(); 
	rm.write(">");

	// render header
	if (hdr){
		rm.renderControl(hdr);
	}
	
	if (oSubHeader){
		oSubHeader._context = 'header';
		rm.renderControl(oSubHeader.addStyleClass('sapMPageSubHeader'));
	}
	// render child controls
	var bScrolling = oPage._hasScrolling();
	var sBgDesign = oPage.getBackgroundDesign();
	var sPageBgOuter = bScrolling ? "" : " class='sapMPageBg" + sBgDesign +"'";
	var sPageBgInner = bScrolling ? " sapMPageBg" + sBgDesign : "";
	rm.write("<section id='" + oPage.getId() + "-cont'" + sPageBgOuter + ">");
	if (bScrolling) {
		rm.write("<div id='" + oPage.getId() + "-scroll' class='sapMPageScroll" + sPageBgInner + "'>");
	}

	// render child controls
	var aContent = oPage.getContent();
	var l = aContent.length;
	for (var i = 0; i < l; i++) {
		rm.renderControl(aContent[i]);
	}

	if (bScrolling) {
		rm.write("</div>");
	}
	rm.write("</section>");
	
	// render footer Element
	if (oFooter) {
		oFooter._context = 'footer';
		rm.renderControl(oFooter);
	}
	rm.write("</div>");
};
