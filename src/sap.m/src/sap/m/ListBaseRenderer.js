/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/theming/Parameters'],
	function(jQuery, Parameters) {
	"use strict";


	/**
	 * @class List renderer.
	 * @static
	 */
	var ListBaseRenderer = {};
	
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
	ListBaseRenderer.render = function(rm, oControl) {
		// container
		rm.write("<div");
		rm.addClass("sapMList");
		rm.writeControlData(oControl);
		rm.writeAttribute("tabindex", "-1");
		if (oControl.getInset()) {
			rm.addClass("sapMListInsetBG");
		}
		if (oControl.getWidth()) {
			rm.addStyle("width", oControl.getWidth());
		}
	
		// background
		if (oControl.getBackgroundDesign) {
			rm.addClass("sapMListBG" + oControl.getBackgroundDesign());
		}
	
		// run hook method
		this.renderContainerAttributes(rm, oControl);
	
		rm.writeStyles();
		rm.writeClasses();
		rm.write(">");
	
		// render header
		var sHeaderText = oControl.getHeaderText();
		var oHeaderTBar = oControl.getHeaderToolbar();
		if (oHeaderTBar) {
			oHeaderTBar.setDesign(sap.m.ToolbarDesign.Transparent, true);
			oHeaderTBar.addStyleClass("sapMListHdrTBar");
			rm.renderControl(oHeaderTBar);
		} else if (sHeaderText) {
			rm.write("<div class='sapMListHdr'>");
			rm.writeEscaped(sHeaderText);
			rm.write("</div>");
		}
	
		// render info bar
		var oInfoTBar = oControl.getInfoToolbar();
		if (oInfoTBar) {
			oInfoTBar.setDesign(sap.m.ToolbarDesign.Info, true);
			oInfoTBar.addStyleClass("sapMListInfoTBar");
			rm.renderControl(oInfoTBar);
		}
	
		// run hook method to start building list
		this.renderListStartAttributes(rm, oControl);
	
		// list attributes
		rm.addClass("sapMListUl");
		rm.writeAttribute("tabindex", "0");
		rm.writeAttribute("id", oControl.getId("listUl"));
	
		// separators
		rm.addClass("sapMListShowSeparators" + oControl.getShowSeparators());
	
		// modes
		rm.addClass("sapMListMode" + oControl.getMode());
	
		// inset
		oControl.getInset() && rm.addClass("sapMListInset");
	
		// write inserted styles and classes
		rm.writeClasses();
		rm.writeStyles();
		rm.write(">");
	
		// run hook method to render list head attributes
		this.renderListHeadAttributes(rm, oControl);
	
		// render child controls
		var aItems = oControl.getItems();
		var bRenderItems = oControl.shouldRenderItems();
	
		//TODO: There should be a better way to set these private variables
		bRenderItems && aItems.forEach(function(oItem) {
			oControl._applySettingsToItem(oItem, true);
			rm.renderControl(oItem);
		});
	
		// render no-data if needed
		if ((!bRenderItems || !aItems.length) && oControl.getShowNoData()) {
			// hook method to render no data
			this.renderNoData(rm, oControl);
		}
	
		// run hook method to finish building list
		this.renderListEndAttributes(rm, oControl);
	
		// dummy after focusable area
		rm.write("<div tabindex='0'");
		rm.writeAttribute("id", oControl.getId("after"));
		rm.write("></div>");
		
		// render growing delegate if available
		if (bRenderItems && oControl._oGrowingDelegate) {
			oControl._oGrowingDelegate.render(rm);
		}
	
		// footer
		if (oControl.getFooterText()) {
			rm.write("<footer class='sapMListFtr'>");
			rm.writeEscaped(oControl.getFooterText());
			rm.write("</footer>");
		}
	
		// done
		rm.write("</div>");
	};
	
	/**
	 * This hook method is called to render container attributes
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ListBaseRenderer.renderContainerAttributes = function(rm, oControl) {
	};
	
	/**
	 * This hook method is called after <ul> and before first <li>
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ListBaseRenderer.renderListHeadAttributes = function(rm, oControl) {
	};
	
	/**
	 * This hook method is called to render list tag
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ListBaseRenderer.renderListStartAttributes = function(rm, oControl) {
		rm.write("<ul");
		oControl.addNavSection(oControl.getId("listUl"));
	};
	
	/**
	 * This hook method is called to finish list rendering
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ListBaseRenderer.renderListEndAttributes = function(rm, oControl) {
		rm.write("</ul>");
	};
	
	/**
	 * This hook method is called to render no data field
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ListBaseRenderer.renderNoData = function(rm, oControl) {
		rm.write("<li");
		rm.writeAttribute("tabindex", "-1");
		rm.writeAttribute("id", oControl.getId("nodata"));
		rm.addClass("sapMLIB sapMListNoData sapMLIBTypeInactive");
		rm.writeClasses();
		rm.write(">");
		
		rm.write("<span");
		rm.writeAttribute("id", oControl.getId("nodata-text"));
		rm.write(">");
		rm.writeEscaped(oControl.getNoDataText(true));
		rm.write("</span>");
		
		rm.write("</li>");
	};

	return ListBaseRenderer;

}, /* bExport= */ true);
