/*!
 * ${copyright}
 */

sap.ui.define(["./MessageStripUtilities"],
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
		oRm.writeIcon(MSUtils.getIconURI.call(oControl), null, {
			"title": null // prevent the icon title (icon is only decorative)
		});
		oRm.write("</div>");
	};

	MessageStripRenderer.renderTextAndLink = function (oRm, oControl) {
		var oFormattedText = oControl.getAggregation("_formattedText");

		oRm.write("<div class='" + MSUtils.CLASSES.MESSAGE + "'>");

		// Determine if Formatted text control should be rendered or plain text control on "enableFormattedText" property
		if (oControl.getEnableFormattedText() && oFormattedText) {
			oRm.renderControl(oFormattedText);
		} else {
			oRm.renderControl(oControl.getAggregation("_text"));
		}

		oRm.renderControl(oControl.getLink());
		oRm.write("</div>");
	};

	MessageStripRenderer.renderCloseButton = function (oRm) {
		oRm.write("<button");
		oRm.writeAttribute("class", MSUtils.CLASSES.CLOSE_BUTTON);
		oRm.writeAttribute("title",
			sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("MESSAGE_STRIP_CLOSE_BUTTON"));
		oRm.write("></button>");
	};

	MessageStripRenderer.endMessageStrip = function (oRm) {
		oRm.write("</div>");
	};

	return MessageStripRenderer;
}, /* bExport= */ true);
