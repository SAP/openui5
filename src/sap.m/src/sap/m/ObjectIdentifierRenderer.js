/*!
 * ${copyright}
 */

sap.ui.define(['./library', "sap/ui/core/Lib"],
	function(library, Library) {
	"use strict";


	/**
	 * ObjectIdentifier renderer.
	 * @namespace
	 */
	var ObjectIdentifierRenderer = {
		apiVersion: 2
	};

	// shortcut for sap.m.EmptyIndicator
	var EmptyIndicatorMode = library.EmptyIndicatorMode;

	// shortcut for library resource bundle
	var oRb = Library.getResourceBundleFor("sap.m");

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm The RenderManager that can be used for writing to the render
	 *            output buffer
	 * @param {sap.m.ObjectIdentifier}
	 *            oOI An object representation of the control that should be
	 *            rendered
	 */
	ObjectIdentifierRenderer.render = function(oRm, oOI) {

		var sTooltip;

		// Return immediately if control is invisible
		if (!oOI.getVisible()) {
			return;
		}

		// write the HTML into the render manager
		oRm.openStart("div", oOI); // Identifier begins
		oRm.class("sapMObjectIdentifier");

		sTooltip = oOI.getTooltip_AsString();
		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		oRm.openEnd();

		oRm.openStart("div"); // Top row begins
		oRm.class("sapMObjectIdentifierTopRow");
		if (!oOI._hasTopRow()) {
			oRm.style("display", "none");
		}

		oRm.openEnd();

		oRm.openStart("div", oOI.getId() + "-title"); // Title begins
		oRm.class("sapMObjectIdentifierTitle");

		oRm.openEnd();
		if (oOI.getTitle()) {
			oRm.renderControl(oOI._getTitleControl());
		}

		oRm.close("div"); // Title ends

		oRm.openStart("div"); // Icons begin
		oRm.class("sapMObjectIdentifierIcons");

		oRm.openEnd();

		if (oOI.getBadgeAttachments()) {
			oRm.openStart("span"); // Icon span begins
			oRm.class("sapMObjectIdentifierIconSpan");
			oRm.openEnd();
			oRm.renderControl(oOI._getAttachmentsIcon());
			oRm.close("span"); // Icon span ends
		}
		if (oOI.getBadgeNotes()) {
			oRm.openStart("span"); // Icon span begins
			oRm.class("sapMObjectIdentifierIconSpan");
			oRm.openEnd();
			oRm.renderControl(oOI._getNotesIcon());
			oRm.close("span"); // Icon span ends
		}
		if (oOI.getBadgePeople()) {
			oRm.openStart("span"); // Icon span begins
			oRm.class("sapMObjectIdentifierIconSpan");
			oRm.openEnd();
			oRm.renderControl(oOI._getPeopleIcon());
			oRm.close("span"); // Icon span ends
		}

		oRm.close("div"); // Icons end

		oRm.close("div"); // Top row ends

		if (oOI.getEmptyIndicatorMode() !== EmptyIndicatorMode.Off && !oOI.getText()) {
			this.renderEmptyIndicator(oRm, oOI);
		} else {
			oRm.openStart("div", oOI.getId() + "-text"); // Text begins
			oRm.class("sapMObjectIdentifierText");

			if (oOI.getProperty("text") && oOI.getProperty("title")) {
				oRm.class("sapMObjectIdentifierTextBellow");
			}
			oRm.openEnd();
			if (oOI.getText()) {
				oRm.renderControl(oOI._getTextControl());
			}
			oRm.close("div"); // Text ends
		}

		oRm.close("div"); // Identifier ends
	};

	/**
	 * Renders the empty text indicator.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.ObjectIdentifier} oOI An object representation of the control that should be rendered.
	 */
	ObjectIdentifierRenderer.renderEmptyIndicator = function(oRm, oOI) {
		oRm.openStart("span");
			oRm.class("sapMEmptyIndicator");
			if (oOI.getEmptyIndicatorMode() === EmptyIndicatorMode.Auto) {
				oRm.class("sapMEmptyIndicatorAuto");
			}
			oRm.openEnd();
			oRm.openStart("span");
			oRm.attr("aria-hidden", true);
			oRm.openEnd();
				oRm.text(oRb.getText("EMPTY_INDICATOR"));
			oRm.close("span");
			//Empty space text to be announced by screen readers
			oRm.openStart("span");
			oRm.class("sapUiPseudoInvisibleText");
			oRm.openEnd();
				oRm.text(oRb.getText("EMPTY_INDICATOR_TEXT"));
			oRm.close("span");
		oRm.close("span");
	};



	return ObjectIdentifierRenderer;

}, /* bExport= */ true);
