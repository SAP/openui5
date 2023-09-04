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


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.Breadcrumbs} oControl An object representation of the control that should be rendered
	 */
	BreadcrumbsRenderer.render = function (oRm, oControl) {
		var aControls = oControl._getControlsForBreadcrumbTrail(),
			oSelect = oControl._getSelect(),
			sSeparator = oControl._sSeparatorSymbol,
			sDefaultAriaLabelledBy = oControl._getInvisibleText().getId(),
			aAriaLabelledBy = oControl.getAriaLabelledBy().slice();

		oRm.openStart("nav", oControl);
		oRm.class("sapMBreadcrumbs");

		aAriaLabelledBy.push(sDefaultAriaLabelledBy);

		oRm.accessibilityState(null, {
			labelledby: {
				value: aAriaLabelledBy.join(" "),
				append: true
			}
		});

		if (oControl._iMinWidth && oControl._iMinWidth !== oControl.MIN_WIDTH_IN_OFT) {
			oRm.style("min-width", oControl._iMinWidth + "px");
		}

		oRm.openEnd();
		oRm.openStart("ol");
		oRm.openEnd();

		if (oSelect.getVisible()) {
			this._renderControlInListItem(oRm, oSelect, sSeparator, false, "sapMBreadcrumbsSelectItem");
		}

		aControls.forEach(function (oChildControl, iIndex) {
			this._renderControlInListItem(oRm, oChildControl, sSeparator, oChildControl instanceof Text, undefined, iIndex, aControls.length);
		}, this);

		oRm.close("ol");
		oRm.close("nav");
	};

	BreadcrumbsRenderer._renderControlInListItem = function (oRm, oControl, sSeparator, bSkipSeparator, sAdditionalItemClass, iIndex, iVisibleItemsCount) {
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


	return BreadcrumbsRenderer;

}, /* bExport= */ true);
