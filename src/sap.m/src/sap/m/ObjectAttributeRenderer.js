/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/library"],
	function(coreLibrary) {
	"use strict";


	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;


	/**
	 * ObjectAttribute renderer.
	 * @namespace
	 */
	var ObjectAttributeRenderer = {
		apiVersion: 2,
		MAX_LINES: {
			SINGLE_LINE: 1
		}
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oOA An object representation of the control that should be rendered
	 */
	ObjectAttributeRenderer.render = function(oRm, oOA) {
		var oParent = oOA.getParent(),
			sTooltip = oOA.getTooltip_AsString();

		oRm.openStart("div", oOA);
		if (oOA._isEmpty()) {
			oRm.class("sapMObjectAttributeDiv");
			oRm.class("sapUiHidden");
			oRm.openEnd();
			oRm.close("div");
			return;
		}

		oRm.class("sapMObjectAttributeDiv");
		// add tabindex, "active" class and ARIA only when the ObjectAttribute is clickable
		// e.g. when is active ot the CustomContent is sap.m.Link
		if (oOA._isClickable()) {
			oRm.class("sapMObjectAttributeActive");
			oRm.attr("tabindex", "0");
			oRm.accessibilityState(oOA, {
				role: "link"
			});
		}

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		oRm.openEnd();

		// If the attribute is link (active or customContent is Link) only the "text" should be clickable,
		// so render title, colon and text in different spans.
		// For the ObjectHeader the rendering of the parts of the ObjectAttribute is always in separate spans, even when it is not active.
		if (oOA._isClickable() || oParent instanceof sap.m.ObjectHeader) {
			this.renderActiveTitle(oRm, oOA);
			this.renderActiveText(oRm, oOA, oParent);
		} else {
			oRm.renderControl(oOA._getUpdatedTextControl());
		}
		oRm.close("div");
	};

	ObjectAttributeRenderer.renderActiveTitle = function (oRm, oOA) {
		if (!oOA.getProperty("title")) {
			return;
		}

		oRm.openStart("span", oOA.getId() + "-title");
		oRm.class("sapMObjectAttributeTitle");
		oRm.openEnd();
		oRm.text(oOA.getProperty("title"));
		oRm.close("span");
		oRm.openStart("span", oOA.getId() + "-colon");
		oRm.class("sapMObjectAttributeColon");
		oRm.openEnd();
		oRm.unsafeHtml(":&nbsp;");
		oRm.close("span");
	};

	ObjectAttributeRenderer.renderActiveText = function (oRm, oOA, oParent) {
		var sTextDir = oOA.getTextDirection(),
			oAttrAggregation = oOA.getAggregation("customContent");

		oRm.openStart("span", oOA.getId() + "-text");
		oRm.class("sapMObjectAttributeText");

		if (sTextDir && sTextDir !== TextDirection.Inherit) {
			oRm.attr("dir", sTextDir.toLowerCase());
		}

		oRm.openEnd();

		if (oAttrAggregation && oParent) {
			if ((oParent instanceof sap.m.ObjectHeader) && !oOA.getParent().getResponsive()) {
				oOA._setControlWrapping(oAttrAggregation, true);
			} else {
				oOA._setControlWrapping(oAttrAggregation, false, ObjectAttributeRenderer.MAX_LINES.SINGLE_LINE);
			}
			oRm.renderControl(oAttrAggregation);
		} else {
			oRm.text(oOA.getProperty("text"));
		}
		oRm.close("span");
	};

	return ObjectAttributeRenderer;

}, /* bExport= */ true);
