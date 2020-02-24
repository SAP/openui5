/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.Title
sap.ui.define(["sap/ui/core/library", "sap/m/HyphenationSupport"],
	function(coreLibrary, HyphenationSupport) {
	"use strict";


	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;


	/**
	 * Title renderer.
	 * @namespace
	 */
	var TitleRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oShell an object representation of the control that should be rendered
	 */
	TitleRenderer.render = function(oRm, oTitle){
		var oAssoTitle = oTitle._getTitle(),
			sLevel = (oAssoTitle ? oAssoTitle.getLevel() : oTitle.getLevel()) || TitleLevel.Auto,
			bAutoLevel = sLevel == TitleLevel.Auto,
			sTag = bAutoLevel ? "div" : sLevel,
			sText = HyphenationSupport.getTextForRender(oTitle, "main");

		oRm.openStart(sTag);
		oRm.controlData(oTitle);
		oRm.class("sapMTitle");
		oRm.class("sapMTitleStyle" + (oTitle.getTitleStyle() || TitleLevel.Auto));
		oRm.class(oTitle.getWrapping() ? "sapMTitleWrap" : "sapMTitleNoWrap");
		oRm.class("sapUiSelectable");

		var sWidth = oTitle.getWidth();
		if (!sWidth) {
			oRm.class("sapMTitleMaxWidth");
		} else {
			oRm.style("width", sWidth);
		}

		var sTextAlign = oTitle.getTextAlign();
		if (sTextAlign && sTextAlign != TextAlign.Initial) {
			oRm.class("sapMTitleAlign" + sTextAlign);
		}

		if (oTitle.getParent() instanceof sap.m.Toolbar) {
			oRm.class("sapMTitleTB");
		}

		var sTooltip = oAssoTitle ? oAssoTitle.getTooltip_AsString() : oTitle.getTooltip_AsString();
		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		if (bAutoLevel) {
			oRm.attr("role", "heading");
			oRm.attr("aria-level", oTitle._getAriaLevel());
		}

		HyphenationSupport.writeHyphenationClass(oRm, oTitle);

		oRm.openEnd();
		oRm.openStart("span");
		oRm.attr("id", oTitle.getId() + "-inner");
		oRm.openEnd();

		oRm.text(sText);
		oRm.close("span");
		oRm.close(sTag);
	};

	return TitleRenderer;

}, /* bExport= */ true);