/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class Switch renderer.
	 * @static
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
	
		// suppress rendering if not visible
		if (!oSwitch.getVisible()) {
			return;
		}
	
		oRm.write('<div');
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
	
		oRm.write(">");
		oRm.write('<div class="' + CSS_CLASS + 'Inner">');
	
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
			bDefaultType = oSwitch.getType() === "Default";
	
		// on
		oRm.write('<div class="' + CSS_CLASS + 'Text ' + CSS_CLASS + 'TextOn">');
		oRm.write("<span>");
	
		if (bDefaultType) {
			oRm.writeEscaped(oSwitch._sOn);
		}
	
		oRm.write("</span>");
		oRm.write("</div>");
	
		// off
		oRm.write('<div class="' + CSS_CLASS + 'Text ' + CSS_CLASS + 'TextOff">');
		oRm.write("<span>");
	
		if (bDefaultType) {
			oRm.writeEscaped(oSwitch._sOff);
		}
	
		oRm.write("</span>");
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

	return SwitchRenderer;

}, /* bExport= */ true);
