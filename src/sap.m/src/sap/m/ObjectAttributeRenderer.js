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

		if (oOA._isEmpty()) {
			oRm.write("<div");
			oRm.writeControlData(oOA);
			oRm.addClass("sapMObjectAttributeDiv");
			oRm.addClass("sapUiHidden");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("</div>");
			return;
		}

		oRm.write("<div");
		oRm.writeControlData(oOA);
		oRm.addClass("sapMObjectAttributeDiv");
		// add tabindex, "active" class and ARIA only when the ObjectAttribute is clickable
		// e.g. when is active ot the CustomContent is sap.m.Link
		if (oOA._isClickable()) {
			oRm.addClass("sapMObjectAttributeActive");
			oRm.writeAttribute("tabindex", "0");
			oRm.writeAccessibilityState(oOA, {
				role: "link"
			});
		}
		oRm.writeClasses();

		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		oRm.write(">");

		// If the attribute is link (active or customContent is Link) only the "text" should be clickable,
		// so render title, colon and text in different spans.
		// For the ObjectHeader the rendering of the parts of the ObjectAttribute is always in separate spans, even when it is not active.
		if (oOA._isClickable() || oParent instanceof sap.m.ObjectHeader) {
			this.renderActiveTitle(oRm, oOA);
			this.renderActiveText(oRm, oOA, oParent);
		} else {
			oRm.renderControl(oOA._getUpdatedTextControl());
		}
		oRm.write("</div>");
	};

	ObjectAttributeRenderer.renderActiveTitle = function (oRm, oOA) {
		if (!oOA.getProperty("title")) {
			return;
		}
		oRm.write("<span id=\"" + oOA.getId() + "-title\"");
		oRm.addClass("sapMObjectAttributeTitle");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(oOA.getProperty("title"));
		oRm.write("</span>");
		oRm.write("<span id=\"" + oOA.getId() + "-colon\"");
		oRm.addClass("sapMObjectAttributeColon");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write(":&nbsp;");
		oRm.write("</span>");
	};

	ObjectAttributeRenderer.renderActiveText = function (oRm, oOA, oParent) {
		var sTextDir = oOA.getTextDirection(),
			oAttrAggregation = oOA.getAggregation("customContent");

		oRm.write("<span id=\"" + oOA.getId() + "-text\"");
		oRm.addClass("sapMObjectAttributeText");

		if (sTextDir && sTextDir !== TextDirection.Inherit) {
			oRm.writeAttribute("dir", sTextDir.toLowerCase());
		}

		oRm.writeClasses();
		oRm.write(">");

		if (oAttrAggregation && oParent) {
			if ((oParent instanceof sap.m.ObjectHeader) && !oOA.getParent().getResponsive()) {
				oOA._setControlWrapping(oAttrAggregation, true);
			} else {
				oOA._setControlWrapping(oAttrAggregation, false, ObjectAttributeRenderer.MAX_LINES.SINGLE_LINE);
			}
			oRm.renderControl(oAttrAggregation);
		} else {
			oRm.writeEscaped(oOA.getProperty("text"));
		}
		oRm.write("</span>");
	};

	return ObjectAttributeRenderer;

}, /* bExport= */ true);
