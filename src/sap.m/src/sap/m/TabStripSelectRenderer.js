/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', 'sap/m/SelectRenderer', 'sap/ui/core/ValueStateSupport', 'sap/m/TabStripSelect'],
	function(jQuery, Renderer, SelectRenderer, ValueStateSupport, TabStripSelect) {
		"use strict";

		var TabStripSelectRenderer = Renderer.extend(SelectRenderer);

		TabStripSelectRenderer.render = function(oRm, oSelect) {
			var	sTooltip = ValueStateSupport.enrichTooltip(oSelect, oSelect.getTooltip_AsString()),
			       bEnabled = oSelect.getEnabled(),
			       CSS_CLASS = SelectRenderer.CSS_CLASS;

			oRm.write("<button");

			oRm.addClass('sapMTabStripSelect');

			if (!oSelect.getVisible()) {
				oRm.addStyleClass(TabStripSelect.CSS_CLASS_INVISIBLE);
			}
			this.addStyleClass(oRm, oSelect);
			oRm.addClass(CSS_CLASS);



			oRm.addClass(CSS_CLASS + oSelect.getType());

			if (!bEnabled) {
				oRm.addClass(CSS_CLASS + "Disabled");
			}


			oRm.addClass(CSS_CLASS + "WithArrow");
			oRm.addStyle("max-width", oSelect.getMaxWidth());
			oRm.writeControlData(oSelect);
			oRm.writeStyles();
			oRm.writeClasses();
			this.writeAccessibilityState(oRm, oSelect);

			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
			}

			// by specification we do not this to to be tabbable at all
			oRm.writeAttribute("tabindex", "-1");

			oRm.write(">");

			oRm.write("<div");
			oRm.addClass("sapMSltInner");
			if (bEnabled && sap.ui.Device.system.desktop) {
				oRm.addClass(CSS_CLASS + "Hoverable");
			}
			oRm.writeClasses();
			oRm.write(">");


			if (sap.ui.Device.system.phone)  {
				this.renderLabel(oRm, oSelect);
				this.renderArrow(oRm, oSelect);
			} else {
				this.renderIcon(oRm, oSelect);
			}


			if (oSelect._isRequiredSelectElement()) {
				this.renderSelectElement(oRm, oSelect);
			}

			oRm.write("</div>");
			oRm.write("</button>");
		};

		return TabStripSelectRenderer;

	}, /* bExport= */ true);
