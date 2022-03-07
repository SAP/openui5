/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.Title
sap.ui.define(["sap/ui/core/Renderer", "sap/ui/core/library", "sap/m/HyphenationSupport"],
	function(Renderer, coreLibrary, HyphenationSupport) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	/**
	 * Title renderer.
	 * @namespace
	 */
	var TitleRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.Title} oTitle an object representation of the control that should be rendered
	 */
	TitleRenderer.render = function(oRm, oTitle){
		var oAssoTitle = oTitle._getTitle(),
			oTitleContent = oTitle.getContent(),
			sLevel = (oAssoTitle && !oTitleContent ? oAssoTitle.getLevel() : oTitle.getLevel()) || TitleLevel.Auto,
			bAutoLevel = sLevel == TitleLevel.Auto,
			sTag = bAutoLevel ? "div" : sLevel.toLowerCase(),
			sText = !oTitleContent ? HyphenationSupport.getTextForRender(oTitle, "main") : "",
			sTextDir = oTitle.getTextDirection(),
			sTextAlign = Renderer.getTextAlign(oTitle.getTextAlign(), sTextDir),
			sTooltip;

		oRm.openStart(sTag, oTitle);
		oRm.class("sapMTitle");
		oRm.class("sapMTitleStyle" + oTitle.getTitleStyle());
		oRm.class(oTitle.getWrapping() ? "sapMTitleWrap" : "sapMTitleNoWrap");
		oRm.class("sapUiSelectable");

		var sWidth = oTitle.getWidth();
		if (!sWidth) {
			oRm.class("sapMTitleMaxWidth");
		} else {
			oRm.style("width", sWidth);
		}

		if (sTextAlign) {
			oRm.style("text-align", sTextAlign);
		}

		if (oTitle.getParent() && oTitle.getParent().isA("sap.m.Toolbar")) {
			oRm.class("sapMTitleTB");
		}

		sTooltip = oAssoTitle && !oTitleContent ? oAssoTitle.getTooltip_AsString() : oTitle.getTooltip_AsString();
		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		if (bAutoLevel) {
			oRm.attr("role", "heading");
			oRm.attr("aria-level", oTitle._getAriaLevel());
		}

		if (!oTitleContent) {
			HyphenationSupport.writeHyphenationClass(oRm, oTitle);
		}

		oRm.openEnd();

		oRm.openStart("span", oTitle.getId() + "-inner");
		oRm.attr("dir", sTextDir !== TextDirection.Inherit ? sTextDir.toLowerCase() : "auto");
		oRm.openEnd();
		if (oTitleContent) { // render a control added in the titleControl aggregation ...
			oRm.renderControl(oTitleContent);
		} else { // ... or just a text if there is no such control
			oRm.text(sText);
		}
		oRm.close("span");

		oRm.close(sTag);
	};

	return TitleRenderer;

}, /* bExport= */ true);
