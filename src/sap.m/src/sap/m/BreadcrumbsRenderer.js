/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.Breadcrumbs
sap.ui.define(["sap/m/Breadcrumbs", "sap/m/Text"], function (Class, Text) {
	"use strict";

	/**
	 * Breadcrumbs renderer.
	 * @namespace
	 */
	var BreadcrumbsRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	BreadcrumbsRenderer.render = function (oRm, oControl) {
		var aControls = oControl._getControlsForBreadcrumbTrail(),
			oSelect = oControl._getSelect();

		oRm.write("<ul");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMBreadcrumbs");
		oRm.writeClasses();
		oRm.writeAttribute("role", "navigation");
		oRm.writeAttributeEscaped("aria-labelledby", Class._getResourceBundle().getText("BREADCRUMB_LABEL"));
		oRm.write(">");

		if (oSelect.getVisible()) {
			this._renderControlInListItem(oRm, oSelect, false, "sapMBreadcrumbsSelectItem");
		}

		aControls.forEach(function (oChildControl) {
			this._renderControlInListItem(oRm, oChildControl, oChildControl instanceof Text);
		}, this);

		oRm.write("</ul>");
	};

	BreadcrumbsRenderer._renderControlInListItem = function (oRm, oControl, bSkipSeparator, sAdditionalItemClass) {
		oRm.write("<li");
		oRm.writeAttribute("role", "presentation");
		oRm.writeAttribute("aria-hidden", "true");
		oRm.addClass("sapMBreadcrumbsItem");
		oRm.addClass(sAdditionalItemClass);
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl);
		if (!bSkipSeparator) {
			oRm.write("<span");
			oRm.addClass("sapMBreadcrumbsSeparator");
			oRm.writeClasses();
			oRm.write(">/</span>");
		}
		oRm.write("</li>");
	};

	return BreadcrumbsRenderer;

}, /* bExport= */ true);
