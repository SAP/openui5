/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
	"use strict";


	/**
	 * ObjectIdentifier renderer.
	 * @namespace
	 */
	var ObjectIdentifierRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm The RenderManager that can be used for writing to the render
	 *            output buffer
	 * @param {sap.ui.core.Control}
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
		oRm.renderControl(oOI._getTitleControl());

		//Render WAI ARIA hidden label for title
		oRm.renderControl(oOI._oAriaCustomRole);
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

		oRm.openStart("div", oOI.getId() + "-text"); // Text begins
		oRm.class("sapMObjectIdentifierText");

		if (!!oOI.getProperty("text") && !!oOI.getProperty("title")) {
			oRm.class("sapMObjectIdentifierTextBellow");
		}
		oRm.openEnd();
		oRm.renderControl(oOI._getTextControl());
		oRm.close("div"); // Text ends

		oRm.close("div"); // Identifier ends
	};


	return ObjectIdentifierRenderer;

}, /* bExport= */ true);
