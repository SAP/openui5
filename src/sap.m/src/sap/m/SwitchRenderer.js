/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
		"use strict";

		/**
		 * Switch renderer.
		 * @namespace
		 */
		var SwitchRenderer = {};

		/**
		 * CSS class to be applied to the HTML root element of the Switch control.
		 *
		 * @type {string}
		 */
		SwitchRenderer.CSS_CLASS = "sapMSwt";

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer.
		 * @param {sap.ui.core.Control} oSwitch An object representation of the control that should be rendered.
		 */
		SwitchRenderer.render = function(oRm, oSwitch) {
			var bState = oSwitch.getState(),
				sState = bState ? oSwitch._sOn : oSwitch._sOff,
				sTooltip = oSwitch.getTooltip_AsString(),
				bEnabled = oSwitch.getEnabled(),
				sName = oSwitch.getName(),
				CSS_CLASS = SwitchRenderer.CSS_CLASS;

			oRm.write("<div");
			oRm.addClass(CSS_CLASS + "Cont");

			if (!bEnabled) {
				oRm.addClass(CSS_CLASS + "ContDisabled");
			}

			oRm.writeClasses();
			oRm.writeStyles();
			oRm.writeControlData(oSwitch);

			if (bEnabled) {
				oRm.writeAttribute("tabindex", "0");
			}

			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
			}

			this.writeAccessibilityState(oRm, oSwitch);

			oRm.write("><div");
			oRm.writeAttribute("id", oSwitch.getId() + "-switch");
			oRm.addClass(CSS_CLASS);
			oRm.addClass(bState ? CSS_CLASS + "On" : CSS_CLASS + "Off");
			oRm.addClass(CSS_CLASS + oSwitch.getType());

			if (sap.ui.Device.system.desktop && bEnabled) {
				oRm.addClass(CSS_CLASS + "Hoverable");
			}

			if (!bEnabled) {
				oRm.addClass(CSS_CLASS + "Disabled");
			}

			oRm.writeClasses();

			oRm.write("><div");
			oRm.addClass(CSS_CLASS + "Inner");
			oRm.writeAttribute("id", oSwitch.getId() + "-inner");
			oRm.writeClasses();
			oRm.write(">");

			// text
			this.renderText(oRm, oSwitch);

			// handle
			this.renderHandle(oRm, oSwitch, sState);

			oRm.write("</div>");
			oRm.write("</div>");

			if (sName) {

				// checkbox
				this.renderCheckbox(oRm, oSwitch, sState);
			}

			oRm.write("</div>");
		};

		SwitchRenderer.renderText = function(oRm, oSwitch) {
			var CSS_CLASS = SwitchRenderer.CSS_CLASS,
				bType = oSwitch.getType(),
				bDefaultType = bType === sap.m.SwitchType.Default,
				bAcceptRejectType = bType === sap.m.SwitchType.AcceptReject,
				bState = oSwitch.getState(),
				bAccessibility = sap.ui.getCore().getConfiguration().getAccessibility(),
				oRb = oSwitch.constructor._oRb;

			// on
			oRm.write("<div");
			oRm.addClass(CSS_CLASS + "Text");
			oRm.addClass(CSS_CLASS + "TextOn");
			oRm.writeAttribute("id", oSwitch.getId() + "-texton");

			if (!bState) {
				oRm.writeAttribute("aria-hidden", "true");
			}

			oRm.writeClasses();
			oRm.write(">");
			oRm.write("<span");
			oRm.addClass(CSS_CLASS + "Label");
			oRm.addClass(CSS_CLASS + "LabelOn");
			oRm.writeClasses();
			oRm.write(">");

			if (bDefaultType) {
				oRm.writeEscaped(oSwitch._sOn);
			}

			oRm.write("</span>");

			if (bAcceptRejectType && bAccessibility) {
				this.renderInvisibleElement(oRm, oSwitch, oRb.getText("SWITCH_ARIA_ACCEPT"));
			}

			oRm.write("</div>");

			// off
			oRm.write("<div");
			oRm.addClass(CSS_CLASS + "Text");
			oRm.addClass(CSS_CLASS + "TextOff");
			oRm.writeAttribute("id", oSwitch.getId() + "-textoff");

			if (bState) {
				oRm.writeAttribute("aria-hidden", "true");
			}

			oRm.writeClasses();
			oRm.write(">");
			oRm.write("<span");
			oRm.addClass(CSS_CLASS + "Label");
			oRm.addClass(CSS_CLASS + "LabelOff");
			oRm.writeClasses();
			oRm.write(">");

			if (bDefaultType) {
				oRm.writeEscaped(oSwitch._sOff);
			}

			oRm.write("</span>");

			if (bAcceptRejectType && bAccessibility) {
				this.renderInvisibleElement(oRm, oSwitch, oRb.getText("SWITCH_ARIA_REJECT"));
			}

			oRm.write("</div>");
		};

		SwitchRenderer.renderHandle = function(oRm, oSwitch, sState) {
			var CSS_CLASS = SwitchRenderer.CSS_CLASS;

			oRm.write("<div");
			oRm.writeAttribute("id", oSwitch.getId() + "-handle");
			oRm.writeAttributeEscaped("data-sap-ui-swt", sState);
			oRm.addClass(CSS_CLASS + "Handle");

			if (sap.ui.Device.browser.webkit && Number(sap.ui.Device.browser.webkitVersion).toFixed(2) === "537.35") {
				oRm.addClass(CSS_CLASS + "WebKit537-35");
			}

			oRm.writeClasses();
			oRm.write("></div>");
		};

		SwitchRenderer.renderCheckbox = function(oRm, oSwitch, sState) {
			oRm.write('<input type="checkbox"');
			oRm.writeAttribute("id", oSwitch.getId() + "-input");
			oRm.writeAttributeEscaped("name", oSwitch.getName());
			oRm.writeAttributeEscaped("value", sState);

			if (oSwitch.getState()) {
				oRm.writeAttribute("checked", "checked");
			}

			if (!oSwitch.getEnabled()) {
				oRm.writeAttribute("disabled", "disabled");
			}

			oRm.write(">");
		};

		/**
		 * Writes the accessibility state.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSwitch An object representation of the control that should be rendered.
		 */
		SwitchRenderer.writeAccessibilityState = function(oRm, oSwitch) {
			var sLabelledbyId = oSwitch.getId() + (oSwitch.getState() ? "-texton" : "-textoff");

			oRm.writeAccessibilityState(oSwitch, {
				role: "checkbox",
				checked: oSwitch.getState(),
				labelledby: {
					value: sLabelledbyId,
					append: true
				}
			});
		};

		/**
		 * Writes an invisible span element with a text node that is referenced in the ariaLabelledBy
		 * associations for screen reader announcement.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSwitch An object representation of the control that should be rendered.
		 * @param {string} sText
		 */
		SwitchRenderer.renderInvisibleElement = function(oRm, oSwitch, sText) {
			oRm.write('<span aria-hidden="true" style="display: none">');
			oRm.writeEscaped(sText);
			oRm.write("</span>");
		};

		return SwitchRenderer;

	}, /* bExport= */ true);