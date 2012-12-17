/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.ListRenderer");

/**
 * @class List renderer.
 * @static
 */
sap.m.ListRenderer = {};

/**
 * Renders the HTML for the given control, using the provided
 * {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager}
 *          oRenderManager the RenderManager that can be used for writing to the
 *          Render-Output-Buffer
 * @param {sap.ui.core.Control}
 *          oControl an object representation of the control that should be
 *          rendered
 */
sap.m.ListRenderer.render = function(rm, oControl) {
	// return immediately if control is invisible
	if (!oControl.getVisible()) {
		return;
	}

	var bInset = oControl.getInset();
	
	rm.write("<div");
	rm.addClass("sapMList");
	if(bInset){
		rm.addClass("sapMListInsetBG");
	}
	rm.writeClasses();
	rm.writeControlData(oControl);
	if (oControl.getWidth()) {
		rm.addStyle("width", oControl.getWidth());
		rm.writeStyles();
	}
	rm.write(">");

	// header
	if (oControl.getHeaderText()) {
		rm.write("<header");
		rm.writeAttribute("id", oControl.getId() + "-listHeader");
		if (bInset)
			rm.addClass("sapMListHdrInset");
		else
			rm.addClass("sapMListHdr");
		rm.writeClasses();
		rm.write(">");
		rm.writeEscaped(oControl.getHeaderText());
		rm.write("</header>");
	}

	rm.write("<ul");
	rm.writeAttribute("id", oControl.getId() + "-listUl");
	// no header or footer no div
	rm.addClass("sapMListUl");

	if (bInset) {
		rm.addClass("sapMListInset");
		if (oControl.getHeaderText()) {
			rm.addClass("sapMListInsetHdr");
		}
		if (oControl.getFooterText()) {
			rm.addClass("sapMListInsetFtr");
		}
	}
	rm.writeClasses();
	rm.write(">");

	// check if selection mode has changed - remove current selection
	if (oControl._mode != sap.m.ListMode.None && oControl._mode != oControl.getMode()) {
		oControl._removeCurrentSelection();
	}
	
	// set new current selection mode
	oControl._mode = oControl.getMode();

	// render child controls
	var aItems = oControl.getItems();
	for ( var i = 0; i < aItems.length; i++) {
		aItems[i]._mode = oControl.getMode();
		aItems[i]._includeItemInSelection = oControl.getIncludeItemInSelection();
		aItems[i]._select = oControl._select;
		aItems[i]._delete = oControl._delete;
		aItems[i]._listId = oControl.getId();
		aItems[i]._showUnread = oControl.getShowUnread();
		rm.renderControl(aItems[i]);
	}
	
	rm.write("</ul>");

	// growing list render hook
	if (this.renderGrowingListContent) {
		this.renderGrowingListContent(rm, oControl);
	}
	
	// footer
	if (oControl.getFooterText()) {
		rm.write("<footer");
		rm.writeAttribute("id", oControl.getId() + "-listFooter");
		if (bInset)
			rm.addClass("sapMListFtrInset");
		else
			rm.addClass("sapMListFtr");
		rm.writeClasses();
		rm.write(">");
		rm.writeEscaped(oControl.getFooterText());
		rm.write("</footer>");
	}

	rm.write("</div>");
};
