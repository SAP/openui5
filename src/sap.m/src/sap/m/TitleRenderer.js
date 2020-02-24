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

		oRm.write("<", sTag);
		oRm.writeControlData(oTitle);
		oRm.addClass("sapMTitle");
		oRm.addClass("sapMTitleStyle" + (oTitle.getTitleStyle() || TitleLevel.Auto));
		oRm.addClass(oTitle.getWrapping() ? "sapMTitleWrap" : "sapMTitleNoWrap");
		oRm.addClass("sapUiSelectable");

		var sWidth = oTitle.getWidth();
		if (!sWidth) {
			oRm.addClass("sapMTitleMaxWidth");
		} else {
			oRm.addStyle("width", sWidth);
		}

		var sTextAlign = oTitle.getTextAlign();
		if (sTextAlign && sTextAlign != TextAlign.Initial) {
			oRm.addClass("sapMTitleAlign" + sTextAlign);
		}

		if (oTitle.getParent() instanceof sap.m.Toolbar) {
			oRm.addClass("sapMTitleTB");
		}

		var sTooltip = oAssoTitle ? oAssoTitle.getTooltip_AsString() : oTitle.getTooltip_AsString();
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		if (bAutoLevel) {
			oRm.writeAttribute("role", "heading");
			oRm.writeAttribute("aria-level", oTitle._getAriaLevel());
		}

		HyphenationSupport.writeHyphenationClass(oRm, oTitle);

		oRm.writeClasses();
		oRm.writeStyles();

		oRm.write("><span");
		oRm.writeAttribute("id", oTitle.getId() + "-inner");
		oRm.write(">");

		oRm.writeEscaped(sText);
		oRm.write("</span></", sTag, ">");
	};

	return TitleRenderer;

}, /* bExport= */ true);