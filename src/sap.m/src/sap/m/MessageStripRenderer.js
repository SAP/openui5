/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/MessageStripUtilities"],
	function (MSUtils) {
	"use strict";

	/**
	 * MessageStrip renderer.
	 * @namespace
	 */
	var MessageStripRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	MessageStripRenderer.render = function(oRm, oControl) {
		this.startMessageStrip(oRm, oControl);
		this.renderAriaTypeText(oRm, oControl);

		if (oControl.getShowIcon()) {
			this.renderIcon(oRm, oControl);
		}

		this.renderTextAndLink(oRm, oControl);

		if (oControl.getShowCloseButton()) {
			this.renderCloseButton(oRm);
		}

		this.endMessageStrip(oRm);
	};

	MessageStripRenderer.startMessageStrip = function (oRm, oControl) {
		oRm.write("<div");
		oRm.addClass(MSUtils.CLASSES.ROOT);
		oRm.addClass(MSUtils.CLASSES.ROOT + oControl.getType());

		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.writeAttribute(MSUtils.ATTRIBUTES.CLOSABLE, oControl.getShowCloseButton());
		oRm.writeAccessibilityState(oControl, MSUtils.getAccessibilityState.call(oControl));
		oRm.write(">");
	};

	MessageStripRenderer.renderAriaTypeText = function (oRm, oControl) {
		oRm.write("<span class='sapUiPseudoInvisibleText'>");
		oRm.write(MSUtils.getAriaTypeText.call(oControl));
		oRm.write("</span>");
	};

	MessageStripRenderer.renderIcon = function (oRm, oControl) {
		oRm.write("<div class='" + MSUtils.CLASSES.ICON + "'>");
		oRm.writeIcon(oControl.getCustomIcon());
		oRm.write("</div>");
	};

	MessageStripRenderer.renderTextAndLink = function (oRm, oControl) {
		oRm.write("<div class='" + MSUtils.CLASSES.MESSAGE + "'>");
		oRm.renderControl(oControl.getAggregation("_text"));
		oRm.renderControl(oControl.getLink());
		oRm.write("</div>");
	};

	MessageStripRenderer.renderCloseButton = function (oRm) {
		oRm.write("<button");
		oRm.writeAttribute("class", MSUtils.CLASSES.CLOSE_BUTTON);
		oRm.writeAttribute("aria-label", MSUtils.RESOURCE_BUNDLE.getText("CLOSE"));
		oRm.write("></button>");
	};

	MessageStripRenderer.endMessageStrip = function (oRm) {
		oRm.write("</div>");
	};

	return MessageStripRenderer;
}, /* bExport= */ true);
