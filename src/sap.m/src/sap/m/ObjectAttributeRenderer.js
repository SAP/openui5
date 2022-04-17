/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/library"],
	function(coreLibrary) {
	"use strict";


	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.aria.HasPopup
	var AriaHasPopup = coreLibrary.aria.HasPopup;
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
	 * @param {sap.m.ObjectAttribute} oOA An object representation of the control that should be rendered
	 */
	ObjectAttributeRenderer.render = function(oRm, oOA) {
		var oParent = oOA.getParent(),
			sTooltip = oOA.getTooltip_AsString(),
			sTextDir = oOA.getTextDirection();

		oRm.openStart("div", oOA);
		if (oOA._isEmpty()) {
			oRm.class("sapMObjectAttributeDiv");
			oRm.class("sapUiHidden");
			oRm.openEnd();
			oRm.close("div");
			return;
		}

		oRm.class("sapMObjectAttributeDiv");

		if (sTextDir !== TextDirection.Inherit) {
			oRm.attr("dir", sTextDir.toLowerCase());
		}

		// add tabindex, "active" class and ARIA only when the ObjectAttribute is clickable
		// e.g. when is active or the CustomContent is sap.m.Link
		if (oOA._isClickable()) {
			oRm.class("sapMObjectAttributeActive");
			if (!oOA.getTitle() && oOA.getText()) {
			// in case of title only or text only, allow 100% of width to be taken
				oRm.class("sapMObjectAttributeTextOnly");
			}
		}


		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		oRm.openEnd();

		// If the attribute is link (active or customContent is Link) only the "text" should be clickable,
		// so render title, colon and text in different spans.
		// For the ObjectHeader the rendering of the parts of the ObjectAttribute is always in separate spans, even when it is not active.
		if (oOA._isClickable() || (oParent && oParent.isA("sap.m.ObjectHeader"))) {
			this.renderActiveTitle(oRm, oOA);
			this.renderActiveText(oRm, oOA, oParent);
		} else {
			oRm.renderControl(oOA._getUpdatedTextControl());
			if (oOA._bEmptyIndicatorMode) {
				oRm.renderControl(oOA.getAggregation("_textControl"));
			}
		}
		oRm.close("div");
	};

	ObjectAttributeRenderer.renderActiveTitle = function(oRm, oOA) {
		var sColon,
			bRenderBDI = oOA.getTextDirection() === TextDirection.Inherit;

		if (!oOA.getProperty("title")) {
			return;
		}

		sColon = ": ";

		oRm.openStart("span", oOA.getId() + "-title");
		oRm.class("sapMObjectAttributeTitle");
		oRm.openEnd();

		if (bRenderBDI) {
			oRm.openStart("bdi");
			oRm.openEnd();
		}

		oRm.text(oOA.getProperty("title"));

		if (bRenderBDI) {
			oRm.close("bdi");
		}

		oRm.close("span");

		oRm.openStart("span", oOA.getId() + "-colon");
		oRm.class("sapMObjectAttributeColon");
		oRm.openEnd();
		if (sap.ui.getCore().getConfiguration().getLocale().getLanguage().toLowerCase() === "fr") {
			sColon = " " + sColon;
		}
		oRm.text(sColon);
		oRm.close("span");
	};

	ObjectAttributeRenderer.renderActiveText = function (oRm, oOA, oParent) {
		var oAttrAggregation = oOA.getAggregation("customContent"),
			bRenderBDI = oOA.getTextDirection() === TextDirection.Inherit,
			sAriaHasPopup = (oOA.getAriaHasPopup() === AriaHasPopup.None) ? "" : oOA.getAriaHasPopup().toLowerCase();

		oRm.openStart("span", oOA.getId() + "-text");
		oRm.class("sapMObjectAttributeText");
		if (oAttrAggregation && oAttrAggregation.isA("sap.m.Link")) {
			oAttrAggregation.setAriaHasPopup(oOA.getAriaHasPopup());
		} else if (oOA.getText() && oOA.getActive()) {
			oRm.attr("tabindex", "0");
			oRm.attr("role", "link");
			if (sAriaHasPopup) {
				oRm.attr("aria-haspopup", sAriaHasPopup);
			}
		}
		oRm.openEnd();

		if (oAttrAggregation && oParent) {
			if (oParent.isA("sap.m.ObjectHeader") && !oOA.getParent().getResponsive()) {
				oOA._setControlWrapping(oAttrAggregation, true);
			} else {
				oOA._setControlWrapping(oAttrAggregation, false, ObjectAttributeRenderer.MAX_LINES.SINGLE_LINE);
			}
			oRm.renderControl(oAttrAggregation);
		} else {
			if (bRenderBDI) {
				oRm.openStart("bdi");
				oRm.openEnd();
			}

			oRm.text(oOA.getProperty("text"));

			if (bRenderBDI) {
				oRm.close("bdi");
			}
		}
		oRm.close("span");
	};

	return ObjectAttributeRenderer;

}, /* bExport= */ true);
