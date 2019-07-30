/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.Breadcrumbs
sap.ui.define(["sap/m/Text"], function (Text) {
	"use strict";

	/**
	 * Breadcrumbs renderer.
	 * @namespace
	 */
	var BreadcrumbsRenderer = {
		apiVersion: 2
	};

	var oResource = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.Breadcrumbs} oControl An object representation of the control that should be rendered
	 */
	BreadcrumbsRenderer.render = function (oRm, oControl) {
		var aControls = oControl._getControlsForBreadcrumbTrail(),
			oSelect = oControl._getSelect(),
			sSeparator = oControl.getSeparatorStyle();

		oRm.openStart("nav", oControl);
		oRm.class("sapMBreadcrumbs");
		oRm.attr("aria-label", BreadcrumbsRenderer._getResourceBundleText("BREADCRUMB_LABEL"));
		oRm.openEnd();
		oRm.openStart("ol");
		oRm.openEnd();

		if (oSelect.getVisible()) {
			this._renderControlInListItem(oRm, oSelect, sSeparator, false, "sapMBreadcrumbsSelectItem");
		}

		aControls.forEach(function (oChildControl) {
			this._renderControlInListItem(oRm, oChildControl, sSeparator, oChildControl instanceof Text);
		}, this);

		oRm.close("ol");
		oRm.close("nav");
	};

	BreadcrumbsRenderer._renderControlInListItem = function (oRm, oControl, sSeparator, bSkipSeparator, sAdditionalItemClass) {
		oRm.openStart("li");
		oRm.class("sapMBreadcrumbsItem");
		oRm.class(sAdditionalItemClass);
		oRm.openEnd();
		oRm.renderControl(oControl);
		if (!bSkipSeparator) {
			oRm.openStart("span").class("sapMBreadcrumbsSeparator").openEnd().text(sSeparator).close("span");
		}
		oRm.close("li");
	};

	BreadcrumbsRenderer._getResourceBundleText = function (sText) {
		return oResource.getText(sText);
	};

	return BreadcrumbsRenderer;

}, /* bExport= */ true);
